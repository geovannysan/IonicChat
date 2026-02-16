import axios, { AxiosRequestConfig } from "axios";

// API Base Configuration - Exactamente igual que dashboard-chat
const API_BASE_URL = import.meta.env.VITE_API_URL;

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
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.data instanceof FormData;
    const config: AxiosRequestConfig = {
      ...options,
      url,
      headers: {
        // Si es FormData, no ponemos Content-Type para que el navegador lo asigne
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Cache-Control': 'no-cache',
        ...options.headers,
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },

    };

    try {
      const response = await axios.request<T>(config);
      return response.data;
    } catch (error: any) {
      localStorage.setItem("lastError", JSON.stringify(error));
      
      if (error.response?.status === 403) {
        try {
          const refreshResponse = await axios.post(`${this.baseURL}/auth/refresh`, {}, {
            headers: {
              'Content-Type': 'application/json',
              ...(this.token && { Authorization: `Bearer ${this.token}` }),
            },
          });

          if (refreshResponse.status === 200) {
            const data = refreshResponse.data;
            localStorage.setItem("token", JSON.stringify(data.token));
            this.token = data.token;

            // Reintentar la petición original
            const retryConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${data.token}`,
              },
            };
            const retryResponse = await axios.request<T>(retryConfig);
            return retryResponse.data;
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
        }
      }

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
         localStorage.removeItem("user");
         localStorage.clear()
        this.token = null;
       
        throw new Error('Session expired');
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.token = null;
      globalThis.location.href = "/login";
      throw new Error('Session expired');
    }
  }

  // Auth - Endpoints exactos de dashboard-chat
  async login(email: string, password: string) {
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

  async updateUser(id: number, data: any) {
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
  async getSoporteTickets(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/soporte/tickets${query}`);
  }

  async getSoporteTicket(id: string) {
    return this.request(`/soporte/tickets/${id}`);
  }

  async updateSoporteTicket(id: string, updates: any) {
    return this.request(`/soporte/tickets/${id}`, {
      method: 'PUT',
      data: JSON.stringify(updates),
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
