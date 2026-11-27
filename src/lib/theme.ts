import { createGlobalState, usePreferredDark, useStorage } from "@vueuse/core";
import { watchEffect } from "vue";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeAccent = "violet" | "blue" | "mint" | "amber";

const MODE_KEY = "gongwei:theme-mode";
const ACCENT_KEY = "gongwei:theme-accent";

const modeSerializer = {
  read: (raw: string): ThemeMode => (raw === "light" || raw === "dark" ? raw : "system"),
  write: (value: ThemeMode) => value,
};

const accentSerializer = {
  read: (raw: string): ThemeAccent =>
    raw === "blue" || raw === "mint" || raw === "amber" ? raw : "violet",
  write: (value: ThemeAccent) => value,
};

export function applyTheme(mode: ThemeMode, accent: ThemeAccent, systemDark: boolean): void {
  const dark = mode === "dark" || (mode === "system" && systemDark);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.dataset.accent = accent;
  root.style.colorScheme = dark ? "dark" : "light";
}

export const useTheme = createGlobalState(() => {
  const mode = useStorage<ThemeMode>(MODE_KEY, "system", localStorage, {
    serializer: modeSerializer,
  });
  const accent = useStorage<ThemeAccent>(ACCENT_KEY, "violet", localStorage, {
    serializer: accentSerializer,
  });
  const preferredDark = usePreferredDark();

  watchEffect(() => applyTheme(mode.value, accent.value, preferredDark.value));

  return { mode, accent };
});
