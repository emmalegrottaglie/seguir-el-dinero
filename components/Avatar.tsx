import Image from "next/image";
import type { Portrait } from "@/lib/photos";

// Initials fall back when no freely-licensed portrait exists, which is the case
// for most of the register. Never a placeholder photo of someone else.
function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function Avatar({
  name,
  portrait,
  color = "var(--paper-faint)",
  size = 56,
}: {
  name: string;
  portrait?: Portrait | null;
  color?: string;
  size?: number;
}) {
  if (portrait) {
    return (
      <Image
        src={portrait.url}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size, border: `1px solid ${color}66` }}
        unoptimized
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="mono flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        color,
        background: "var(--ink-3)",
        border: `1px solid ${color}55`,
      }}
    >
      {initials(name)}
    </span>
  );
}
