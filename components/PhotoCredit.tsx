import type { Portrait } from "@/lib/photos";

// These licences require crediting the author, so the credit ships with the image.
export default function PhotoCredit({ portrait }: { portrait: Portrait }) {
  return (
    <p className="label-mono mt-2 text-[var(--paper-faint)]">
      Foto:{" "}
      <a className="src" href={portrait.fileUrl} target="_blank" rel="noopener noreferrer">
        {portrait.author ?? "Wikimedia Commons"}
      </a>{" "}
      · {portrait.licence}
    </p>
  );
}
