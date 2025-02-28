"use client";

import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
export function ThemeToggle() {
  const { resolvedTheme, toggleTheme, isLoaded } = useTheme();

  if (!isLoaded) return null;

  return <Button onClick={toggleTheme}>Current theme: {resolvedTheme}</Button>;
}
