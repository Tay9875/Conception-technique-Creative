const resizeObserverLoopErrors = new Set([
  "ResizeObserver loop completed with undelivered notifications.",
  "ResizeObserver loop limit exceeded",
]);

export function installResizeObserverErrorFilter() {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener(
    "error",
    (event) => {
      if (resizeObserverLoopErrors.has(event.message)) {
        event.stopImmediatePropagation();
      }
    },
    true
  );
}
