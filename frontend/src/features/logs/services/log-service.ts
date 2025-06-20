import { apiClient } from '@/lib/api-client';
import { PaginatedLogsResponse$, type LogQuery } from '@repo/core/schemas';
import { type AxiosRequestConfig } from 'axios';

export class LogService {
  private static async request<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient.request<T>({
      url: endpoint,
      ...config,
    });

    return response.data;
  }
  static async getLogs(query: LogQuery) {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await this.request('/api/logs', {
      method: 'GET',
      params,
    });

    return PaginatedLogsResponse$.parse(response);
  }

  static async cleanupLogs() {
    console.warn(
      'LogService.cleanupLogs is deprecated. Use useLogCleanup hook instead.'
    );

    return await this.request('/api/logs/cleanup', {
      method: 'POST',
    });
  }
}
