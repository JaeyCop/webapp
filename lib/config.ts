export interface AppConfig {
  app: {
    name: string;
    url: string;
    environment: 'development' | 'staging' | 'production';
  };
  auth: {
    jwtSecret: string;
    tokenExpiry: string;
    bcryptRounds: number;
  };
  database: {
    maxRetries: number;
    retryDelay: number;
  };
  uploads: {
    maxFileSize: number;
    allowedTypes: string[];
    maxFiles: number;
  };
  rateLimit: {
    auth: {
      windowMs: number;
      maxRequests: number;
    };
    api: {
      windowMs: number;
      maxRequests: number;
    };
    upload: {
      windowMs: number;
      maxRequests: number;
    };
  };
  analytics: {
    enabled: boolean;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
  };
}

class Config {
  private static instance: Config;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private loadConfig(): AppConfig {
    return {
      app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Blog CMS',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
      },
      auth: {
        jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        tokenExpiry: process.env.JWT_EXPIRY || '7d',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
      },
      database: {
        maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3'),
        retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
      },
      uploads: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
        maxFiles: parseInt(process.env.MAX_FILES_PER_UPLOAD || '10'),
      },
      rateLimit: {
        auth: {
          windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
          maxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'),
        },
        api: {
          windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
          maxRequests: parseInt(process.env.API_RATE_LIMIT_MAX || '100'),
        },
        upload: {
          windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW || '3600000'), // 1 hour
          maxRequests: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '20'),
        },
      },
      analytics: {
        enabled: process.env.ENABLE_ANALYTICS === 'true',
      },
      logging: {
        level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
      },
    };
  }

  private validateConfig(): void {
    const requiredEnvVars = [
      'JWT_SECRET',
    ];

    const missingVars = requiredEnvVars.filter(
      varName => !process.env[varName] && this.config.app.environment === 'production'
    );

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    if (this.config.app.environment === 'production' && this.config.auth.jwtSecret === 'dev-secret-change-in-production') {
      throw new Error('JWT_SECRET must be set in production');
    }
  }

  public get(): AppConfig {
    return this.config;
  }

  public getApp() {
    return this.config.app;
  }

  public getAuth() {
    return this.config.auth;
  }

  public getDatabase() {
    return this.config.database;
  }

  public getUploads() {
    return this.config.uploads;
  }

  public getRateLimit() {
    return this.config.rateLimit;
  }

  public getAnalytics() {
    return this.config.analytics;
  }

  public getLogging() {
    return this.config.logging;
  }
}

export const config = Config.getInstance();