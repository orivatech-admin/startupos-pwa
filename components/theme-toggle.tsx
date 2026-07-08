"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const THEME_COLOR = { light: "#ffffff", dark: "#12141a" } as const;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Standard next-themes hydration guard: the server can't know the user's
  // stored theme preference, so we only trust `resolvedTheme` post-mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const isDark = resolvedTheme === "dark";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? THEME_COLOR.dark : THEME_COLOR.light);
  }, [mounted, resolvedTheme]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {isDark ? (
        <Moon className="size-4 text-muted-foreground" />
      ) : (
        <Sun className="size-4 text-muted-foreground" />
      )}
      <p className="flex-1 text-sm">Dark mode</p>
      <Switch
        checked={isDark}
        disabled={!mounted}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
