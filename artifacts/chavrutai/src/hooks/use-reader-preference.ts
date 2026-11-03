import { useState } from "react";

/** Browser-local reader settings, migrating older tab-only preferences. */
export function useReaderPreference(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key) ?? sessionStorage.getItem(key);
      const initial = saved === "true" ? true : saved === "false" ? false : defaultValue;
      localStorage.setItem(key, String(initial));
      return initial;
    } catch {
      return defaultValue;
    }
  });
  const update = (next: boolean) => {
    setValue(next);
    try { localStorage.setItem(key, String(next)); } catch { /* Keep working when storage is disabled. */ }
  };
  return [value, update] as const;
}
