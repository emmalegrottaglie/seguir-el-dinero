import { promises as fs } from "node:fs";
import path from "node:path";
import type { Snapshot } from "./types";

// ------------------------------------------------------------------ //
// Snapshot storage with two backends:
//   • Vercel KV / Upstash Redis (REST) — used in production when its env
//     vars are present. Survives Vercel's read-only filesystem.
//   • Local filesystem (data/subsidies.json) — dev default and the always
//     present fallback (the committed seed ships with the repo).
// The KV path uses plain fetch against the Upstash REST API, so there is no
// SDK dependency to keep in sync.
// ------------------------------------------------------------------ //

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "subsidies.json");
const KEY = "snapshot:subsidies";

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function backendName(): "kv" | "filesystem" {
  return KV_URL && KV_TOKEN ? "kv" : "filesystem";
}

async function kvGet(): Promise<Snapshot | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  const res = await fetch(`${KV_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result: string | null };
  if (!data.result) return null;
  try {
    return JSON.parse(data.result) as Snapshot;
  } catch {
    return null;
  }
}

async function kvSet(snapshot: Snapshot): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  const res = await fetch(`${KV_URL}/set/${KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "text/plain",
    },
    body: JSON.stringify(snapshot),
  });
  return res.ok;
}

async function fileGet(): Promise<Snapshot> {
  const raw = await fs.readFile(SNAPSHOT_PATH, "utf-8");
  return JSON.parse(raw) as Snapshot;
}

// Read the current snapshot: KV first (if configured), else the committed file.
export async function readSnapshot(): Promise<Snapshot> {
  const fromKv = await kvGet();
  if (fromKv) return fromKv;
  return fileGet();
}

// Persist a snapshot to whichever backend is available. On Vercel the KV write
// is authoritative; the filesystem write is best-effort and silently skipped
// when the FS is read-only.
export async function writeSnapshot(snapshot: Snapshot): Promise<"kv" | "filesystem"> {
  if (await kvSet(snapshot)) return "kv";
  await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 0), "utf-8");
  return "filesystem";
}
