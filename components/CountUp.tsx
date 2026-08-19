"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { euro, integer } from "@/lib/format";

// Formatter chosen by key so this client component can be used from server
// components (functions can't be passed as props across that boundary).
const FORMATTERS = { euro, integer } as const;

// Shows `value` immediately (so the real figure is present in the static HTML
// and without JS), then treats the count-up as progressive enhancement: it
// plays once when scrolled into view, and re-animates whenever `value` changes.
export default function CountUp({
  value,
  as = "euro",
  bcp47 = "es-ES",
  className,
  duration = 1.1,
}: {
  value: number;
  as?: keyof typeof FORMATTERS;
  bcp47?: string;
  className?: string;
  duration?: number;
}) {
  const format = (n: number) => FORMATTERS[as](n, bcp47);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const started = useRef(false);

  useEffect(() => {
    // Initial count-up: play once, the first time the element is in view.
    if (!started.current) {
      if (!inView) return;
      started.current = true;
      prev.current = value;
      const controls = animate(0, value, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: setDisplay,
      });
      return () => controls.stop();
    }
    // Later changes (e.g. a filter): animate from the previous value.
    if (prev.current !== value) {
      const controls = animate(prev.current, value, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: setDisplay,
      });
      prev.current = value;
      return () => controls.stop();
    }
  }, [value, inView, duration]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}
