
import { logger } from './logger';
import { config } from './config';

export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = config.getDatabase().maxRetries,
  delay: number = config.getDatabase().retryDelay
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      logger.warn(`${operationName} failed (attempt ${attempt}/${maxRetries})`, {
        error: lastError.message,
        attempt,
        maxRetries
      });

      if (attempt === maxRetries) {
        logger.error(`${operationName} failed after ${maxRetries} attempts`, lastError);
        throw lastError;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

export function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'SQLITE_BUSY',
    'SQLITE_LOCKED',
    'database is locked',
    'database connection error',
    'timeout',
    'network error'
  ];

  return retryableMessages.some(msg => 
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}
