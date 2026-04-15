import { AxiosError } from 'axios';

export interface ApiErrorBody {
  message: string;
  statusCode?: number;
}

export function parseApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) return body.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Ocorreu um erro inesperado.';
}
