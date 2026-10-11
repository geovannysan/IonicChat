import { RefreshTokenInterceptor } from "@/interceptor/refresh-token.interceptor";
import axios from "axios";

// Leer la URL base de las variables de entorno


const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para añadir el token de autenticación a cada solicitud

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
);
RefreshTokenInterceptor(apiClient, apiClient);
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            globalThis.location.href = '/login';
        }
        return Promise.reject(error);
    },
)
export default apiClient;
