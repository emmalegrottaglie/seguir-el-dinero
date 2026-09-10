// Guards the investiture layer's arithmetic.
//
// Every claim this layer makes is a sum over two or three published numbers, so
// every one of them is checkable — and during the research three separate
// sources gave figures that did not close. A chamber was reported at 65 seats
// with a majority of 34 (which implies 67); a tally put Vox at 4 votes and Més
// at 8 when they hold 8 and 4; and an against-column breakdown summed to one
// less than its own total. Two of those would have put a wrong hatch on a
// public map.
//
// So: a recorded round is only trusted where its votes-in-favour breakdown sums
// to its own total and the round fits inside the chamber. Anything that fails is
// a build failure, not a warning.
//
// Run: npm run check:investitures

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "lib", "investitures.ts");

const problems = [];
const note = (m) => problems.push(m);

const src = await fs.readFile(SRC, "utf-8");

// Parse the literal rather than importing it: this script must run without a
// TypeScript toolchain, like the repo's other checks.
const blocks = src
  .split(/\n  \{\n    id: "/)
  .slice(1)
  .map((b) => "id: \"" + b);

if (blocks.length === 0) note("no community blocks parsed from lib/investitures.ts");

const num = (b, key) => {
  const m = b.match(new RegExp(key + ":\\s*(\\d+)"));
  return m ? Number(m[1]) : null;
};

let rounds = 0;
let verified = 0;

for (const b of blocks) {
  const id = (b.match(/id: "(\d+)"/) || [])[1];
  const seats = num(b, "chamberSeats");
  const pp = num(b, "seatsPP");
  const vox = num(b, "seatsVox");

  if (!id || !seats || pp === null || vox === null) {
    note(`block ${id ?? "?"}: missing chamberSeats / seatsPP / seatsVox`);
    continue;
  }

  const majority = Math.floor(seats / 2) + 1;

  // A party cannot hold more seats than the chamber has.
  if (pp + vox > seats) note(`${id}: PP ${pp} + Vox ${vox} exceeds the chamber's ${seats} seats`);

  // This layer only lists communities where the question arises at all.
  if (pp >= majority) {
    note(
      `${id}: PP holds ${pp} of ${seats}, which is already an absolute majority ` +
        `(${majority}) — it should not be in this list, since the layer would draw ` +
        `it as needing nobody`,
    );
  }

  // Each recorded round.
  const roundBlocks = b.split(/\{\s*\n        date:/).slice(1);
  for (const r of roundBlocks) {
    rounds++;
    const forV = num(r, "votesFor");
    const against = num(r, "votesAgainst");
    const abst = num(r, "abstentions");
    const succeeded = /succeeded: true/.test(r);
    const date = (r.match(/^\s*"(\d{4}-\d{2}-\d{2})"/) || [])[1];

    if (forV === null || against === null || abst === null) {
      note(`${id} round ${date ?? "?"}: incomplete tally`);
      continue;
    }

    // The votes cast cannot exceed the seats available.
    const cast = forV + against + abst;
    if (cast > seats) {
      note(`${id} round ${date}: ${cast} votes cast in a chamber of ${seats}`);
    }

    // The breakdown of the FOR column must sum to it exactly. This is the
    // guard that establishes Vox's contribution, and the one that caught a
    // source reversing two parties' seat counts.
    const bd = (r.match(/forBreakdown: \{([^}]*)\}/) || [])[1] ?? "";
    const parts = [...bd.matchAll(/(\w+): (\d+)/g)].map((m) => [m[1], Number(m[2])]);
    const sum = parts.reduce((n, [, v]) => n + v, 0);
    if (parts.length === 0) {
      note(`${id} round ${date}: a recorded round with no forBreakdown`);
    } else if (sum !== forV) {
      note(
        `${id} round ${date}: forBreakdown sums to ${sum} but votesFor is ${forV} ` +
          `(${parts.map(([k, v]) => `${k} ${v}`).join(" + ")})`,
      );
    }

    // No party may contribute more votes than it holds seats.
    for (const [party, v] of parts) {
      if (party === "PP" && v > pp) note(`${id} round ${date}: PP voted ${v} with ${pp} seats`);
      if (party === "Vox" && v > vox) note(`${id} round ${date}: Vox voted ${v} with ${vox} seats`);
    }

    // A successful round must actually have reached its stated bar.
    if (succeeded) {
      const bar = /majorityRequired: "absolute"/.test(r) ? majority : against + 1;
      if (forV < bar) {
        note(`${id} round ${date}: recorded as succeeded with ${forV} votes against a bar of ${bar}`);
      }
      if (parts.some(([p]) => p === "Vox")) verified++;
    }
  }
}

console.log(
  `${blocks.length} communities, ${rounds} recorded rounds, ` +
    `${verified} with a verified Vox contribution to a successful investiture`,
);

if (problems.length > 0) {
  console.error("FAIL:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("OK");
