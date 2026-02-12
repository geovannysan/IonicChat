/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import apiService from '../services/api';
import type { SoporteTicket } from '../types';

interface TicketStore {
  tickets: SoporteTicket[];
  selectedTicket: SoporteTicket | null;
  isLoading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  getTicket: (id: number) => Promise<SoporteTicket | null>;
  createTicket: (ticket: Partial<SoporteTicket>) => Promise<void>;
  updateTicket: (id: number, ticket: Partial<SoporteTicket>) => Promise<void>;
  deleteTicket: (id: number) => Promise<void>;
  setSelectedTicket: (ticket: SoporteTicket | null) => void;
}

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: [],
  selectedTicket: null,
  isLoading: false,
  error: null,

  fetchTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      // Usar el endpoint exacto del proyecto web
      const response: any = await apiService.request('/cuenta/1/1', {
        method: 'POST'
      })
      const tickets = response.messages 
      

      set({ tickets: tickets, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error cargando tickets',
        isLoading: false,
        tickets: []
      });
    }
  },

  getTicket: async (id: number): Promise<SoporteTicket | null> => {
    set({ isLoading: true, error: null });
    try {
      const response:any = await apiService.request(`/cuenta/ticket/${id}`);
      set({ selectedTicket: response, isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.message || 'Error cargando ticket',
        isLoading: false
      });
      return null;
    }
  },

  createTicket: async (ticketData: Partial<SoporteTicket>) => {
    set({ isLoading: true, error: null });
    try {
      const response:any = await apiService.request('/cuenta/createTicket', {
        method: 'POST',
        data: ticketData
      }) 

      set((state) => ({
        tickets: [response, ...state.tickets],
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Error creando ticket',
        isLoading: false
      });
    }
  },

  updateTicket: async (id: number, ticketData: Partial<SoporteTicket>) => {
    set({ isLoading: true, error: null });
    try {
      const response:SoporteTicket = await apiService.request(`/cuenta/updateTicket/${id}`, {
        method: 'PUT',
        data: ticketData
      }) 

      set((state) => ({
        tickets: state.tickets.map(t => t.id === id ? response : t),
        selectedTicket: state.selectedTicket?.id === id ? response : state.selectedTicket,
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Error actualizando ticket',
        isLoading: false
      });
    }
  },

  deleteTicket: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.request(`/cuenta/deleteTicket/${id}`, {
        method: 'DELETE'
      });

      set((state) => ({
        tickets: state.tickets.filter(t => t.id !== id),
        selectedTicket: state.selectedTicket?.id === id ? null : state.selectedTicket,
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Error eliminando ticket',
        isLoading: false
      });
    }
  },

  setSelectedTicket: (ticket: SoporteTicket | null) => {
    set({ selectedTicket: ticket });
  }
}));
