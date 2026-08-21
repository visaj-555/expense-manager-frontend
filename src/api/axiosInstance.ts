import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type { ApiResponse } from '../types/api.types';

// API base URL
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:3600/api/v1';

// Create a reusable Axios instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Runs BEFORE every request
// Automatically adds the access token
axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// Prevent multiple refresh requests at the same time
let isRefreshing = false;

// Requests waiting for the new access token
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];


// Tell waiting requests whether refresh succeeded or failed
function processQueue(error: unknown, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  refreshQueue = [];
}


// Runs AFTER a response comes back
axiosInstance.interceptors.response.use(
  // Successful response → return normally
  (response) => response,

  // Error response
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors.
    // Don't retry login, refresh, or register requests.
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    // Get the refresh token
    const refreshToken = tokenStorage.getRefreshToken();

    // No refresh token → user must authenticate again
    if (!refreshToken) {
      tokenStorage.clearTokens();
      return Promise.reject(error);
    }


    // Someone else is already refreshing.
    // Put this request in the waiting queue.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            // Use the new token and retry this request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }


    // We are the first request to start refreshing
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Get new access + refresh tokens
      // Use plain axios to avoid triggering this interceptor again
      const { data } =
        await axios.post<
          ApiResponse<{
            accessToken: string;
            refreshToken: string;
          }>
        >(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
        );

      // Extract the new tokens
      const {
        accessToken,
        refreshToken: newRefreshToken,
      } = data.data!;

      // Save new tokens
      tokenStorage.setTokens(
        accessToken,
        newRefreshToken,
      );

      // Give the new token to all waiting requests
      processQueue(null, accessToken);

      // Update and retry the original request
      originalRequest.headers.Authorization =
        `Bearer ${accessToken}`;

      return axiosInstance(originalRequest);

    } catch (refreshError) {
      // Refresh failed → fail all waiting requests
      processQueue(refreshError, null);

      // Remove invalid tokens
      tokenStorage.clearTokens();

      return Promise.reject(refreshError);

    } finally {
      // Refresh operation is finished
      isRefreshing = false;
    }
  },
);
