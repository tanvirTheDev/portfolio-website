/**
 * Server-only Sanity client with write permissions.
 * Import ONLY in API routes (never in client components).
 * Uses SANITY_API_TOKEN which must have "Editor" role.
 */
import { createClient } from "next-sanity";
import { env } from "@/sanity/env";

if (!process.env.SANITY_API_TOKEN) {
  throw new Error("SANITY_API_TOKEN is not set — required for write operations.");
}

export const writeClient = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false, // always fresh for writes
});
