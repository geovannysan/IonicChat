import axios from "axios";

// Leer la URL base de las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL 

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    }
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
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
