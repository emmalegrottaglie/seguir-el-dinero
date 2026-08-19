"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { euro, integer } from "@/lib/format";

// Formatter chosen by key so this client component can be used from server
// components (functions can't be passed as props across that boundary).
const FORMATTERS = { euro, integer } as const;

// Animated number that counts up to `value` when it scrolls into view, then
// re-animates smoothly whenever `value` changes (e.g. after a filter change).
export default function CountUp({
  value,
  as = "euro",
  className,
  duration = 1.1,
}: {
  value: number;
  as?: keyof typeof FORMATTERS;
  className?: string;
  duration?: number;
}) {
  const format = FORMATTERS[as];
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
      onComplete: () => {
        from.current = value;
      },
    });
    return () => controls.stop();
  }, [value, inView, duration]);

  return (
    <span ref={ref} className={className}>
      {format(inView ? display : 0)}
    </span>
  );
}
