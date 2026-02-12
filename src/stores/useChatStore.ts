import { create } from 'zustand';
import apiClient from '@/services/apiClient';
import { User, Team } from '../types';


// Interfaces based on dashboard-chat's useTicketsChat.tsx
export interface ConexionType {
  id: number;
  tipo: string;
}

export interface ChatPerfil {
  conexionID: number;
  id: number;
  name?: string;
  conexiontype: ConexionType;
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
  extraInfo: any[];
  chatHistory?: any[];
}

export interface ChatItem {
  id: number;
  status: string;
  unreadMessages: number;
  lastMessage: string;
  isGroup: boolean;
  userId: number | null;
  contactId: number;
  whatsappId: number;
  queueId: number | null;
  etiquetas?: { id: number; name: string; color: string }[];
  createdAt: string;
  updatedAt: string;
  ChatPerfil: ChatPerfil;
  Contact: Contact;
  Teams?: Team;
  User?: User;
}

export interface Message {
    id: number;
    ticketId: number;
    remoteJid: string;
    fromMe: boolean;
    ack: number;
    body: string;
    mediaType?: string;
    mediaUrl?: string;
    dataJson: string;
    createdAt: string;
    updatedAt: string;
    read: boolean;
    userId: number | null;
    contactId: number;
    quotedMsgId: string | null;
    User: User;
    Contact: Contact;
    quotedMsg: Message | null
}


interface ChatState {
  chats: ChatItem[];
  selectedChat: ChatItem | null;
  messages: Message[];
  isLoadingChats: boolean;
  hasMoreChats: boolean;
  chatCount: number;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  messagesPage: number;
  error: string | null;
}

interface ChatActions {
  fetchChats: (page: number) => Promise<void>;
  setSelectedChat: (chat: ChatItem | null) => Promise<void>;
  fetchMoreMessages: () => Promise<void>;
  addMessage: (message: Message) => void;
  clearChat: () => void;
}

const initialChatState: ChatItem = {
    id: 0,
    status: '',
    unreadMessages: 0,
    lastMessage: '',
    isGroup: false,
    userId: null,
    contactId: 0,
    whatsappId: 0,
    queueId: null,
    createdAt: '',
    updatedAt: '',
    ChatPerfil: {
      id:0,
      conexionID: 0,
      conexiontype: {
        id: 0,
        tipo: ''
      }
    },
    Contact: {
      id: 0,
      name: '',
      number: '',
      profilePicURl: '',
      typeContact: '',
      isGroup: false,
      createdAt: '',
      updatedAt: '',
      extraInfo: []
    }
  }

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  // State
  chats: [],
  selectedChat: null,
  messages: [],
  isLoadingChats: false,
  hasMoreChats: true,
  chatCount: 0,
  isLoadingMessages: false,
  hasMoreMessages: true,
  messagesPage: 1,
  error: null,

  // Actions
  fetchChats: async (page) => {
    set({ isLoadingChats: true, error: null });
    try {
      const { data } = await apiClient.get(`/Tickets/list/${page}`);
      const { ticket, count, hasMore } = data;
      set((state) => {
        const existingIds = new Set(state.chats.map(c => c.id));
        const newChats = ticket.filter((t: ChatItem) => !existingIds.has(t.id));
        return {
          chats: [...state.chats, ...newChats],
          chatCount: count,
          hasMoreChats: hasMore,
          isLoadingChats: false,
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'Error desconocido', isLoadingChats: false });
    }
  },

  setSelectedChat: async (chat) => {
    if (get().selectedChat?.id === chat?.id) return;

    set({ 
      selectedChat: chat, 
      messages: [], 
      messagesPage: 1, 
      hasMoreMessages: true,
      error: null
    });

    if (!chat) return;

    set({ isLoadingMessages: true });
    try {
      const { data } = await apiClient.get(`/Chat/ticket/${chat.id}/1`);
      const { messages, hasMore } = data;
      set({
        messages: messages.reverse(),
        hasMoreMessages: hasMore,
        isLoadingMessages: false,
        messagesPage: 1
      });
    } catch (error: any) {
      set({ error: error.message || 'Error desconocido', isLoadingMessages: false });
    }
  },

  fetchMoreMessages: async () => {
    const { selectedChat, messagesPage, hasMoreMessages, isLoadingMessages } = get();

    if (!selectedChat || !hasMoreMessages || isLoadingMessages) return;

    set({ isLoadingMessages: true });
    const nextPage = messagesPage + 1;
    
    try {
      const { data } = await apiClient.get(`/Chat/ticket/${selectedChat.id}/${nextPage}`);
      const { messages: newMessages, hasMore } = data;
      set((state) => ({
        messages: [...newMessages.reverse(), ...state.messages],
        hasMoreMessages: hasMore,
        messagesPage: nextPage,
        isLoadingMessages: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Error desconocido', isLoadingMessages: false });
    }
  },

  addMessage: (message) => set((state) => {
    // Only add message if it belongs to the selected chat
    if(message.ticketId !== state.selectedChat?.id) return {};

    const exists = state.messages.some(m => m.id === message.id);
    if (exists) {
      // If message already exists, update it
      return {
        messages: state.messages.map(m => m.id === message.id ? message : m)
      };
    }
    // Otherwise, add it to the end
    return {
      messages: [...state.messages, message]
    };
  }),

  clearChat: () => set({ selectedChat: null, messages: [] }),

}));