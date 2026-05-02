import { type NextRequest, NextResponse } from "next/server";
import { groq } from "next-sanity";
import { client } from "@/lib/sanity/client";
import { writeClient } from "@/lib/sanity/writeClient";

const TOP_N = 10;

const LEADERBOARD_QUERY = groq`
  *[_type == "score"] | order(score desc) [0...${TOP_N}] {
    _id, playerName, score, stageReached, createdAt
  }
`;

/* ── GET /api/scores — public leaderboard ─────────────────────────────────── */
export async function GET() {
  try {
    const scores = await client.fetch(LEADERBOARD_QUERY, {}, { next: { revalidate: 30 } });
    return NextResponse.json({ scores });
  } catch {
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}

/* ── POST /api/scores — save new score ───────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      playerName?: unknown;
      score?: unknown;
      stageReached?: unknown;
    };

    // ── Validate ──
    const rawName = String(body.playerName ?? "")
      .trim()
      .toUpperCase();
    const rawScore = Number(body.score);
    const rawStage = Number(body.stageReached);

    if (!rawName || rawName.length < 1 || rawName.length > 12) {
      return NextResponse.json({ error: "playerName must be 1–12 characters" }, { status: 400 });
    }
    if (!Number.isFinite(rawScore) || rawScore < 0) {
      return NextResponse.json({ error: "score must be a non-negative number" }, { status: 400 });
    }
    if (![1, 2, 3].includes(rawStage)) {
      return NextResponse.json({ error: "stageReached must be 1, 2, or 3" }, { status: 400 });
    }

    // ── Sanitise name (alphanumeric + common chars only) ──
    const safeName = rawName.replace(/[^A-Z0-9_ \-!?.]/g, "").slice(0, 12);
    if (!safeName) {
      return NextResponse.json(
        { error: "playerName contains no valid characters" },
        { status: 400 }
      );
    }

    const doc = await writeClient.create({
      _type: "score",
      playerName: safeName,
      score: Math.floor(rawScore),
      stageReached: rawStage,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/scores]", err);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
