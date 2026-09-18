/**
 * A caveat, collapsed by default and one click away.
 *
 * This site's honesty rule is that a stated gap beats a possibly-wrong
 * number, which for a while meant every limitation was printed in full,
 * always expanded, competing with the figure it explains for the reader's
 * attention. That is not the same commitment as making every caveat easy to
 * skip past. Progressive disclosure keeps the exact same sentence — nothing
 * here is shortened or softened — and only changes whether it is visible by
 * default.
 *
 * A native `<details>` element, not a client component: no JavaScript is
 * shipped for this, the closed/open state needs no state management, and it
 * degrades to a plain expandable disclosure with no JS at all. This is the
 * same preference the search box and the sortable table already follow —
 * reach for the platform's own affordance before reaching for a library.
 *
 * What this is not for: a legend a reader needs to read the chart in front
 * of them (the map's active-layer caption, a table's column definitions), a
 * verbatim quoted finding, or the sole content of an already-minimal empty
 * state. Those stay visible — collapsing them would hide something the
 * reader needs immediately, not something they can look up on demand.
 */
export default function Caveat({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details className={`caveat ${className}`}>
      <summary>{label}</summary>
      <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-[var(--ink-3)]">{children}</p>
    </details>
  );
}
