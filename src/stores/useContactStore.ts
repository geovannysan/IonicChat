/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import apiService from '../services/api';
import type { Contact } from '../types';

interface ContactResponse {
  contactos: Contact[];
  hasMore: boolean;
  count: number;
}

interface ContactStore {
  contacts: Contact[];
  chatHistory: any[]
  chatHistorial: any[];
  isLoadingHis: boolean;
  hasMorehist: boolean;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  count: number;
  fetchContacts: (page: number) => Promise<void>;
  searchContacts: (term: string) => Promise<Contact[]>;
  getContact: (id: number) => Promise<Contact | null>;
  createContact: (contact: Partial<Contact>) => Promise<void>;
  updateContact: (id: number, contact: Partial<Contact>) => Promise<void>;
  fetchChatHistory: (ids: number, id: number) => Promise<void>
}

const getUniqueContacts = (existing: Contact[], incoming: Contact[]): Contact[] => {
  const merged = [...existing, ...incoming];
  return merged.filter(
    (item, index, self) => index === self.findIndex(t => t.id === item.id)
  );
};

export const useContactStore = create<ContactStore>((set) => ({
  contacts: [],
  chatHistory: [],
  chatHistorial: [],
  isLoadingHistotail:false,
  hasMoreHistorial:false,
  isLoadingHis: false,
  isLoading: false,
  error: null,
  hasMore: false,
  hasMorehist: false,
  count: 0,

  fetchContacts: async (page: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.request(`/Contacto/0/${page}`) as ContactResponse;

      const { contactos, hasMore, count } = response;

      set((state) => {
        const newContacts = page === 1
          ? contactos || []
          : getUniqueContacts(state.contacts, contactos || []);

        return {
          contacts: newContacts,
          hasMore,
          count,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error desconocido',
        isLoading: false
      });
    }
  },

  searchContacts: async (term: string) => {
    try {
      const response = await apiService.request(`/Contacto/0/1?search=${term}`) as ContactResponse;
      return response.contactos || [];
    } catch (error: any) {
      console.error('Error searching contacts:', error);
      return [];
    }
  },

  getContact: async (id: number): Promise<Contact | null> => {
    try {
      const response = await apiService.request(`/Contacto/${id}`) as Contact;
      return response;
    } catch (error: any) {
      console.error('Error getting contact:', error);
      return null;
    }
  },

  createContact: async (contact: Partial<Contact>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.request('/Contacto', {
        method: 'POST',
        data: contact
      }) as Contact;

      set((state) => ({
        contacts: [response, ...state.contacts] as Contact[],
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Error creando contacto',
        isLoading: false
      });
    }
  },

  updateContact: async (id: number, contact: Partial<Contact>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.request(`/Contacto/${id}`, {
        method: 'PUT',
        data: contact
      }) as Contact;

      set((state) => ({
        contacts: state.contacts.map(c => c.id === id ? response : c) as Contact[],
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Error actualizando contacto',
        isLoading: false
      });
    }
  },
  fetchChatHistory: async (contactId, id) => {
    set({ isLoadingHis: true, error: null })
    try {
      const data = await apiService.request(`/Tickets/chat/${contactId}/${id}`)
      const { chat, hasMore }: any = data
      set((state) => {
        if (id == 1) return { chatHistory: chat, isLoadingHis: false, hasMorehist: hasMore }
        const merged = [...state.chatHistory, ...chat]
        const unique = merged.filter(
          (item, index, self) => index === self.findIndex(t => t.id === item.id)
        )
        return { chatHistory: [...unique], isLoadingHis: false, hasMorehist: hasMore }
      });
    } catch (error: any) {
      set({ error: error.message || 'Error desconocido', isLoadingHis: false })
    }
  }

}));
