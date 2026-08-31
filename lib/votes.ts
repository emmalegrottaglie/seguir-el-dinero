import { promises as fs } from "node:fs";
import path from "node:path";

export type Ballot = "Sí" | "No" | "Abstención" | "No vota" | string;

export interface DeputyVote {
  deputy: string; // "Apellidos, Nombre" as published
  group: string; // parliamentary group code
  vote: Ballot;
}

export type VoteKind = "ley" | "toma" | "pnl" | "mocion";

export interface KeyVote {
  id: string;
  topic: string;
  topicLabel: string;
  kind: VoteKind;
  kindLabel: string;
  /** true for votes with legal effect; false for non-binding motions. */
  binding: boolean;
  law: string;
  lawUrl: string | null;
  legislature: string;
  session: number | null;
  number: number | null;
  date: string;
  title: string;
  expediente: string;
  totals: {
    presentes: number;
    afavor: number;
    enContra: number;
    abstenciones: number;
    noVotan: number;
  };
  sourceUrl: string;
  votes: DeputyVote[];
}

export interface VotesData {
  generatedAt: string;
  source: { name: string; url: string };
  topics: { id: string; label: string }[];
  count: number;
  votes: KeyVote[];
}

const FILE = path.join(process.cwd(), "data", "votes.json");
let cache: VotesData | null = null;

export async function getVotes(): Promise<VotesData> {
  if (cache) return cache;
  cache = JSON.parse(await fs.readFile(FILE, "utf-8")) as VotesData;
  return cache;
}

// Names appear as "Apellidos, Nombre" in the roll call and "Nombre Apellidos" in
// the salary register, so compare order-independent sets of accent-folded tokens.
export function nameKey(name: string): string {
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

export interface RecordedPosition {
  vote: KeyVote;
  ballot: Ballot;
  group: string;
}

// Every recorded position for one person. Empty when the person has no roll-call
// record — the app shows nothing rather than inferring a stance.
export async function positionsFor(name: string): Promise<RecordedPosition[]> {
  const data = await getVotes();
  const key = nameKey(name);
  const out: RecordedPosition[] = [];
  for (const vote of data.votes) {
    const hit = vote.votes.find((v) => nameKey(v.deputy) === key);
    if (hit) out.push({ vote, ballot: hit.vote, group: hit.group });
  }
  return out;
}

export interface GroupTally {
  group: string;
  si: number;
  no: number;
  abst: number;
  other: number;
}

// Per-parliamentary-group breakdown of a single vote.
export function tallyByGroup(vote: KeyVote): GroupTally[] {
  const map = new Map<string, GroupTally>();
  for (const v of vote.votes) {
    const g = map.get(v.group) ?? { group: v.group, si: 0, no: 0, abst: 0, other: 0 };
    if (v.vote === "Sí") g.si++;
    else if (v.vote === "No") g.no++;
    else if (v.vote === "Abstención") g.abst++;
    else g.other++;
    map.set(v.group, g);
  }
  return [...map.values()].sort(
    (a, b) => b.si + b.no + b.abst + b.other - (a.si + a.no + a.abst + a.other),
  );
}
