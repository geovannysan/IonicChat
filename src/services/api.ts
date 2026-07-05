import axios, { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  private readonly baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.setupInterceptors();
  }

  setToken(token: string) {
    this.token = token;
  }

  private setupInterceptors() {
    // Cargar token del localStorage al inicializar
    const token = localStorage.getItem("token");
    if (token) {
      this.token = token
    }
  }

  public async request<T>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      ...options,
      url: endpoint,
      withCredentials: true,
    };

    try {
      const response = await apiClient.request<T>(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.response?.data?.mensaje || error.message;
        throw new Error(`[${status}] ${message}`);
      }
      throw error;
    }
  }



  // Auth - Endpoints exactos de dashboard-chat
  async login(email: string, password: string): Promise<{ token: string, user: unknown }> {
    return this.request('/Users/Login', {
      method: 'POST',
      data: JSON.stringify({ email, password }),
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async logout() {
    return this.request('/logout', {
      method: 'DELETE',
    });
  }

  // Tickets - Endpoints exactos de dashboard-chat
  async getTicketsList(page: number) {
    return this.request(`/Tickets/list/${page}`);
  }

  async getChatHistory(contactId: number, page: number) {
    return this.request(`/Chat/ticket/${contactId}/${page}`);
  }

  // Contacts - Endpoints exactos de dashboard-chat
  async getContacts() {
    return this.request('/Contacto');
  }

  async getContact(id: string) {
    return this.request(`/Contacto/${id}`);
  }

  // Users - Endpoints exactos de dashboard-chat
  async getUsers(page: number) {
    return this.request(`/users/${page}`);
  }

  async updateUser(id: number, data: unknown) {
    return this.request(`/Users/${id}`, {
      method: 'PUT',
      data: JSON.stringify(data),
    });
  }

  // Teams - Endpoints exactos de dashboard-chat
  async getTeams(page: number) {
    return this.request(`/teams/${page}`);
  }

  // Etiquetas - Endpoints exactos de dashboard-chat
  async getEtiquetas(page: number) {
    return this.request(`/etiquetas/${page}`);
  }

  // Templates - Endpoints exactos de dashboard-chat
  async getTemplates() {
    return this.request('/templates');
  }

  // Canales - Endpoints exactos de dashboard-chat
  async getCanales() {
    return this.request('/canales');
  }

  // Analytics - Endpoints exactos de dashboard-chat
  async getAnalytics() {
    return this.request('/cuenta/anality');
  }

  // Soporte Tickets - Endpoints exactos de dashboard-chat
  async getSoporteTickets(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/soporte/tickets${query}`);
  }

  async getSoporteTicket(id: string) {
    return this.request(`/soporte/tickets/${id}`);
  }

  async updateSoporteTicket(id: string, updates: unknown) {
    return this.request(`/soporte/tickets/${id}`, {
      method: 'PUT',
      data: JSON.stringify(updates),
    });
  }
  async UpdatePerfil(id: string, updates: unknown) {
    return this.request(`/Users/${id}`, {
      method: 'PUT',
      data: JSON.stringify(updates),
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
