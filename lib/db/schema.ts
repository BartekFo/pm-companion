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
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

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

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => [primaryKey({ columns: [table.chatId, table.messageId] })],
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

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

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => [primaryKey({ columns: [table.id, table.createdAt] })],
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id] }),
    foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  ],
);

export type Suggestion = InferSelectModel<typeof suggestion>;

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

export const projectMember = pgTable('ProjectMember', {
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
});

export type ProjectMember = InferSelectModel<typeof projectMember>;

export const projectFile = pgTable('ProjectFile', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  fileName: text('fileName').notNull(),
  contentType: varchar('contentType', { length: 100 }).notNull(),
  url: text('url').notNull(),
  content: text('content').notNull(),
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
