import { promises as fs } from "node:fs";
import path from "node:path";

export interface Portrait {
  name: string;
  url: string;
  width: number;
  height: number;
  licence: string;
  author: string | null;
  articleUrl: string;
  fileUrl: string;
}

interface PhotosFile {
  generatedAt: string;
  source: { name: string; url: string };
  count: number;
  photos: Record<string, Portrait>;
}

const FILE = path.join(process.cwd(), "data", "photos.json");
let cache: PhotosFile | null = null;

async function load(): Promise<PhotosFile> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(FILE, "utf-8")) as PhotosFile;
  } catch {
    cache = { generatedAt: "", source: { name: "", url: "" }, count: 0, photos: {} };
  }
  return cache;
}

// Same order-independent, accent-folded key the fetch script writes.
function key(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

// A portrait only exists when the Wikipedia article title matched the person's
// name exactly, so a hit here is not a guess. Returns null when unknown.
export async function portraitFor(name: string): Promise<Portrait | null> {
  const data = await load();
  return data.photos[key(name)] ?? null;
}

export async function photoSource(): Promise<PhotosFile["source"]> {
  return (await load()).source;
}
