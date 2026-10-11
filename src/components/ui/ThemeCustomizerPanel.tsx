import { Palette, LayoutTemplate, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useThemeCustomizer,
  COLOR_THEMES,
  SIDEBAR_THEMES,
  type ThemeTab,
} from "@/hooks/useThemeCustomizer";

/**
 * Panel de personalización de tema.
 * Diseño tomado de dashboard-chat/ThemeCustomizer.tsx.
 * La lógica vive en useThemeCustomizer — este componente solo renderiza.
 */
export function ThemeCustomizerPanel() {
  const {
    tab, setTab,
    color, sidebar,
    activeColor, activeSidebar,
    handleColor, handleSidebar,
  } = useThemeCustomizer();

  return (
    <div className="flex flex-col gap-0 rounded-2xl border border-border bg-card overflow-hidden">

    

      {/* ── Tabs: Color principal / Sidebar ── */}
      <div className="flex border-b border-border">
        {(["color", "sidebar"] as ThemeTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer",
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "color" ? (
              <><Palette className="w-3.5 h-3.5" /> Color</>
            ) : (
              <><LayoutTemplate className="w-3.5 h-3.5" /> Sidebar</>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: colores principales ── */}
      {tab === "color" && (
        <div className="p-3 grid grid-cols-2 gap-2">
          {COLOR_THEMES.map((t) => {
            const active = color === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleColor(t.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium",
                  "transition-all duration-150 cursor-pointer",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                  style={{
                    background: t.color,
                    outline: active ? `2px solid ${t.color}` : "none",
                    outlineOffset: "2px",
                  }}
                />
                <span className="truncate flex-1 text-left">{t.label}</span>
                {active && <Check className="w-3 h-3 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Tab: colores del sidebar ── */}
      {tab === "sidebar" && (
        <div className="p-3 grid grid-cols-3 gap-2">
          {SIDEBAR_THEMES.map((s) => {
            const active = sidebar === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSidebar(s.id)}
                title={s.label}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-medium",
                  "transition-all duration-150 cursor-pointer",
                  active
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-muted-foreground",
                )}
              >
                {/* Mini preview */}
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden flex"
                  style={{ background: s.bg }}
                >
                  <div className="flex flex-col justify-center gap-1 px-1.5 w-full">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full opacity-60"
                        style={{ background: s.fg, width: i === 1 ? "80%" : "60%" }}
                      />
                    ))}
                  </div>
                </div>
                <span className="truncate w-full text-center text-muted-foreground">
                  {s.label}
                </span>
                {active && <Check className="w-3 h-3 text-primary" />}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Footer resumen ── */}
      <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {activeColor.label} · {activeSidebar.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ background: activeColor.color }}
          />
          <span
            className="w-3 h-3 rounded-sm shadow-sm"
            style={{ background: activeSidebar.bg }}
          />
        </div>
      </div>
    </div>
  );
}
