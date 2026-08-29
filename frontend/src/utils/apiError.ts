import { isAxiosError } from 'axios';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as { message?: string | string[] } | undefined;
    const message = payload?.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message) && message.length > 0) {
      return message.filter((item) => typeof item === 'string').join(', ');
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function isConflictError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 409;
}

export function isBadRequestError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 400;
}
