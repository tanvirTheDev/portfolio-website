/**
 * Seed script — populates Sanity with placeholder content from the prototype.
 * Run: npm run seed
 * Requires SANITY_API_TOKEN and NEXT_PUBLIC_SANITY_* in .env.local
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load .env.local ───────────────────────────────────────────────────────────

try {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  // Split on CRLF or LF — .env.local on Windows has \r\n line endings
  for (const line of raw.split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq < 1 || line.trimStart().startsWith("#")) continue;
    const key = line.slice(0, eq).trim();
    const val = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) process.env[key] = val;
  }
} catch {
  // .env.local not found — rely on env already set in shell
}

// ── Validate required vars ────────────────────────────────────────────────────

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-04-26";
const token = process.env.SANITY_API_TOKEN;

if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set.");
if (!token) throw new Error("SANITY_API_TOKEN is not set.");

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

// ── Helper: portable text paragraph ──────────────────────────────────────────

function pt(text: string) {
  return [
    {
      _type: "block",
      _key: Math.random().toString(36).slice(2),
      style: "normal",
      children: [{ _type: "span", _key: Math.random().toString(36).slice(2), text, marks: [] }],
      markDefs: [],
    },
  ];
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const projects = [
  {
    _id: "project-001",
    _type: "project",
    title: "DRIFT ENGINE",
    slug: { _type: "slug", current: "drift-engine" },
    tagline:
      "Real-time multiplayer physics simulation engine — 120 Hz, sub-10 ms p95 at 4 K concurrent sessions.",
    status: "SHIPPED",
    year: "2025",
    order: 1,
    publishedAt: "2025-11-14T00:00:00Z",
    stack: ["Rust", "WASM", "WebRTC", "UDP"],
    features: [
      "Custom ECS (Entity-Component-System) architecture",
      "120 Hz authoritative server tick rate",
      "Sub-10 ms p95 latency at 4 000 concurrent sessions",
      "Deterministic replay for debugging and spectating",
      "Zero GC pauses on hot paths",
    ],
    problem: pt(
      "Existing multiplayer physics engines sacrifice either fidelity or scale. AAA engines tie you to their runtime. Open-source options top out at a few hundred concurrent sessions before latency degrades. We needed deterministic physics at 4 K concurrent sessions with p95 under 10 ms — and we needed to own every layer of the stack."
    ),
    challenges: pt(
      "Making the simulation fully deterministic across different CPU architectures required replacing all floating-point operations with fixed-point arithmetic. The reconciliation protocol needed to handle packet reordering, duplication, and loss simultaneously without client-side stutter. Getting to zero GC pauses meant rewriting the hot path allocator entirely."
    ),
    architecture: pt(
      "Rust core compiled to WASM for the browser client; native binary for the server. Transport layer uses WebRTC data channels (UDP semantics) with a custom sequencing protocol on top. ECS core: archetypes stored in contiguous memory, system execution scheduled by dependency graph."
    ),
  },
  {
    _id: "project-002",
    _type: "project",
    title: "COLDLINE",
    slug: { _type: "slug", current: "coldline" },
    tagline:
      "Distributed tracing for microservice meshes. CLI-only. 800 K spans/s. No dashboard required.",
    status: "OPEN SOURCE",
    year: "2025",
    order: 2,
    publishedAt: "2025-08-07T00:00:00Z",
    stack: ["Go", "OpenTelemetry", "gRPC", "BadgerDB"],
    features: [
      "Ingests OpenTelemetry spans via gRPC and HTTP",
      "Surfaces anomalous call chains in under 200 ms",
      "CLI-only interface — no web dashboard",
      "800 K spans/s sustained throughput",
      "Ships as a single static binary",
    ],
    problem: pt(
      "Every distributed tracing tool assumes you want a UI. Engineers who know what they're looking for want a fast query interface, not a dashboard. Coldline is built for the operator who SSHes into a machine at 2am and needs answers immediately."
    ),
    challenges: pt(
      "Achieving 800 K spans/s on commodity hardware required careful batching at the ingestion boundary and a write-optimised storage layout. The anomaly detection algorithm had to be incremental — we couldn't afford a full-scan per query. We ended up with a sketch-based approach that gives probabilistic guarantees with constant memory."
    ),
    architecture: pt(
      "Single binary, no external dependencies. Collector sidecar forwards spans via gRPC. Storage: BadgerDB (LSM tree, optimised for write-heavy workloads). Query engine: custom cursor-based traversal over span DAGs. CLI built with Cobra."
    ),
    githubUrl: "https://github.com",
  },
  {
    _id: "project-003",
    _type: "project",
    title: "THRESHOLD",
    slug: { _type: "slug", current: "threshold" },
    tagline:
      "ML-driven alerting that learns per-service baselines. Eliminates 91 % of false positive pages in 72 h.",
    status: "BETA",
    year: "2026",
    order: 3,
    publishedAt: "2026-01-30T00:00:00Z",
    stack: ["Python", "C++", "Isolation Forest", "Prometheus"],
    features: [
      "Learns per-service baselines automatically — no configuration",
      "Eliminates 91 % of false positive alerts within 72 h of deployment",
      "Ships as a single binary with embedded model",
      "Prometheus-compatible metrics endpoint",
      "Hot-reload model updates without downtime",
    ],
    problem: pt(
      "Alert fatigue kills on-call rotations. Teams either set thresholds too high (miss real incidents) or too low (cry wolf constantly). Static thresholds cannot adapt to weekly traffic patterns, deployment spikes, or seasonal load. Threshold learns what normal looks like for each service and pages only on genuine anomalies."
    ),
    challenges: pt(
      "The Isolation Forest model needed to be small enough to embed in a binary but accurate enough to be useful from day one. Cold-start performance was the hardest problem — we needed the model to be useful before it had enough history to be statistically confident. We solved this with a conservative prior that relaxes as observations accumulate."
    ),
    architecture: pt(
      "Core model: Isolation Forest implemented in C++ with Python bindings for training. Binary packages the trained model as compressed bytes. Metrics scraping via the Prometheus client library. Model updates are distributed as signed binary patches."
    ),
  },
];

const experiences = [
  {
    _id: "experience-001",
    _type: "experience",
    company: "NULL SYSTEMS",
    title: "Senior Software Engineer",
    dateStart: "2023",
    dateEnd: undefined,
    location: "REMOTE",
    order: 1,
    bullets: [
      "Designed and shipped Drift Engine — real-time multiplayer physics at 4 K concurrent sessions",
      "Reduced p95 API latency by 68 % through ECS architecture redesign and fixed-point arithmetic port",
      "Led a team of 4 engineers; introduced ADR practice and mandatory benchmark gates",
      "Authored the transport reconciliation protocol now used across 3 separate product lines",
    ],
    stack: ["Rust", "Go", "WebRTC", "Kubernetes", "Prometheus"],
  },
  {
    _id: "experience-002",
    _type: "experience",
    company: "VECTOR LABS",
    title: "Software Engineer",
    dateStart: "2021",
    dateEnd: "2023",
    location: "NEW YORK",
    order: 2,
    bullets: [
      "Built the distributed tracing pipeline that became the foundation for Coldline (open-sourced 2025)",
      "Migrated monolith to microservices — zero downtime, phased over 14 months",
      "Implemented ML-based anomaly detection reducing on-call pages by 40 %",
      "Mentored 2 junior engineers; both promoted within 18 months",
    ],
    stack: ["Go", "Python", "gRPC", "Kafka", "PostgreSQL"],
  },
];

const certificates = [
  {
    _id: "certificate-001",
    _type: "certificate",
    name: "Certified Kubernetes Administrator",
    issuer: "Cloud Native Computing Foundation",
    date: "2024-03-15",
    credentialId: "CKA-2024-031587",
    verifyUrl: "https://www.cncf.io/certification/cka/",
    order: 1,
  },
  {
    _id: "certificate-002",
    _type: "certificate",
    name: "AWS Solutions Architect — Professional",
    issuer: "Amazon Web Services",
    date: "2023-11-02",
    credentialId: "AWS-SAP-2023-112847",
    verifyUrl: "https://aws.amazon.com/certification/",
    order: 2,
  },
];

const siteSettings = {
  _id: "siteSettings",
  _type: "siteSettings",
  name: "ALEX CRANE",
  tagline: "FULL-STACK ENGINEER · NULL_DEV",
  email: "hello@example.com",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  mediumUsername: "example",
};

// ── Upload ────────────────────────────────────────────────────────────────────

async function seed() {
  const docs = [...projects, ...experiences, ...certificates, siteSettings];

  console.info(`\nSeeding ${docs.length} documents to ${dataset}…\n`);

  const tx = client.transaction();
  for (const doc of docs) {
    tx.createOrReplace(doc as Parameters<typeof tx.createOrReplace>[0]);
  }

  await tx.commit();
  console.info("✓ Seed complete.\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
