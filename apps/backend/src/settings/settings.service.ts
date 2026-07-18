import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

export class UpdateSettingsDto {
  llmProvider?: string;
  llmApiKey?: string;
  llmModel?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  weeklyTarget?: number;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly encryptionKey: Buffer;

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<any>,
    private configService: ConfigService,
  ) {
    const keyString = this.configService.get<string>('ENCRYPTION_KEY') || 'default_secret_key_needs_32_bytes_for_aes_256!';
    // Ensure key is 32 bytes for AES-256
    this.encryptionKey = crypto.scryptSync(keyString, 'salt', 32);
  }

  // Encrypt string using AES-256-GCM
  private encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  // Decrypt string using AES-256-GCM
  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) return encryptedText; // If it's not encrypted format, return as is (legacy support)
      
      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      this.logger.error('Failed to decrypt value', err);
      return '';
    }
  }

  private async getAdminUser() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) throw new Error('ADMIN_EMAIL not set');

    let adminUsers = await this.db.select().from(users).where(eq(users.email, adminEmail));
    let adminUser = adminUsers[0];

    if (!adminUser) {
      const [newUser] = await this.db.insert(users).values({
        email: adminEmail,
        name: 'Admin User',
      }).returning();
      adminUser = newUser;
    }
    return adminUser;
  }

  async getSettings() {
    const user = await this.getAdminUser();
    return {
      llmProvider: user.llmProvider || 'mock',
      llmModel: user.llmModel || '',
      hasApiKey: !!user.llmApiKey, // We don't send the API key back to the frontend for security!
      smtpHost: user.smtpHost || '',
      smtpPort: user.smtpPort || null,
      smtpUser: user.smtpUser || '',
      hasSmtpPass: !!user.smtpPass,
      weeklyTarget: user.weeklyTarget,
    };
  }

  async getDecryptedSettings() {
    const user = await this.getAdminUser();
    return {
      llmProvider: user.llmProvider || 'mock',
      llmModel: user.llmModel || '',
      llmApiKey: user.llmApiKey ? this.decrypt(user.llmApiKey) : '',
      smtpHost: user.smtpHost || '',
      smtpPort: user.smtpPort || null,
      smtpUser: user.smtpUser || '',
      smtpPass: user.smtpPass ? this.decrypt(user.smtpPass) : '',
      weeklyTarget: user.weeklyTarget,
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const user = await this.getAdminUser();
    
    const updateData: any = {};
    if (dto.llmProvider !== undefined) updateData.llmProvider = dto.llmProvider;
    if (dto.llmModel !== undefined) updateData.llmModel = dto.llmModel;
    if (dto.smtpHost !== undefined) updateData.smtpHost = dto.smtpHost;
    if (dto.smtpPort !== undefined) updateData.smtpPort = dto.smtpPort;
    if (dto.smtpUser !== undefined) updateData.smtpUser = dto.smtpUser;
    if (dto.weeklyTarget !== undefined) updateData.weeklyTarget = dto.weeklyTarget;
    
    // Only update the API key if it's explicitly provided.
    // If the frontend sends an empty string, it means they are clearing it.
    if (dto.llmApiKey !== undefined) {
      if (dto.llmApiKey === '') {
        updateData.llmApiKey = null;
      } else {
        updateData.llmApiKey = this.encrypt(dto.llmApiKey);
      }
    }
    
    if (dto.smtpPass !== undefined) {
      if (dto.smtpPass === '') {
        updateData.smtpPass = null;
      } else {
        updateData.smtpPass = this.encrypt(dto.smtpPass);
      }
    }

    await this.db.update(users)
      .set(updateData)
      .where(eq(users.id, user.id));

    return this.getSettings();
  }
}
