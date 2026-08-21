export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    correlationId?: string;
    timestamp: string;
  };
  error?: {
    code: string;
    details?: any;
  };
}
