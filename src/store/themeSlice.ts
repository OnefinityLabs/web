import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "dark" | "light";

interface ThemeState {
  mode: Theme;
}

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("conviq-theme");
    if (stored === "light" || stored === "dark") return stored;
  }
  return "dark";
}

const initialState: ThemeState = { mode: getInitialTheme() };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.mode = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
