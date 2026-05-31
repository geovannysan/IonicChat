import type { AxiosInstance, AxiosResponse } from 'axios';

type PendingItem = {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

export function RefreshTokenInterceptor(client: AxiosInstance, refreshClient: AxiosInstance): void {
  let isRefreshing = false;
  let pendingQueue: PendingItem[] = [];

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        throw error;
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(() => client(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshClient.post('/auth/refresh');
        if (data?.token) {
          localStorage.setItem('token', data.token);
          originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        }
        pendingQueue.forEach(({ resolve }) => resolve(null));
        pendingQueue = [];
        globalThis.dispatchEvent(new Event('auth:token-refreshed'));
        return client(originalRequest);
      } catch (refreshError) {
        pendingQueue.forEach(({ reject }) => reject(refreshError));
        pendingQueue = [];
        if (
          !originalRequest.url?.includes('/auth/me') &&
          !globalThis.location.pathname.includes('/forgot-password/')
        ) {
          globalThis.dispatchEvent(new Event('auth:logout'));
        }
        throw error;
      } finally {
        isRefreshing = false;
      }
    },
  );
}
