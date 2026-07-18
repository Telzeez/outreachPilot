import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { outreachMessages, leads, contacts } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../settings/settings.service';

@Processor('sending')
export class SendingProcessor extends WorkerHost {
  private readonly logger = new Logger(SendingProcessor.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<any>,
    private readonly settingsService: SettingsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { messageId } = job.data;
    this.logger.log(`Processing sending job for message: ${messageId}`);

    // 1. Fetch message and verify it's APPROVED
    const msgs = await this.db.select({
      id: outreachMessages.id,
      draft: outreachMessages.draft,
      status: outreachMessages.status,
      leadId: outreachMessages.leadId,
      contactEmail: contacts.email,
    })
    .from(outreachMessages)
    .innerJoin(leads, eq(outreachMessages.leadId, leads.id))
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .where(eq(outreachMessages.id, messageId));

    if (!msgs.length) {
      throw new Error(`Message ${messageId} not found`);
    }

    const msg = msgs[0];

    // THE APPROVAL GATE
    if (msg.status !== 'APPROVED') {
      this.logger.warn(`Message ${messageId} is not APPROVED (status: ${msg.status}). Aborting send.`);
      return;
    }

    // 2. Fetch User's SMTP settings
    const settings = await this.settingsService.getDecryptedSettings();

    if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPass) {
      throw new Error('SMTP credentials are not fully configured');
    }

    // 3. Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    // 4. Construct Email HTML
    const formattedDraft = msg.draft.replace(/\n/g, '<br/>');
    const trackingPixelUrl = `http://localhost:3001/outreach/track/open/${msg.id}`;
    
    const htmlBody = `
      <div style="font-family: sans-serif; font-size: 14px; color: #333;">
        ${formattedDraft}
      </div>
      <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />
    `;

    // 5. Send Email
    try {
      await transporter.sendMail({
        from: settings.smtpUser,
        to: msg.contactEmail,
        subject: 'Quick question',
        html: htmlBody,
      });

      this.logger.log(`Email sent successfully for message ${messageId}`);

      // 6. Update Database
      await this.db.update(outreachMessages)
        .set({ status: 'SENT', sentAt: new Date() })
        .where(eq(outreachMessages.id, messageId));

      await this.db.update(leads)
        .set({ stage: 'CONTACTED' })
        .where(eq(leads.id, msg.leadId));

    } catch (err) {
      this.logger.error(`Failed to send email for message ${messageId}: ${err.message}`);
      throw err;
    }
  }
}
