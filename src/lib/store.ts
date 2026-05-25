import { useEffect, useState } from "react";
import type { AnalysisInput, AnalysisResult } from "./analysis";

const KEY_INPUT = "pulse.input";
const KEY_RESULT = "pulse.result";
const KEY_USER = "pulse.user";

export interface User { name: string; email: string; }

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}
function write<T>(key: string, value: T | null) {
  if (typeof window === "undefined") return;
  if (value === null) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("pulse-storage"));
}

export function useStored<T>(key: string): [T | null, (v: T | null) => void] {
  const [val, setVal] = useState<T | null>(null);
  useEffect(() => {
    setVal(read<T>(key));
    const handler = () => setVal(read<T>(key));
    window.addEventListener("pulse-storage", handler);
    window.addEventListener("storage", handler);
    return () => { window.removeEventListener("pulse-storage", handler); window.removeEventListener("storage", handler); };
  }, [key]);
  return [val, (v) => write(key, v)];
}

export const useInput = () => useStored<AnalysisInput>(KEY_INPUT);
export const useResult = () => useStored<AnalysisResult>(KEY_RESULT);
export const useUser = () => useStored<User>(KEY_USER);

export const keys = { KEY_INPUT, KEY_RESULT, KEY_USER };
