/* eslint-disable @typescript-eslint/no-explicit-any */
// store/useDataStore.ts - Exactamente igual que dashboard-chat
import apiService from '@/services/api'
import { Team, User } from '@/types'
import { create } from 'zustand'

interface DataStore {
  chats: any[],
  chatHistory: any[]
  ticketChat: any | null,
  notify: INotificatyion[],
  isLoading: boolean
  error: string | null
  count: number,
  pageNumber: number,
  countchat: number
  "hasMorechat": boolean
  "hasMore": boolean
  fetchUsers: (id: number) => Promise<void>
  fetchTickestmas: (id: number) => Promise<void>
  fetchChatHistory: (ids: number, id: number) => Promise<void>
  fetchChatHistoryAdd: (ids: number, id: number) => Promise<void>
  addChatTickte: (chat: any) => void
  addChatnotify: (chat: INotificatyion) => void
  deleteChat: (id: number) => void;
  deleteNotify: (id: string) => void;
  deletteChat: () => void;
  setSelectedTicketChat: (user: ChatItem) => void;
  setPageNumber: (id: number) => Promise<void>;
  addMessage: (msg: any) => void
}

export const useDataStore = create<DataStore>((set) => ({
  chats: [],
  chatHistory: [],
  notify: [],
  ticketChat: {
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
      id: 0,
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
  },
  isLoading: false,
  error: null,
  count: 0,
  countchat: 0,
  pageNumber: 0,
  hasMorechat: false,
  hasMore: false,
  fetchTickestmas: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const data: any = await apiService.getTicketsList(id)
      const { ticket, hasMore, count } = data
      set((state) => {
        return { chats: [...state.chats, count, ...ticket], isLoading: false }
      })
      set({ count: id, hasMore: hasMore })
    } catch (error: any) {
      set({ error: error.message || 'Error desconocido', isLoading: false })
    }
  },
  setPageNumber: async (id) => {
    set({ pageNumber: id })
  },
  fetchUsers: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const data: any = await apiService.getTicketsList(id)
      const { ticket, count, hasMore } = data
      set(() => {

        return { chats: ticket, isLoading: false }
      })
      set({ count: count, hasMore: hasMore })
    } catch (error: any) {
      set({ error: error.message || 'Error desconocido', isLoading: false })
    }
  },
  deletteChat: () => {
    set({
      chatHistory: [],
      isLoading: false,
      ticketChat: {
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
          id: 0,
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
    })
  },

  fetchChatHistory: async (contactId, id) => {
    set({ isLoading: true, error: null })
    try {
      const data: any = await apiService.getChatHistory(contactId, id)
      const { messages: chat, count, hasMore } = data

      set({
        chatHistory: chat, isLoading: false
      })


      set({ countchat: count, hasMorechat: hasMore })
    } catch (error: any) {
      set({ error: error.message || 'Error desconocido', isLoading: false })
    }
  },
  fetchChatHistoryAdd: async (contactId, id) => {
    set({ isLoading: true, error: null })
    try {
      const data: any = await apiService.getChatHistory(contactId, id)
      const { messages: chat, count, hasMore } = data

      set((state) => {

        return { chatHistory: [...chat, ...state.chatHistory], isLoading: false }
      })
      set({ countchat: count, hasMorechat: hasMore })
    } catch (error: any) {
      set({ error: error.message || 'Error desconocido', isLoading: false })
    }
  },

  deleteChat: (id: number) => {
    set((state) => (

      {
        chats: state.chats.filter((chat) => chat.id !== id),
        ticketChat: state.ticketChat.id === id ? {
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
            id: 0,
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
        } : state.ticketChat
      }))
    set((state) => (
      {
        count: state.count - 1
      }
    ))
  },
  deleteNotify: (id: string) => {
    set((state) => ({
      notify: state.notify.filter((chat) => chat.id !== id),

    }))
  },
  setSelectedTicketChat: async (ticket: ChatItem) => {
    set({
      ticketChat: ticket,
      isLoading: false
    });
  },

  addChatTickte: (chat) => {
    set((state) => {
      const exists = state.chats.some((c) => c.id === chat.id);
      const nuevos = exists
        ? state.chats.map((c) => (c.id === chat.id ? chat : c)) // reemplaza si existe
        : [chat, ...state.chats,]
      return {
        chats: nuevos
        ,
      };
    })
    set((state) => {
      const exits = state.ticketChat.id === chat.id;
      return {
        ticketChat: exits ? { ...chat, Contact: { ...chat.Contact } } : state.ticketChat,

      };
    })
  },
  addChatnotify: (chat) =>
    set((state) => {
      const exists = state.notify.some((c) => c.id === chat.id);
      return {
        notify: exists
          ? state.notify.map((c) => (c.id === chat.id ? chat : c))
          : [...state.notify, chat]
      }
    }),
  addMessage: (message: any) =>
    set((state) => {
      const exists = state.chatHistory.some((m) => m.id === message.id);
      const updated = exists
        ? state.chatHistory.map((m) => (m.id === message.id ? message : m))
        : [...state.chatHistory, message];
      return { chatHistory: updated };
    }),

}))

export interface ConexionType {
  id: number
  tipo: string
}

export interface ChatPerfil {
  conexionID: number,
  id: number
  name?: string
  conexiontype: ConexionType
}

export interface Contact {
  id: number
  name: string
  number: string
  profilePicURl: string
  typeContact: string
  isGroup: boolean
  createdAt: string
  updatedAt: string
  extraInfo: []
  chatHistory?: any[]
}

export interface ChatItem {
  id: number
  status: string
  unreadMessages: number
  lastMessage: string
  isGroup: boolean
  userId: number | null
  contactId: number
  whatsappId: number
  queueId: number | null
  etiquetas?: { id: number, name: string, color: string }[]
  createdAt: string
  updatedAt: string
  ChatPerfil: ChatPerfil
  Contact: Contact
  Teams?: Team
  User?: User
}

export interface INotificatyion {
  id: string,
  body: string,
  type: string,
  title: string,
  objeto: any
}
