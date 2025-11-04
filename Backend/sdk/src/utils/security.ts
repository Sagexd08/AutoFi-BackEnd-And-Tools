

import crypto from 'crypto';


export interface EncryptionConfig {
  algorithm?: string;
  keyLength?: number;
  ivLength?: number;
  saltLength?: number;
  iterations?: number;
}


const DEFAULT_CONFIG: Required<EncryptionConfig> = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 32,
  iterations: 100000,
};


export class EncryptionUtil {
  private readonly config: Required<EncryptionConfig>;

  constructor(config: EncryptionConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  
  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.config.iterations,
      this.config.keyLength,
      'sha256'
    );
  }

  
  encrypt(data: string, password: string): string {
    try {
      const salt = crypto.randomBytes(this.config.saltLength);
      const key = this.deriveKey(password, salt);
      const iv = crypto.randomBytes(this.config.ivLength);
      
      const cipher = crypto.createCipheriv(this.config.algorithm, key, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      
      const result = Buffer.concat([
        salt,
        iv,
        authTag,
        Buffer.from(encrypted, 'hex'),
      ]);
      
      return result.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  
  decrypt(encryptedData: string, password: string): string {
    try {
      const data = Buffer.from(encryptedData, 'base64');
      
      const salt = data.subarray(0, this.config.saltLength);
      const iv = data.subarray(
        this.config.saltLength,
        this.config.saltLength + this.config.ivLength
      );
      const authTag = data.subarray(
        this.config.saltLength + this.config.ivLength,
        this.config.saltLength + this.config.ivLength + 16
      );
      const encrypted = data.subarray(
        this.config.saltLength + this.config.ivLength + 16
      );
      
      const key = this.deriveKey(password, salt);
      
      const decipher = crypto.createDecipheriv(this.config.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  
  generateUUID(): string {
    return crypto.randomUUID();
  }
}


export class TokenManager {
  private readonly tokens: Map<string, TokenInfo> = new Map();
  private readonly maxTokens: number;

  constructor(maxTokens: number = 1000) {
    this.maxTokens = maxTokens;
  }

  
  createToken(
    payload: Record<string, unknown>,
    expiresInMs: number = 3600000 
  ): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + expiresInMs;

    this.tokens.set(token, {
      payload,
      expiresAt,
      createdAt: Date.now(),
    });

    
    if (this.tokens.size > this.maxTokens) {
      this.cleanupExpiredTokens();
    }

    return token;
  }

  
  validateToken(token: string): Record<string, unknown> | null {
    const tokenInfo = this.tokens.get(token);
    
    if (!tokenInfo) {
      return null;
    }

    if (Date.now() > tokenInfo.expiresAt) {
      this.tokens.delete(token);
      return null;
    }

    return tokenInfo.payload;
  }

  
  revokeToken(token: string): boolean {
    return this.tokens.delete(token);
  }

  
  cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, info] of this.tokens.entries()) {
      if (now > info.expiresAt) {
        this.tokens.delete(token);
      }
    }
  }

  
  getActiveTokens(): string[] {
    this.cleanupExpiredTokens();
    return Array.from(this.tokens.keys());
  }
}


interface TokenInfo {
  payload: Record<string, unknown>;
  expiresAt: number;
  createdAt: number;
}


export class SecureStorage {
  private readonly encryption: EncryptionUtil;
  private readonly storage: Map<string, string> = new Map();

  constructor(encryptionKey: string) {
    this.encryption = new EncryptionUtil();
    
    this.encryption = new EncryptionUtil();
  }

  
  set(key: string, value: string, password: string): void {
    const encrypted = this.encryption.encrypt(value, password);
    this.storage.set(key, encrypted);
  }

  
  get(key: string, password: string): string | null {
    const encrypted = this.storage.get(key);
    if (!encrypted) {
      return null;
    }

    try {
      return this.encryption.decrypt(encrypted, password);
    } catch {
      return null;
    }
  }

  
  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  
  has(key: string): boolean {
    return this.storage.has(key);
  }

  
  clear(): void {
    this.storage.clear();
  }
}


export class GDPRCompliance {
  
  static anonymize(data: Record<string, unknown>): Record<string, unknown> {
    const anonymized = { ...data };
    
    
    const piiFields = ['email', 'phone', 'address', 'name', 'ssn', 'ip'];
    for (const field of piiFields) {
      if (anonymized[field]) {
        anonymized[field] = '***REDACTED***';
      }
    }

    return anonymized;
  }

  
  static containsPII(data: Record<string, unknown>): boolean {
    const piiFields = ['email', 'phone', 'address', 'name', 'ssn', 'ip'];
    return piiFields.some(field => data[field] !== undefined);
  }

  
  static removePII(data: Record<string, unknown>): Record<string, unknown> {
    const cleaned = { ...data };
    const piiFields = ['email', 'phone', 'address', 'name', 'ssn', 'ip'];
    piiFields.forEach(field => delete cleaned[field]);
    return cleaned;
  }
}


export const defaultEncryption = new EncryptionUtil();


export const security = {
  
  encrypt: (data: string, password: string): string => 
    defaultEncryption.encrypt(data, password),

  
  decrypt: (encryptedData: string, password: string): string => 
    defaultEncryption.decrypt(encryptedData, password),

  
  hash: (data: string): string => defaultEncryption.hash(data),

  
  generateToken: (length?: number): string => 
    defaultEncryption.generateToken(length),

  
  generateUUID: (): string => defaultEncryption.generateUUID(),
};

