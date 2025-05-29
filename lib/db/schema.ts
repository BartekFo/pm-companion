import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  vector,
  index,
} from 'drizzle-orm/pg-core';

export const user = pgTable(
  'User',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    email: varchar('email', { length: 64 }).notNull(),
    password: varchar('password', { length: 64 }),
    role: varchar('role', { enum: ['member', 'pm'] })
      .notNull()
      .default('member'),
  },
  (table) => [
    index('user_role_idx').on(table.role),
    index('user_email_idx').on(table.email),
  ],
);

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  projectId: uuid('projectId').references(() => project.id),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => [primaryKey({ columns: [table.chatId, table.messageId] })],
);

export type Vote = InferSelectModel<typeof vote>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id] }),
    foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  ],
);

export type Stream = InferSelectModel<typeof stream>;

export const project = pgTable(
  'Project',
  {
    id: uuid('id').notNull().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('createdAt').notNull(),
    userId: uuid('userId').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id] }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
    }),
  ],
);

export type Project = InferSelectModel<typeof project>;

export const projectMember = pgTable(
  'ProjectMember',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    projectId: uuid('projectId')
      .notNull()
      .references(() => project.id),
    email: varchar('email', { length: 64 }).notNull(),
    userId: uuid('userId').references(() => user.id), // Null jeśli user nie ma jeszcze konta
    role: varchar('role').notNull().default('member'),
    status: varchar('status', { enum: ['pending', 'accepted', 'declined'] })
      .notNull()
      .default('pending'),
    invitedAt: timestamp('invitedAt').notNull(),
    joinedAt: timestamp('joinedAt'), // Kiedy user zaakceptował
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => [
    index('project_member_user_idx').on(table.userId),
    index('project_member_project_idx').on(table.projectId),
    index('project_member_status_idx').on(table.status),
    index('project_member_user_status_idx').on(table.userId, table.status),
  ],
);

export type ProjectMember = InferSelectModel<typeof projectMember>;

export const projectFile = pgTable('ProjectFile', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  fileName: text('fileName').notNull(),
  contentType: varchar('contentType', { length: 100 }).notNull(),
  url: text('url').notNull(),
  projectId: uuid('projectId')
    .notNull()
    .references(() => project.id),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('createdAt').notNull(),
});

export type ProjectFile = InferSelectModel<typeof projectFile>;

export const projectFileEmbedding = pgTable(
  'ProjectFileEmbedding',
  {
    id: uuid('id').notNull().defaultRandom(),
    fileId: uuid('fileId').notNull(),
    chunkContent: text('chunkContent').notNull(),
    embedding: vector('embedding', { dimensions: 768 }).notNull(),
    chunkIndex: varchar('chunkIndex', { length: 50 }),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id] }),
    foreignKey({
      columns: [table.fileId],
      foreignColumns: [projectFile.id],
    }),
  ],
);

export type ProjectFileEmbedding = InferSelectModel<
  typeof projectFileEmbedding
>;
