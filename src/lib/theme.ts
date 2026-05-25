import { useEffect, useState } from "react";

export type Mode = "light" | "dark";
export type Accent = "default" | "ember" | "azure";

const MODE_KEY = "pulse.theme.mode";
const ACCENT_KEY = "pulse.theme.accent";

function applyTheme(mode: Mode, accent: Accent) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.classList.remove("theme-ember", "theme-azure");
  if (accent === "ember") root.classList.add("theme-ember");
  if (accent === "azure") root.classList.add("theme-azure");
}

export function useTheme() {
  const [mode, setMode] = useState<Mode>("light");
  const [accent, setAccent] = useState<Accent>("default");

  useEffect(() => {
    const m = (localStorage.getItem(MODE_KEY) as Mode) || "light";
    const a = (localStorage.getItem(ACCENT_KEY) as Accent) || "default";
    setMode(m);
    setAccent(a);
    applyTheme(m, a);
  }, []);

  const updateMode = (m: Mode) => {
    setMode(m);
    localStorage.setItem(MODE_KEY, m);
    applyTheme(m, accent);
  };
  const updateAccent = (a: Accent) => {
    setAccent(a);
    localStorage.setItem(ACCENT_KEY, a);
    applyTheme(mode, a);
  };

  return { mode, accent, setMode: updateMode, setAccent: updateAccent };
}

export function ThemeBootstrap() {
  useEffect(() => {
    const m = (localStorage.getItem(MODE_KEY) as Mode) || "light";
    const a = (localStorage.getItem(ACCENT_KEY) as Accent) || "default";
    applyTheme(m, a);
  }, []);
  return null;
}
