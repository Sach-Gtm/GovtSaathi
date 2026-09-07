"use client";
import { useEffect } from "react";

/**
 * Registers /sw.js on first mount. Silent — installation and updates happen
 * in the background; new versions take effect on the next full navigation.
 */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.hostname === "localhost") return;
    const t = setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, []);
  return null;
}
