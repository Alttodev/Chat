import { useEffect } from "react";
import { useThemeStore } from "@/lib/zustand";

export function ThemeSync() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    document.body.style.colorScheme = isDark ? "dark" : "light";
  }, [theme]);

  return null;
}
