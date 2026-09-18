/**
 * Only the three strings the field itself prints.
 *
 * Not `Dict["search"]`: the masthead is a client component, so whatever it is
 * handed is serialised into the payload of every page on the site — and that
 * block also holds the scope paragraph and the empty-state hint, several
 * hundred bytes of prose that only the results page ever renders.
 */
export interface SearchBoxStrings {
  label: string;
  placeholder: string;
  submit: string;
}

/**
 * The search field, in the masthead and again at the top of the results page.
 *
 * A plain `<form method="get">` and nothing else. No state, no client
 * component, no fetch: submitting navigates to `/buscar?q=…`, which means it
 * works with JavaScript disabled, the result is a URL a reader can send to
 * someone, and the browser's own navigation announces the change of context to
 * a screen reader — which a typeahead dropdown has to reimplement and usually
 * gets wrong.
 *
 * `role="search"` on the form is what lets assistive technology jump straight
 * to it, and it is the reason this is a `<form>` rather than an input with a
 * handler.
 */
export default function SearchBox({
  locale,
  t,
  defaultValue = "",
  autoFocus = false,
  size = "sm",
  className = "",
}: {
  locale: string;
  t: SearchBoxStrings;
  defaultValue?: string;
  autoFocus?: boolean;
  /** `lg` on the results page, `sm` in the masthead. */
  size?: "sm" | "lg";
  className?: string;
}) {
  const large = size === "lg";
  return (
    <form
      role="search"
      action={`/${locale}/buscar`}
      method="get"
      className={`flex items-stretch gap-2 ${large ? "mt-6" : ""} ${className}`}
    >
      <label className="sr-only" htmlFor={`search-${size}`}>
        {t.label}
      </label>
      <input
        id={`search-${size}`}
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder={t.placeholder}
        className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--card)] px-3"
        style={{
          borderRadius: 2,
          fontSize: large ? "17px" : "13.5px",
          paddingBlock: large ? 10 : 6,
          maxWidth: large ? undefined : "15rem",
        }}
      />
      <button
        type="submit"
        className="layer-btn whitespace-nowrap"
        style={{ padding: large ? "10px 18px" : "6px 12px", fontSize: large ? undefined : "11px" }}
      >
        {t.submit}
      </button>
    </form>
  );
}
