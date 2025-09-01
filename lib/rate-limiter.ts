
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: Request) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(request: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }
    
    // Extract IP from headers (Cloudflare specific)
    const forwarded = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';
    
    return forwarded.split(',')[0].trim();
  }

  async isAllowed(request: Request): Promise<{ allowed: boolean; resetTime?: number; remaining?: number }> {
    const key = this.getKey(request);
    const now = Date.now();
    
    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      
      return {
        allowed: true,
        resetTime: this.store[key].resetTime,
        remaining: this.config.maxRequests - 1
      };
    }
    
    const entry = this.store[key];
    
    // Reset if window has expired
    if (entry.resetTime < now) {
      entry.count = 1;
      entry.resetTime = now + this.config.windowMs;
      
      return {
        allowed: true,
        resetTime: entry.resetTime,
        remaining: this.config.maxRequests - 1
      };
    }
    
    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0
      };
    }
    
    entry.count++;
    
    return {
      allowed: true,
      resetTime: entry.resetTime,
      remaining: this.config.maxRequests - entry.count
    };
  }
}

// Rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 login attempts per 15 minutes
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // 100 API calls per 15 minutes
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20 // 20 uploads per hour
});
