"use client";
import { useEffect, useState } from "react";

/**
 * "Install app" control. Uses the beforeinstallprompt event on Android/desktop
 * Chromium. On iOS (which has no such event) it shows a short "Add to Home
 * Screen" hint instead. Hides itself once installed or if unsupported.
 */
export function InstallPWA({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari has no beforeinstallprompt
    const ua = window.navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)) {
      setIosHint(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice.catch(() => {});
      setDeferred(null);
    } else if (iosHint) {
      alert("To install: tap the Share button, then 'Add to Home Screen'.");
    }
  }

  if (!deferred && !iosHint) return null;

  return (
    <button onClick={install} className={className ?? "btn-outline"}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-1">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      Install app
    </button>
  );
}
