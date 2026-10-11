"use client";

import { useMemo, useState } from "react";
import {
  HandMetalIcon,
  Search,
  RefreshCw,
} from "lucide-react";
import { cn, formatWhatsAppDate } from "../../../lib/utils";
import { Avatar, AvatarFallback } from "../avatar";
import { Badge } from "../Badge";
import { useAuth } from "@/hooks/useAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusDot = (status: string) => {
  switch (status) {
    case "abierta":
    case "open":
      return "bg-emerald-500";
    case "pendiente":
    case "pending":
      return "bg-amber-500";
    case "asignada":
    case "assigned":
      return "bg-red-500";
    default:
      return "bg-slate-400";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "open":
      return "Abierta";
    case "pending":
      return "Pendiente";
    case "assigned":
      return "Asignada";
    case "completed":
      return "Completada";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  chats: {
    id: number;
    name: string;
    messages: string;
    avatar: string;
    variant: "secondary" | "ghost";
    ChatItem: any;
  }[];
  onSelectUser?: (user: any) => void;
  onRefresh?: () => void;
}

type TabKey = "all" | "mine" | "pending" | "assigned";

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ chats, onSelectUser, onRefresh }: SidebarProps) {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const sorted = useMemo(() => {
    return [...chats].sort((a, b) => {
      const aT = a.ChatItem.updatedAt ? new Date(a.ChatItem.updatedAt).getTime() : 0;
      const bT = b.ChatItem.updatedAt ? new Date(b.ChatItem.updatedAt).getTime() : 0;
      return bT - aT;
    });
  }, [chats]);

  const filtered = useMemo(() => {
    const text = searchTerm.toLowerCase().trim();
    return sorted.filter((c) => {
      const ci = c.ChatItem;
      if (activeTab === "mine" && ci.userId !== user?.id) return false;
      if (activeTab === "pending" && ci.userId != null) return false;
      if (activeTab === "assigned" && ci.status !== "assigned") return false;
      if (text) {
        const haystack = [
          c.name,
          c.messages,
          ci.Contact?.number,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(text)) return false;
      }
      return true;
    });
  }, [sorted, activeTab, searchTerm, user?.id]);

  const counts = useMemo(() => ({
    all: sorted.length,
    mine: sorted.filter((c) => c.ChatItem.userId === user?.id).length,
    pending: sorted.filter((c) => c.ChatItem.userId == null).length,
    assigned: sorted.filter((c) => c.ChatItem.status === "assigned").length,
  }), [sorted, user?.id]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all",      label: "Todas" },
    { key: "mine",     label: "Mías" },
    { key: "pending",  label: "Pend." },
    { key: "assigned", label: "Asig." },
  ];

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden select-none">

      {/* ── Header búsqueda + refresh ── */}
      <div className="p-3 border-b border-border space-y-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar conversación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 h-8 rounded-full bg-muted/50 border border-border text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refrescar"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-0.5 bg-muted/50 p-0.5 rounded-lg">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                activeTab === key
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
              <span
                className={cn(
                  "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[9px] font-semibold",
                  activeTab === key
                    ? "bg-muted-foreground/15 text-foreground"
                    : "bg-muted-foreground/10 text-muted-foreground"
                )}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Lista ── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-xs text-muted-foreground">Sin conversaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((chat) => {
              const ci = chat.ChatItem;
              const isMine = ci.userId === user?.id;
              const isOther = ci.userId != null && !isMine;
              const isSelected = chat.variant === "secondary";

              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectUser?.(ci)}
                  aria-label={`Seleccionar chat con ${chat.name || "contacto"}`}
                  className={cn(
                    "w-full text-left relative flex gap-3 p-3 transition-colors duration-150 border-l-2 cursor-pointer",
                    isSelected
                      ? "bg-primary/10 border-l-primary hover:bg-primary/15"
                      : "bg-transparent border-l-transparent hover:bg-muted/40"
                  )}
                >
                  {/* Avatar + badge MI/AG */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <Avatar className="w-9 h-9 border border-border shadow-sm">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                        {(chat.name || "?").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {(isMine || isOther) && (
                      <div className="relative">
                        <Badge variant="outline" className="rounded-full h-4 px-1 text-[9px] font-semibold">
                          {isMine ? "MI" : "AG"}
                        </Badge>
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card",
                            isMine ? "bg-green-500" : "bg-yellow-500"
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    {/* Canal + fecha */}
                    <div className="flex items-center justify-between gap-1">
                      <Badge
                        variant="outline"
                        className="rounded-full pl-1 pr-2 py-0 h-4 gap-1 text-[10px] font-medium"
                      >
                        {!ci?.ChatPerfil?.conexionID && (
                          <HandMetalIcon className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className="truncate max-w-[80px] text-muted-foreground">
                          {ci?.ChatPerfil?.name || "PaperLayer"}
                        </span>
                      </Badge>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatWhatsAppDate(ci.updatedAt) || "1h"}
                      </span>
                    </div>

                    {/* Nombre */}
                    <p className="text-sm font-semibold truncate text-foreground">
                      {chat.name || "Sin nombre"}
                    </p>

                    {/* Último mensaje */}
                    <p className="text-xs truncate text-muted-foreground leading-normal">
                      {chat.messages
                        ? String(chat.messages).substring(0, 55)
                        : "Sin mensajes"}
                    </p>

                    {/* Estado + equipo + etiquetas */}
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold border",
                          "bg-secondary text-secondary-foreground border-border"
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", getStatusDot(ci.status))} />
                        {getStatusLabel(ci.status)}
                      </span>

                      {ci.Teams?.name && (
                        <Badge variant="outline" className="rounded-full h-4 px-1.5 text-[9px] font-medium gap-1">
                          {ci.Teams.color && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: ci.Teams.color }}
                            />
                          )}
                          {ci.Teams.name}
                        </Badge>
                      )}

                      {ci.etiquetas && ci.etiquetas.length > 0 && (
                        <div className="flex items-center gap-0.5">
                          {ci.etiquetas.slice(0, 3).map((tag: any) => (
                            <span
                              key={tag.id ?? tag.color}
                              title={tag.name}
                              className="w-3.5 h-3.5 rounded-full border border-card shadow-sm shrink-0"
                              style={{ backgroundColor: tag.color || "#9ca3af" }}
                            />
                          ))}
                        </div>
                      )}

                      {ci.unreadMessages > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold shrink-0">
                          {ci.unreadMessages}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SoftBadgeDemo (status badge, used by ChatListItem) ───────────────────────

function SoftBadgeDemo({ status }: { status: string }) {
  const map: Record<string, { dot: string; label: string; cls: string }> = {
    pending:   { dot: "bg-amber-500",   label: "Pendiente",  cls: "text-amber-500 hover:bg-amber-500/10" },
    assigned:  { dot: "bg-red-500",     label: "Asignada",   cls: "text-red-500 hover:bg-red-500/10" },
    open:      { dot: "bg-emerald-500", label: "Abierta",    cls: "text-emerald-500 hover:bg-emerald-500/10" },
    completed: { dot: "bg-red-500",     label: "Completada", cls: "text-red-500 hover:bg-red-500/10" },
  };
  const entry = map[status];
  if (!entry) return null;
  return (
    <Badge
      className={cn(
        "bg-transparent dark:bg-transparent shadow-none rounded-full text-[10px]",
        entry.cls
      )}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full mr-1.5", entry.dot)} />
      {entry.label}
    </Badge>
  );
}

export default SoftBadgeDemo;
