

export interface MaskingConfig {
  
  maskFields?: string[];
  
  customMaskers?: Record<string, (value: unknown) => string>;
  
  strategy?: 'full' | 'partial' | 'hash';
  
  visibleChars?: number;
  
  maskChar?: string;
  
  environmentRules?: Record<string, MaskingConfig>;
}


const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'privateKey',
  'secret',
  'apiKey',
  'apiSecret',
  'accessToken',
  'refreshToken',
  'authorization',
  'token',
  'auth',
  'credential',
  'creditCard',
  'ssn',
  'socialSecurityNumber',
  'email',
  'phone',
  'address',
  'private_key',
  'privateKeyHex',
  'mnemonic',
  'seedPhrase',
];


export class DataMasker {
  private config: Required<MaskingConfig>;

  constructor(config: MaskingConfig = {}) {
    const environment = process.env.NODE_ENV || 'development';
    const envConfig = config.environmentRules?.[environment] || {};
    
    this.config = {
      maskFields: config.maskFields || DEFAULT_SENSITIVE_FIELDS,
      customMaskers: config.customMaskers || {},
      strategy: config.strategy || envConfig.strategy || 'partial',
      visibleChars: config.visibleChars ?? envConfig.visibleChars ?? 4,
      maskChar: config.maskChar || envConfig.maskChar || '*',
      environmentRules: config.environmentRules || {},
    };
  }

  
  maskValue(value: unknown): string {
    if (value === null || value === undefined) {
      return String(value);
    }

    const strValue = String(value);
    
    if (strValue.length === 0) {
      return '';
    }

    switch (this.config.strategy) {
      case 'full':
        return this.config.maskChar.repeat(strValue.length);
      
      case 'hash':
        return this.hashValue(strValue);
      
      case 'partial':
      default:
        return this.partialMask(strValue);
    }
  }

  
  private partialMask(value: string): string {
    if (value.length <= this.config.visibleChars * 2) {
      return this.config.maskChar.repeat(value.length);
    }

    const visible = Math.floor(this.config.visibleChars / 2);
    const start = value.substring(0, visible);
    const end = value.substring(value.length - visible);
    const masked = this.config.maskChar.repeat(value.length - visible * 2);

    return `${start}${masked}${end}`;
  }

  
  private hashValue(value: string): string {
    
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; 
    }
    return `hash_${Math.abs(hash).toString(16).substring(0, 8)}`;
  }

  
  maskObject<T extends Record<string, unknown>>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.maskObject(item)) as unknown as T;
    }

    const masked: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      
      const shouldMask = this.config.maskFields.some(field => 
        lowerKey.includes(field.toLowerCase())
      );

      if (shouldMask) {
        
        if (this.config.customMaskers[key]) {
          masked[key] = this.config.customMaskers[key](value);
        } else {
          masked[key] = this.maskValue(value);
        }
      } else if (typeof value === 'object' && value !== null) {
        
        masked[key] = this.maskObject(value as Record<string, unknown>);
      } else {
        masked[key] = value;
      }
    }

    return masked as T;
  }

  
  maskUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      
      const maskedParams = new URLSearchParams();
      urlObj.searchParams.forEach((value, key) => {
        if (this.shouldMaskField(key)) {
          maskedParams.append(key, this.maskValue(value));
        } else {
          maskedParams.append(key, value);
        }
      });

      
      if (urlObj.password) {
        urlObj.password = this.maskValue(urlObj.password);
      }

      urlObj.search = maskedParams.toString();
      return urlObj.toString();
    } catch {
      
      return this.maskValue(url);
    }
  }

  
  sanitizeError(error: Error | unknown): Error {
    if (!(error instanceof Error)) {
      return new Error(String(error));
    }

    const sanitized = new Error(this.sanitizeString(error.message));
    sanitized.name = error.name;
    sanitized.stack = error.stack ? this.sanitizeStackTrace(error.stack) : undefined;

    
    Object.keys(error).forEach(key => {
      if (key !== 'message' && key !== 'name' && key !== 'stack') {
        const value = (error as Record<string, unknown>)[key];
        (sanitized as Record<string, unknown>)[key] = typeof value === 'string' 
          ? this.sanitizeString(value) 
          : value;
      }
    });

    return sanitized;
  }

  
  sanitizeString(str: string): string {
    
    str = str.replace(/0x[a-fA-F0-9]{64}/g, (match) => this.maskValue(match));
    
    
    str = str.replace(/(api[_-]?key|apikey)[=:]\s*([^\s&"']+)/gi, (match, key, value) => 
      `${key}=${this.maskValue(value)}`
    );
    
    
    str = str.replace(/(token|auth|bearer)[=:]\s*([^\s&"']+)/gi, (match, key, value) => 
      `${key}=${this.maskValue(value)}`
    );
    
    
    str = str.replace(/[\w.-]+@[\w.-]+\.\w+/g, (match) => this.maskValue(match));
    
    
    str = str.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, (match) => this.maskValue(match));

    return str;
  }

  
  private sanitizeStackTrace(stack: string): string {
    return stack.split('\n').map(line => {
      
      line = line.replace(/\/[^\s]+/g, (match) => {
        if (match.includes('node_modules')) {
          return match;
        }
        return this.maskValue(match);
      });
      
      return this.sanitizeString(line);
    }).join('\n');
  }

  
  private shouldMaskField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    return this.config.maskFields.some(field => 
      lowerField.includes(field.toLowerCase())
    );
  }

  
  updateConfig(config: Partial<MaskingConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      maskFields: config.maskFields || this.config.maskFields,
      customMaskers: config.customMaskers 
        ? { ...this.config.customMaskers, ...config.customMaskers }
        : this.config.customMaskers,
    };
  }

  
  getConfig(): Readonly<MaskingConfig> {
    return { ...this.config };
  }
}


export const defaultDataMasker = new DataMasker();


export const masker = {
  
  value: (value: unknown): string => defaultDataMasker.maskValue(value),

  
  object: <T extends Record<string, unknown>>(obj: T): T => 
    defaultDataMasker.maskObject(obj),

  
  url: (url: string): string => defaultDataMasker.maskUrl(url),

  
  error: (error: Error | unknown): Error => 
    defaultDataMasker.sanitizeError(error),

  
  string: (str: string): string => defaultDataMasker.sanitizeString(str),
};

