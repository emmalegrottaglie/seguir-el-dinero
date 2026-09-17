"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { provinceForPostcode, type Province } from "@/lib/postcode";
import type { Dict } from "@/lib/i18n";

/**
 * The one thing on this site that starts from the reader rather than from the state.
 *
 * Every other page opens with a national figure and leaves the reader to work
 * out whether any of it describes where they live. This asks them, in the two
 * forms a person actually knows: a postcode, or a province by name.
 *
 * The postcode never leaves the browser. Its first two digits are the province
 * code, so resolving it is string arithmetic over a 52-row table handed down as
 * a prop — there is no lookup service to call, no request carrying it, and
 * nothing stored. The box says so, because a reader typing where they live into
 * a site about politics is owed that in writing rather than in a privacy policy.
 *
 * What it navigates to is a province URL, not a postcode URL. The province is
 * the real resolution of the answer, and a postcode in a shareable link is
 * location data a reader did not choose to publish.
 */
export default function WhereYouLive({
  provinces,
  locale,
  t,
}: {
  provinces: Province[];
  locale: string;
  t: Dict["where"];
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const go = (slug: string) => router.push(`/${locale}/donde/${slug}`);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const hit = provinceForPostcode(code, provinces);
    if (hit) {
      setError(false);
      go(hit.slug);
    } else {
      setError(true);
    }
  };

  // Alphabetical by the name a reader reads, not by INE's code order.
  const sorted = [...provinces].sort((a, b) => a.name.localeCompare(b.name, locale));

  return (
    <section className="rule-ink py-6">
      <h2 className="display text-[22px] font-semibold" style={{ letterSpacing: "-0.02em" }}>
        {t.title}
      </h2>
      <p className="mt-2 max-w-[62ch] text-[var(--ink-2)]" style={{ fontSize: "14px" }}>
        {t.intro}
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="label-mono">{t.postcodeLabel}</span>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 5));
                setError(false);
              }}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder={t.postcodePlaceholder}
              aria-describedby="where-privacy"
              aria-invalid={error}
              className="mono w-[7.5rem] border border-[var(--line)] bg-[var(--card)] px-2.5 py-2"
              style={{ borderRadius: 2, fontSize: "15px" }}
            />
          </label>
          <button type="submit" className="layer-btn" style={{ padding: "9px 14px" }}>
            {t.submit}
          </button>
        </form>

        <label className="flex flex-col gap-1.5">
          <span className="label-mono">{t.provinceLabel}</span>
          <select
            defaultValue=""
            onChange={(e) => e.target.value && go(e.target.value)}
            className="border border-[var(--line)] bg-[var(--card)] px-2.5 py-2"
            style={{ borderRadius: 2, fontSize: "15px", maxWidth: "16rem" }}
          >
            <option value="" disabled>
              {t.provincePlaceholder}
            </option>
            {sorted.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[var(--red)]" style={{ fontSize: "13px" }}>
          {t.notFound}
        </p>
      )}

      <p id="where-privacy" className="label-mono mt-4 text-[var(--ink-3)]">
        {t.privacy}
      </p>
    </section>
  );
}
