"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
          
          // Handle sync events
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data?.type === "SYNC_ORDERS") {
              // Trigger orders sync
              window.dispatchEvent(new CustomEvent("sync-orders"));
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
