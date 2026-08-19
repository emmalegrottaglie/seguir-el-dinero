import { NextResponse } from "next/server";
import { fetchPartySubsidies } from "@/lib/bdns";
import { writeSnapshot, backendName } from "@/lib/store";
import { invalidate } from "@/lib/data";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Cron-triggered (and manually triggerable) refresh of the BDNS snapshot.
// In production, protect with CRON_SECRET; Vercel Cron sends it as a Bearer token.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const qs = new URL(request.url).searchParams.get("key");
    if (auth !== `Bearer ${secret}` && qs !== secret) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const snapshot = await fetchPartySubsidies();
    if (!snapshot.records.length) {
      return NextResponse.json(
        { ok: false, error: "BDNS returned zero records; keeping previous snapshot" },
        { status: 502 },
      );
    }
    const written = await writeSnapshot(snapshot);
    invalidate();
    const total = snapshot.records.reduce((s, r) => s + r.importe, 0);
    return NextResponse.json({
      ok: true,
      generatedAt: snapshot.generatedAt,
      records: snapshot.records.length,
      totalEur: total,
      storage: { configured: backendName(), writtenTo: written },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
