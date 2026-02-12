/* eslint-disable @typescript-eslint/no-explicit-any */

interface ExtraInfo {
  id?: number;
  name: string;
  value: string;
}
export interface Contact {
  id: number;
  name: string;
  number: string;
  profilePicURl: string | null;
  typeContact: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  extraInfo: ExtraInfo[];
}

export interface Message {
  mediaUrl: string | null;
  id: string;
  ask: number;
  read: boolean;
  fromMe: boolean;
  body: string;
  mediaType: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
  quotedMsgId: string | null;
  ticketid: number;
  contactid: string | null;
  userId: string | null;
  Contacts?: Contact;
  quotedMsg?: Message;
  isLoading?: boolean;
}

export interface Etiqueta {
  id: number
  name: string
  color: string
  detalle: string
}
export interface User {
  id: number
  name: string
  profile: string
  email: string

  createdAt?: string
  updatedAt?: string
  teams?: Team[]
  acount?: Acount
  userAccount?: Acount
}
export interface Acount {
  id: number
  notificacion: boolean
  controlhorario: boolean
  adicion: string
  horario?: {
    salida?: string
    entrada?: string
  }
  userId: number
}
export interface ConexionType {
  id: number
  tipo?: string,
  description?: string
}

export interface Team {
  id: number | 0
  name: string
  color: string
  greetingMessage: string | null
  users?: User[]
  createdAt?: string
  updatedAt?: string

}

export interface ChatPerfil {
  id?: number
  conexionID: number
  name: string
  header?: string
  "session"?: string
  "qrcode"?: string
  "status"?: string
  "battery"?: string

  "plugged"?: boolean
  "retries"?: number
  "greetingMessage"?: string
  "isDefault"?: boolean
  "farewellmessage"?: any
  "createdAt"?: string
  "updatedAt"?: string
  conexiontype?: ConexionType,
  webhookConfigId?: number | string;
  webhookConfig?: IWebhookConfig
  accountId?: string;
  acount?: object;
}


export interface IWebhookConfig {
  id: number;
  chatPerfilId: number;
  url: string;
  metodo: "POST" | "GET";
  headers?: Record<string, string>;
  payload?: Record<string, any>;
  usaWebhookResponse: boolean;
  activo: boolean;
  descripcion?: string;
  typconfig?: string;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateDifusoDto {
  name: string;
  body: string;
  accountId: string;
  inicio?: Date;
  intervalo: number;
  chatPerfilId?: number;
  mediaType?: string;
  mediaUrl?: string;
  importContacts?: { name: string; phone: string; }[];
  contactIds?: number[];
  extraPhones?: string[];
}

export interface Ifilters {
  sessionID?: string | null;
  fechaInicio: string;
  fechaFin: string;
  whatsappId?: number | null;
  userId?: number | null;
}

/* ─────────────────────────────────────────────
   SOPORTE TICKETS
───────────────────────────────────────────── */
export interface SoporteTicket {
  id: number;

  accountId: string;
  contactId?: number | null;//no usar
  assignedUserId?: number | null;

  subject?: string | null;
  content?: string | null;
  channel?: string | null;

  requesterName?: string | null;
  requesterEmail?: string | null;
  requesterPhone?: string | null;

  visitDate?: Date | null;
  shift?: "MANANA" | "TARDE" | "NOCHE" | null;
  scheduledFrom?: string | null;

  priority?: "baja" | "media" | "alta" | "urgente" | null;
  status?:
  | "abierto"
  | "asignado"
  | "en_progreso"
  | "esperando_cliente"
  | "resuelto"
  | "cerrado"
  | "cancelado";

  latitude?: string | null;
  longitude?: string | null;
  address?: string | null;
  assignedUser?: {
    "name"?: string | null,
    "id"?: number | null
  }
  user?: {
    "name"?: string | null,
    "id"?: number | null,
    "typeContact"?: string | null
  }
  createdBy?: number | null;
  createdAt: Date;
  updatedAt: Date;
  "adjuntos": []
  "mensajes": []
  "asignasio": []
}

/* ─────────────────────────────────────────────
   SOPORTE ASIGNACIONES
───────────────────────────────────────────── */
export interface SoporteAsignacion {
  id: number;

  ticketId: number;
  userId: number;
  assignedBy?: number | null;

  active: boolean;

  startedAt: Date;
  endedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

/* ─────────────────────────────────────────────
   SOPORTE COMENTARIOS
───────────────────────────────────────────── */
export interface SoporteComentario {
  id: number;

  ticketId: number;
  authorId?: number | null;

  message: string;
  authorType: string;

  createdAt: Date;
  updatedAt: Date;
  user?: {
    "name"?: string | null,
    "id"?: number | null,
    "typeContact"?: string | null
  }
  adjuntos: any[]
}