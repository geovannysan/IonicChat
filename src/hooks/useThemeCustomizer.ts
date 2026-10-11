import { useEffect, useState } from "react";

// ─── Catálogos ────────────────────────────────────────────────────────────────

export const COLOR_THEMES = [
  { id: "sky",     label: "Celeste",  color: "oklch(0.60 0.16 230)" },
  { id: "neutral", label: "Neutro",   color: "oklch(0.30 0 0)" },
  { id: "green",   label: "Verde",    color: "oklch(0.58 0.13 162)" },
  { id: "teal",    label: "Teal",     color: "oklch(0.58 0.14 192)" },
  { id: "blue",    label: "Azul",     color: "oklch(0.52 0.20 264)" },
  { id: "indigo",  label: "Índigo",   color: "oklch(0.50 0.22 275)" },
  { id: "violet",  label: "Violeta",  color: "oklch(0.55 0.22 295)" },
  { id: "rose",    label: "Rosa",     color: "oklch(0.60 0.22 5)" },
  { id: "orange",  label: "Naranja",  color: "oklch(0.66 0.20 40)" },
  { id: "amber",   label: "Ámbar",    color: "oklch(0.72 0.18 75)" },
] as const;

export const SIDEBAR_THEMES = [
  { id: "dark",   label: "Oscuro",  bg: "oklch(0.18 0.02 225)", fg: "oklch(0.92 0 0)" },
  { id: "slate",  label: "Slate",   bg: "oklch(0.21 0.01 250)", fg: "oklch(0.90 0 0)" },
  { id: "zinc",   label: "Zinc",    bg: "oklch(0.20 0.005 260)",fg: "oklch(0.92 0 0)" },
  { id: "navy",   label: "Navy",    bg: "oklch(0.22 0.06 255)", fg: "oklch(0.92 0 0)" },
  { id: "forest", label: "Bosque",  bg: "oklch(0.20 0.03 160)", fg: "oklch(0.90 0 0)" },
  { id: "purple", label: "Púrpura", bg: "oklch(0.21 0.05 290)", fg: "oklch(0.91 0 0)" },
  { id: "rose",   label: "Rosa",    bg: "oklch(0.22 0.04 10)",  fg: "oklch(0.91 0 0)" },
  { id: "warm",   label: "Cálido",  bg: "oklch(0.22 0.02 55)",  fg: "oklch(0.91 0 0)" },
  { id: "light",  label: "Claro",   bg: "oklch(0.985 0 0)",     fg: "oklch(0.18 0 0)" },
] as const;

export type ColorThemeId  = (typeof COLOR_THEMES)[number]["id"];
export type SidebarThemeId = (typeof SIDEBAR_THEMES)[number]["id"];
export type ThemeTab = "color" | "sidebar";

// ─── Storage keys ─────────────────────────────────────────────────────────────

const S_COLOR   = "app-color-theme";
const S_SIDEBAR = "app-sidebar-theme";
const S_DARK    = "app-dark-mode";

// ─── DOM helper ───────────────────────────────────────────────────────────────

function applyAll(color: ColorThemeId, sidebar: SidebarThemeId, dark: boolean) {
  const html = document.documentElement;
  html.removeAttribute("data-theme");
  if (color !== "sky") html.setAttribute("data-theme", color);
  html.setAttribute("data-sidebar", sidebar);
  html.classList.toggle("dark", dark);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useThemeCustomizer() {
  const [tab, setTab] = useState<ThemeTab>("color");

  const [color, setColor] = useState<ColorThemeId>(
    () => (localStorage.getItem(S_COLOR) as ColorThemeId) ?? "sky",
  );
  const [sidebar, setSidebar] = useState<SidebarThemeId>(
    () => (localStorage.getItem(S_SIDEBAR) as SidebarThemeId) ?? "dark",
  );
  const [dark, setDark] = useState(
    () => localStorage.getItem(S_DARK) === "true",
  );

  // Aplicar al montar
  useEffect(() => {
    applyAll(color, sidebar, dark);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleColor = (c: ColorThemeId) => {
    setColor(c);
    localStorage.setItem(S_COLOR, c);
    applyAll(c, sidebar, dark);
  };

  const handleSidebar = (s: SidebarThemeId) => {
    setSidebar(s);
    localStorage.setItem(S_SIDEBAR, s);
    applyAll(color, s, dark);
  };

  const handleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem(S_DARK, String(next));
    applyAll(color, sidebar, next);
  };

  // Metadatos del tema activo (útil para el footer de resumen)
  const activeColor   = COLOR_THEMES.find((t) => t.id === color)!;
  const activeSidebar = SIDEBAR_THEMES.find((s) => s.id === sidebar)!;

  return {
    // Estado
    tab, setTab,
    color, sidebar, dark,
    activeColor, activeSidebar,
    // Handlers
    handleColor,
    handleSidebar,
    handleDark,
  };
}
