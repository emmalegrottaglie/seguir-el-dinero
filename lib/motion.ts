"use client";

import { useReducedMotion } from "motion/react";

/**
 * Entrance animation helpers, in one place so `prefers-reduced-motion` is
 * honoured everywhere rather than in whichever component remembered.
 *
 * `globals.css` declares a `prefers-reduced-motion` block, but it only disabled
 * `scroll-behavior`. Every fade-and-rise entrance still played for a reader who
 * had asked their operating system for less motion.
 *
 * The same entrances were also the reason the portal could be caught mid-load
 * with its `<h1>` at `opacity: 0.058` and its lead paragraph at `opacity: 0` —
 * a headline that is not there yet. Capping the stagger bounds how long the
 * last element in a list stays invisible.
 */

/** Per-item stagger step, in seconds. */
export const STAGGER_STEP = 0.035;

/**
 * Ceiling on the accumulated stagger. Without one, the delay grows with the
 * index: the party list runs to 28 rows, so its last bar was starting 0.81s in
 * and finishing past 1.7s.
 */
export const STAGGER_MAX = 0.4;

export function stagger(index: number): number {
  return Math.min(index * STAGGER_STEP, STAGGER_MAX);
}

type Keyframe = Record<string, number | string>;

export interface EntranceOptions {
  /** Seconds. Ignored under reduced motion. */
  duration?: number;
  /** Explicit delay in seconds. Overrides `index`. */
  delay?: number;
  /** Position in a list; the delay is `stagger(index)`, capped. */
  index?: number;
  ease?: [number, number, number, number];
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Build `initial` / `animate` / `transition` for one entrance.
 *
 * Under reduced motion the element starts at its final state with a zero
 * duration, so it is painted correctly on the first frame and never animates.
 */
export function useEntrance() {
  const reduce = useReducedMotion() ?? false;

  function entrance(from: Keyframe, to: Keyframe, options: EntranceOptions = {}) {
    const { duration = 0.5, delay, index = 0, ease = EASE_OUT } = options;
    if (reduce) {
      return { initial: to, animate: to, transition: { duration: 0 } };
    }
    return {
      initial: from,
      animate: to,
      transition: { duration, delay: delay ?? stagger(index), ease },
    };
  }

  /** The common case: fade in, optionally rising or sliding into place. */
  function rise(offset: { x?: number; y?: number } = {}, options: EntranceOptions = {}) {
    const { x, y } = offset;
    const from: Keyframe = { opacity: 0 };
    const to: Keyframe = { opacity: 1 };
    if (x !== undefined) {
      from.x = x;
      to.x = 0;
    }
    if (y !== undefined) {
      from.y = y;
      to.y = 0;
    }
    return entrance(from, to, options);
  }

  return { reduce, entrance, rise };
}
