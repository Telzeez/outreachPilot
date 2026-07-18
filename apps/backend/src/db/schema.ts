import { pgTable, text, timestamp, pgEnum, primaryKey, integer, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const stageEnum = pgEnum('stage', ['NEW', 'CONTACTED', 'REPLIED', 'CALL_BOOKED', 'WON', 'LOST']);
export const msgStatusEnum = pgEnum('msg_status', ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SENT']);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  password: text('password'),
  image: text('image'),
  emailProvider: text('email_provider'),
  llmProvider: text('llm_provider'),
  llmApiKey: text('llm_api_key'),
  llmModel: text('llm_model'),
  smtpHost: text('smtp_host'),
  smtpPort: integer('smtp_port'),
  smtpUser: text('smtp_user'),
  smtpPass: text('smtp_pass'),
  weeklyTarget: integer('weekly_target').default(100).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const companies = pgTable('companies', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
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

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);
