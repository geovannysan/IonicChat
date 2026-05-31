"use client";

import { useMemo, useState } from "react";
import {  HandMetalIcon, SearchCheckIcon, UserRoundIcon } from "lucide-react";
import { cn, formatWhatsAppDate } from "../../../lib/utils";
import { Avatar, AvatarFallback } from "../avatar";

import { Input } from "../Input";
import { Badge } from "../Badge";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  chats: {
    id: number
    name: string;
    messages: string;
    avatar: string;
    variant: "secondary" | "ghost";
    ChatItem: any;
  }[];
  onSelectUser?: (user: any) => void;
}

export function Sidebar({ chats, onSelectUser }: SidebarProps) {
   const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<number[]>([]);
  
  const sortedChats = chats

  return (
    <div className="h-full flex flex-col bg-muted/10 dark:bg-muted/20 px-0">
      
     
      <div className="flex-1 overflow-y-auto">
        {sortedChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectUser?.(chat.ChatItem)}
            className={cn(
              "w-full flex flex-col gap-1 p-3 transition-all cursor-pointer hover:bg-muted/30 border-b border-zinc-200 dark:border-zinc-700",
              chat.variant === "secondary" && "bg-cyan-900/10 text-white hover:bg-cyan-900/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col justify-between items-center gap-3 p-2">
                <Avatar className="flex justify-center items-center">
                  <AvatarFallback className="bg-blue-500 text-white">
                    <UserRoundIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>

                {chat.ChatItem.userId != null && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Badge className="rounded-full" variant="outline">
                        <span className="text-xs text-muted-foreground font-medium">
                          {chat.ChatItem.userId == user?.id ? "MI" : "AG"}
                        </span>
                      </Badge>
                      {chat.ChatItem.userId == user?.id && (
                        <div className="h-2.5 w-2.5 ring-2 ring-background rounded-full bg-green-500 absolute bottom-0 right-0"></div>
                      )}
                      {chat.ChatItem.userId != user?.id && (
                        <div className="h-2.5 w-2.5 ring-2 ring-background rounded-full bg-yellow-500 absolute bottom-0 right-0"></div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col w-full gap-1" title={chat.messages}>
                <div className="flex justify-between items-center">
                  <Badge className="rounded-full pl-[3px]" variant="outline">
                    {!chat.ChatItem?.ChatPerfil?.conexionID && (
                      <HandMetalIcon height={20} width={20} />
                    )}
                    <span className="text-xs text-muted-foreground font-medium">
                      {chat.ChatItem?.ChatPerfil?.name || "PaperLayer Channel"}
                    </span>
                  </Badge>

                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <span>{formatWhatsAppDate(chat.ChatItem.updatedAt) || "1h"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-foreground">
                    {chat.name || "Sin nombre"}
                  </span>

                  <span
                    className="text-muted-foreground truncate text-start text-sm"
                    style={{
                      maxHeight: "50px",
                      overflow: "hidden",
                    }}
                  >
                    {chat.messages?.length > 0
                      ? String(chat.messages).substring(0, 37)
                      : "Sin mensajes"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-1 mt-2 flex-wrap w-full pl-18">
              <SoftBadgeDemo status={"" + chat.ChatItem.status} />
              {chat.ChatItem.Teams && (
                <Badge className="rounded-full" variant="outline">
                  <div className="h-1.5 w-1.5 rounded-full mr-2" style={{
                    backgroundColor: chat.ChatItem.Teams?.color
                  }} />
                  {chat.ChatItem.Teams?.name}
                </Badge>
              )}
              {chat.ChatItem.etiquetas && (
                <div className="flex items-center">
                  {chat.ChatItem.etiquetas.slice(0, 3).map((tag: any, idx: number) => (
                    <Badge
                      key={idx}
                      className={cn(
                        "text-white h-5 w-5",
                        tag.color ? "" : "bg-gray-400"
                      )}
                      style={tag.color ? { backgroundColor: tag.color } : {}}
                    >
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SoftBadgeDemo ({status}:{status:string}){
  return (
    <div className="flex items-center gap-3 flex-wrap">
       { status === "pending" &&<Badge className="bg-transparent  dark:bg-transparent hover:bg-amber-600/10 text-amber-500 shadow-none rounded-full">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2" /> Pendiente
      </Badge>}
     {status === "assigned" && <Badge className="bg-transparent  dark:bg-transparent hover:bg-red-600/10 text-red-500 shadow-none rounded-full">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2" /> Asignada
      </Badge>}
    {status === "open" &&  <Badge className="bg-transparent  dark:bg-transparent hover:bg-emerald-600/10 text-emerald-500 shadow-none rounded-full">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" /> Abierta
      </Badge>}
       {status === "completed" && <Badge className="bg-transparent  dark:bg-transparent hover:bg-red-600/10 text-red-500 shadow-none rounded-full">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2" /> Completada
      </Badge>}
    </div>
  );
}

export default SoftBadgeDemo;
