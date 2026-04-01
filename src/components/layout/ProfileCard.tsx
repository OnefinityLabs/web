"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/themeSlice";

export function ProfileCard() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-blue to-purple text-[13px] font-bold text-white transition-shadow hover:shadow-[0_0_0_3px_rgba(124,58,237,0.3)]"
        aria-label="Open profile menu"
      >
        MJ
      </button>

      {/* Dropdown card */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[100] w-[280px] overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          {/* User info */}
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue to-purple text-sm font-bold text-white">
                MJ
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-text1">
                  Sachin M 
                </div>
                <div className="truncate text-xs text-text3">
                  oneFinity Technologies
                </div>
                <div className="truncate text-[11px] text-text3">
                  sachin@onefinity.in
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="px-5 py-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text3">
              Settings
            </div>

            {/* Theme toggle */}
            <div className="flex items-center justify-between rounded-lg px-1 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {mode === "dark" ? "🌙" : "☀️"}
                </span>
                <span className="text-[13px] font-medium text-text2">
                  {mode === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
              </div>
              <button
                onClick={() => dispatch(toggleTheme())}
                className={`relative h-[22px] w-[40px] rounded-full transition-colors duration-200 ${
                  mode === "light" ? "bg-blue" : "bg-border2"
                }`}
                aria-label="Toggle theme"
              >
                <span
                  className={`absolute top-[3px] left-[3px] h-[16px] w-[16px] rounded-full bg-white transition-transform duration-200 ${
                    mode === "light" ? "translate-x-[18px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sign-out placeholder */}
          <div className="border-t border-border px-5 py-3">
            <button className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium text-red transition-colors hover:bg-red/10">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
