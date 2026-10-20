// The ready cue. Whoever owns a page load (the lights-on overlay, the lid
// between routes, or plain fonts-ready) fires it once the page may draw in.
// It's an event *and* a flag, so anything that mounts late — a hot reload,
// a component that attaches after the cue — reveals immediately instead of
// waiting for an event that already happened.

export const READY_EVENT = "the:ready";

declare global {
  interface Window {
    __theReady?: boolean;
  }
}

/** Whether the "through the mark" sequence should run: every load, unless motion is reduced. */
export const shouldRunIntro = () => {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const fireReady = () => {
  window.__theReady = true;
  window.dispatchEvent(new Event(READY_EVENT));
};

/** Arm the cue again before a route swap, so the next page waits for the lid. */
export const holdReady = () => {
  window.__theReady = false;
};

/**
 * Run `cb` once the page is ready: now if it already is, on the event when
 * it fires, or after `fallbackMs` regardless — nothing stays hidden forever.
 * Returns a cleanup.
 */
export const onReady = (cb: () => void, fallbackMs = 4500) => {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    cb();
  };
  if (window.__theReady) {
    run();
    return () => undefined;
  }
  window.addEventListener(READY_EVENT, run, { once: true });
  const t = setTimeout(run, fallbackMs);
  return () => {
    clearTimeout(t);
    window.removeEventListener(READY_EVENT, run);
  };
};
