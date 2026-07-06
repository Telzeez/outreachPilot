import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const stageEnum = pgEnum('stage', ['NEW', 'CONTACTED', 'REPLIED', 'CALL_BOOKED', 'WON', 'LOST']);
export const msgStatusEnum = pgEnum('msg_status', ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SENT']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailProvider: text('email_provider'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const companies = pgTable('companies', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  website: text('website'),
  source: text('source').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contacts = pgTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  companyId: text('company_id').notNull().references(() => companies.id),
  name: text('name'),
  role: text('role'),
  email: text('email').notNull(),
  source: text('source').notNull(),
});

export const leads = pgTable('leads', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  companyId: text('company_id').notNull().references(() => companies.id),
  contactId: text('contact_id').references(() => contacts.id),
  userId: text('user_id').notNull().references(() => users.id),
  stage: stageEnum('stage').default('NEW').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const outreachMessages = pgTable('outreach_messages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  leadId: text('lead_id').notNull().references(() => leads.id),
  draft: text('draft').notNull(),
  status: msgStatusEnum('status').default('PENDING_REVIEW').notNull(),
  sentAt: timestamp('sent_at'),
});
