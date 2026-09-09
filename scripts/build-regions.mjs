// Projects the autonomous communities once, at build time, into SVG path data.
//
// The design prototype loaded d3 and topojson-client in the browser and
// projected on every render. That is ~60 KB of JavaScript to compute a result
// that never changes: the geometry is static, so the projection is static too.
// Doing it here means the map is server-rendered, present in the HTML, and
// readable with JavaScript disabled — only the hover and click behaviour needs
// a client at all.
//
// Geometry: es-atlas 0.6.0, TopoJSON derived from the Instituto Geográfico
// Nacional, CC-BY 4.0. Vendored into data/ rather than fetched at runtime.
//
// Usage: node scripts/build-regions.mjs

import { promises as fs } from "node:fs";
import path from "node:path";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const SRC = "https://unpkg.com/es-atlas@0.6.0/es/autonomous_regions.json";
const OUT = path.join(process.cwd(), "data", "regions.json");

// The viewBox the component renders into.
const W = 880;
const H = 560;

// The peninsula and the Balearics share one Mercator fit; the Canaries take a
// second, into an inset box in the space the peninsula's fit leaves empty at
// bottom left. d3-composite-projections would do this in one projection but
// pulls in a dependency for a single call.
const MAIN_EXTENT = [
  [186, 6],
  [W - 6, H - 6],
];
const INSET_BOX = { x: 16, y: H - 104, w: 148, h: 84 };
const INSET_EXTENT = [
  [INSET_BOX.x, INSET_BOX.y],
  [INSET_BOX.x + INSET_BOX.w, INSET_BOX.y + INSET_BOX.h],
];

// INE code 20 is Gibraltar, which the source carries as a geometry but which is
// not an autonomous community. Leaving it in would draw an unclickable sliver
// off the south coast and inflate every "19 territories" count on the page.
const EXCLUDE = new Set(["20"]);
const CANARIES = "05";

// Ceuta and Melilla are about 19 km2 each. Projected into an 880-wide map of
// Spain they come out a couple of pixels across: present in the path data, but
// impossible to see, hover or click, and far too small to carry a fill anyone
// could read a colour from. Each therefore also gets a centroid, and the
// component draws a minimum-size marker there rather than relying on the
// outline. The threshold is on projected area, so it is the rendered size that
// decides which territories need one, not a hardcoded pair of ids.
const MIN_AREA_PX = 60;

const round1 = (n) => Math.round(n * 10) / 10;

async function main() {
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(`${SRC} → HTTP ${res.status}`);
  const topo = await res.json();

  const fc = feature(topo, topo.objects.autonomous_regions);
  const kept = fc.features.filter((f) => !EXCLUDE.has(String(f.id)));

  const mainland = { type: "FeatureCollection", features: kept.filter((f) => String(f.id) !== CANARIES) };
  const canaries = kept.find((f) => String(f.id) === CANARIES);
  if (!canaries) throw new Error("Canarias (05) missing from the source");
  if (kept.length !== 19) throw new Error(`expected 19 territories, got ${kept.length}`);

  // One decimal place. d3-geo emits full float precision, which at this scale
  // means ~14 significant digits describing a position inside a tenth of a
  // pixel — invisible, and roughly two thirds of the file. The paths travel to
  // the browser as props on an interactive component, so the size is paid on
  // every visit to the map.
  const mainPath = geoPath(geoMercator().fitExtent(MAIN_EXTENT, mainland)).digits(1);
  const insetPath = geoPath(geoMercator().fitExtent(INSET_EXTENT, canaries)).digits(1);

  const regions = kept
    .map((f) => {
      const id = String(f.id);
      const project = id === CANARIES ? insetPath : mainPath;
      const d = project(f);
      if (!d) throw new Error(`no path generated for ${id}`);
      const [cx, cy] = project.centroid(f);
      if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
        throw new Error(`no centroid for ${id}`);
      }
      return {
        id,
        name: f.properties.name,
        inset: id === CANARIES,
        d,
        centroid: [round1(cx), round1(cy)],
        tiny: project.area(f) < MIN_AREA_PX,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const tiny = regions.filter((r) => r.tiny).map((r) => r.id);
  if (tiny.length === 0) {
    throw new Error(
      "no territory fell below the marker threshold; Ceuta and Melilla should have"
    );
  }

  const out = {
    source: {
      body: "Instituto Geográfico Nacional, via es-atlas 0.6.0",
      licence: "CC-BY 4.0",
      url: SRC,
      retrieved: new Date().toISOString().slice(0, 10),
    },
    viewBox: { width: W, height: H },
    insetBox: INSET_BOX,
    regions,
  };

  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf-8");
  const kb = Math.round(Buffer.byteLength(JSON.stringify(out)) / 1024);
  console.log(`${regions.length} territories → data/regions.json (${kb} kB)`);
  console.log(`drawn as markers, too small to render as outlines: ${tiny.join(", ")}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
