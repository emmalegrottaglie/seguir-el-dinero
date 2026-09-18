import { NextResponse } from "next/server";
import { DATASETS, datasetById } from "@/lib/datasets";

export const revalidate = 3600;

export async function generateStaticParams() {
  return DATASETS.map((d) => ({ table: d.id }));
}

/**
 * One dataset, as a downloadable CSV.
 *
 * The route is keyed by table id rather than by locale, because the columns
 * are fixed identifiers (see `lib/csv.ts`) — the same file downloads from
 * `/es/datos/salarios`, `/en/datos/salarios` and `/ca/datos/salarios`.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const dataset = datasetById(table);
  if (!dataset) return new NextResponse("Not found", { status: 404 });

  const csv = await dataset.csv();
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dataset.id}.csv"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
