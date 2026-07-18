import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LeadsService } from '../leads/leads.service';
import { SettingsService } from '../settings/settings.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(
    private readonly leadsService: LeadsService,
    private readonly settingsService: SettingsService,
    private readonly configService: ConfigService,
  ) { }

  @Cron('0 8 * * 1') // Every Monday at 8:00 AM
  async handleWeeklyDigest() {
    this.logger.log('Running weekly digest cron job...');
    await this.sendWeeklyDigest();
  }

  async sendWeeklyDigest() {
    this.logger.log('Generating weekly digest email...');

    const settings = await this.settingsService.getDecryptedSettings();
    if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPass) {
      this.logger.warn('SMTP credentials are not fully configured. Skipping weekly digest.');
      return { status: 'skipped', reason: 'No SMTP credentials' };
    }

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not set. Skipping weekly digest.');
      return { status: 'skipped', reason: 'No ADMIN_EMAIL' };
    }

    const stats = await this.leadsService.getStats();

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px;">OutreachPilot Weekly Digest</h2>
        
        <p>Here is your outreach summary for the week:</p>
        
        <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 16px; color: #666; text-transform: uppercase;">Weekly Volume</h3>
          <p style="font-size: 32px; font-weight: bold; margin: 5px 0; color: #000;">
            ${stats.weeklyVolume} <span style="font-size: 16px; color: #888; font-weight: normal;">/ ${stats.weeklyTarget}</span>
          </p>
          <div style="width: 100%; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
            <div style="width: ${stats.targetProgress}%; height: 100%; background: #2563eb;"></div>
          </div>
        </div>

        <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 16px; color: #666; text-transform: uppercase;">Response Rate</h3>
          <p style="font-size: 32px; font-weight: bold; margin: 5px 0; color: #000;">
            ${stats.responseRate}%
          </p>
        </div>

        <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 16px; color: #666; text-transform: uppercase;">Top Sources</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${stats.leadsBySource.length > 0
        ? stats.leadsBySource.slice(0, 5).map((item: any) =>
          `<li style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                    <span style="text-transform: capitalize;">${item.source.replace('_', ' ')}</span>
                    <strong>${item.count}</strong>
                  </li>`
        ).join('')
        : '<li style="color: #888;">No leads yet.</li>'
      }
          </ul>
        </div>

        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
          Sent by OutreachPilot<br/>
          Your automated reverse-outreach machine.
        </p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"OutreachPilot" <${settings.smtpUser}>`,
        to: adminEmail,
        subject: 'Weekly Outreach Summary 📈',
        html: htmlBody,
      });

      this.logger.log('Weekly digest email sent successfully!');
      return { status: 'success' };
    } catch (err) {
      this.logger.error(`Failed to send weekly digest: ${err.message}`);
      throw err;
    }
  }
}
