
import { logger } from './logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

class Validator {
  static email(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    return {
      isValid,
      errors: isValid ? [] : ['Invalid email format'],
      sanitized: isValid ? email.toLowerCase().trim() : undefined
    };
  }

  static password(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? password : undefined
    };
  }

  static slug(slug: string): ValidationResult {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const sanitized = slug.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    const isValid = slugRegex.test(sanitized) && sanitized.length > 0;
    
    return {
      isValid,
      errors: isValid ? [] : ['Invalid slug format'],
      sanitized: isValid ? sanitized : undefined
    };
  }

  static articleTitle(title: string): ValidationResult {
    const sanitized = title.trim();
    const errors: string[] = [];
    
    if (sanitized.length === 0) {
      errors.push('Title is required');
    } else if (sanitized.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }

  static articleContent(content: string): ValidationResult {
    const sanitized = content.trim();
    const errors: string[] = [];
    
    if (sanitized.length === 0) {
      errors.push('Content is required');
    } else if (sanitized.length > 100000) {
      errors.push('Content must be less than 100,000 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }

  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }
}

export { Validator };

// Request validation middleware
export function validateRequest(schema: Record<string, (value: any) => ValidationResult>) {
  return (data: Record<string, any>): ValidationResult => {
    const errors: string[] = [];
    const sanitized: Record<string, any> = {};
    
    for (const [key, validator] of Object.entries(schema)) {
      const value = data[key];
      const result = validator(value);
      
      if (!result.isValid) {
        errors.push(...result.errors.map(err => `${key}: ${err}`));
      } else if (result.sanitized !== undefined) {
        sanitized[key] = result.sanitized;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  };
}
