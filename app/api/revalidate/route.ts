import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const SANITY_TYPE_TO_TAG: Record<string, string> = {
  project: "project",
  experience: "experience",
  certificate: "certificate",
  siteSettings: "siteSettings",
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get("sanity-webhook-signature");
  const expected = process.env.SANITY_WEBHOOK_SECRET;

  // Verify shared secret (simple header check)
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { _type?: string; slug?: { current?: string } };
    const tag = body._type ? (SANITY_TYPE_TO_TAG[body._type] ?? body._type) : null;

    if (tag) {
      revalidateTag(tag, {});
      // If it's a project, also revalidate its slug-specific tag
      if (body._type === "project" && body.slug?.current) {
        revalidateTag(`project:${body.slug.current}`, {});
      }
    } else {
      // Revalidate everything
      Object.values(SANITY_TYPE_TO_TAG).forEach((t) => revalidateTag(t, {}));
    }

    return NextResponse.json({ revalidated: true, tag });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
