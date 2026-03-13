"use client";

import { useEffect } from "react";

/** Регистрация SW + manifest уже через <link rel="manifest"> */
export function RegisterPWA() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;
    if (
      process.env.NODE_ENV === "development" &&
      !window.location.search.includes("pwa=1")
    )
      return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
