
export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logLevel: keyof LogLevel = process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    let log = `[${timestamp}] ${level}: ${message}`;
    
    if (context) {
      log += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      log += ` | Error: ${error.message} | Stack: ${error.stack}`;
    }
    
    return log;
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'ERROR',
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
    
    console.error(this.formatLog(entry));
    
    // In production, you might want to send this to an external service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'WARN',
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    
    console.warn(this.formatLog(entry));
  }

  info(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'INFO',
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    
    console.info(this.formatLog(entry));
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.logLevel === 'DEBUG') {
      const entry: LogEntry = {
        level: 'DEBUG',
        message,
        timestamp: new Date().toISOString(),
        context,
      };
      
      console.debug(this.formatLog(entry));
    }
  }
}

export const logger = new Logger();
