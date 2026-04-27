import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

// We don't use NEXT_PUBLIC_API_BASE_URL here directly anymore.
// Instead, we use a relative path so that the request hits the Next.js proxy configured in next.config.ts.
// This solves all cross-origin Cookie issues!
const api: AxiosInstance = axios.create({
  baseURL: "", 
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    // Token will be attached by Redux middleware or Thunks if needed
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If it's a 401 Unauthorized error and we haven't already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, put the request in a queue
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Hit the refresh endpoint using the clean axios instance
        // Hit the refresh endpoint using the Next.js proxy
        const response = await axios.post("/api/auth/refresh", {}, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        });
        const newAccessToken = response.data.accessToken;
        
        // Dynamically import Redux to avoid circular dependencies in Axios
        const { store } = await import("@/store");
        const { setAccessToken } = await import("@/store/slices/authSlice");
        store.dispatch(setAccessToken(newAccessToken));
        
        // Update header and process queue
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Log out on refresh failure
        const { store } = await import("@/store");
        const { clearAuth } = await import("@/store/slices/authSlice");
        store.dispatch(clearAuth());
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
