// Section totals of a Bienes y Rentas declaration. Plain JS so that the profile page and
// scripts/build-declarations.mjs add up exactly the same lines: the build step checks these
// totals against an independent transcription, so the page must not show a differently-summed
// figure than the one that was checked.
//
// Every total is a plain sum of amounts the deputy declared within one part of the form. There is
// deliberately no grand total: property is declared without a value, so any "net worth" built from
// this form would leave out what is often the largest asset.

const cents = (x) => Math.round(x * 100) / 100;

function sum(items, pick) {
  let total = 0;
  let any = false;
  for (const item of items) {
    const v = pick(item);
    if (typeof v === "number") {
      total += v;
      any = true;
    }
  }
  return any ? cents(total) : null;
}

/**
 * - income: every line under "Rentas percibidas", all four groups.
 * - financial: account balances plus every other asset declared with a value (securities,
 *   holdings, funds, pension plans and the form's closing "otros bienes" block).
 * - debts: the outstanding balance of every loan.
 * - irpf: the income-tax liability the deputy declared, as stated.
 *
 * null means nothing was declared in that part, which is not the same as a declared zero.
 */
export function declarationTotals(d) {
  return {
    income: sum(d.income, (l) => l.amount),
    financial: sum([...d.deposits, ...d.otherAssets], (a) => a.amount),
    debts: sum(d.loans, (l) => l.pending),
    irpf: typeof d.irpf === "number" ? cents(d.irpf) : null,
  };
}
