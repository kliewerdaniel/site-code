"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dk-theme";

export function ThemeToggle() {
  const [light, setLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    try {
      if (next) {
        document.documentElement.classList.add("light");
        localStorage.setItem(STORAGE_KEY, "light");
      } else {
        document.documentElement.classList.remove("light");
        localStorage.setItem(STORAGE_KEY, "dark");
      }
    } catch {
      // storage unavailable — theme still applies for this session
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      className="font-mono text-sm text-paper-dim hover:text-paper transition-colors px-2 py-1"
    >
      {/* text glyphs, no emoji */}
      {mounted ? (light ? "☾" : "☼") : "☼"}
    </button>
  );
}


export default ThemeToggle;
