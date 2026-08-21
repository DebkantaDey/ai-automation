import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useTenantStore } from '../stores/tenant-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach Auth & Tenant Headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Resolve tenant headers from store or localStorage
      const tenantState = useTenantStore.getState();
      const orgId = tenantState.currentOrganization?.id || localStorage.getItem('active_org_id');
      const wsId = tenantState.currentWorkspace?.id || localStorage.getItem('active_workspace_id');

      if (orgId && config.headers && !config.headers['x-organization-id']) {
        config.headers['x-organization-id'] = orgId;
      }

      if (wsId && config.headers && !config.headers['x-workspace-id']) {
        config.headers['x-workspace-id'] = wsId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Extract data payload & handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    // If backend wrapped in standard ApiResponse envelope, return data directly or full object
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      return response.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('auth_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const newTokens = res.data?.data || res.data;

          if (newTokens?.accessToken) {
            localStorage.setItem('auth_access_token', newTokens.accessToken);
            if (newTokens.refreshToken) {
              localStorage.setItem('auth_refresh_token', newTokens.refreshToken);
            }

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch {
          // Token refresh failed; clear session
          localStorage.removeItem('auth_access_token');
          localStorage.removeItem('auth_refresh_token');
          localStorage.removeItem('auth_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  },
);
