"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s) => s.theme.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(mode);
    localStorage.setItem("conviq-theme", mode);
  }, [mode]);

  return <>{children}</>;
}
