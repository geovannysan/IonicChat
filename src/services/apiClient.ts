import { RefreshTokenInterceptor } from "@/interceptor/refresh-token.interceptor";
import axios from "axios";

// Leer la URL base de las variables de entorno


const apiClient = axios.create({
    headers: {
        "Content-Type": "application/json",

    },
    withCredentials: true,
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
export default apiClient;
