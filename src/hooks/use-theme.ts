"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useTheme() {
  const { theme, setTheme, systemTheme, themes } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only showing theme controls after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the current theme, accounting for system preference
  const currentTheme = mounted ? theme : undefined;
  const resolvedTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : undefined;

  // Toggle between light and dark
  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Set a specific theme
  const selectTheme = (newTheme: string) => {
    if (!mounted) return;
    setTheme(newTheme);
  };

  return {
    theme: currentTheme,
    resolvedTheme,
    themes,
    setTheme,
    toggleTheme,
    selectTheme,
    isLoaded: mounted,
  };
}
