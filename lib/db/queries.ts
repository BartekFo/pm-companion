import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
  stream,
  project,
  projectFile,
  projectMember,
  type ProjectFile,
  projectFileEmbedding,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { generateHashedPassword } from './utils';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db
      .insert(user)
      .values({ email, password: hashedPassword })
      .returning();
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    console.error(
      'Failed to get message count by user id for the last 24 hours from database',
    );
    throw error;
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    console.error('Failed to create stream id in database');
    throw error;
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    console.error('Failed to get stream ids by chat id from database');
    throw error;
  }
}

export async function createProject(data: {
  name: string;
  userId: string;
}) {
  try {
    const [newProject] = await db
      .insert(project)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();

    return newProject;
  } catch (error) {
    console.error('Failed to create project in database');
    throw error;
  }
}

export async function createProjectFile(data: {
  fileName: string;
  contentType: string;
  url: string;
  content: string;
  projectId: string;
  userId: string;
}) {
  try {
    const [file] = await db
      .insert(projectFile)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();

    return file;
  } catch (error) {
    console.error('Failed to create project file in database');
    throw error;
  }
}

export async function createProjectFileEmbedding(data: {
  fileId: string;
  embedding: number[];
  chunkIndex?: string;
}) {
  try {
    const [embedding] = await db
      .insert(projectFileEmbedding)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();

    return embedding;
  } catch (error) {
    console.error('Failed to create project file embedding in database');
    throw error;
  }
}

export async function getProjectFiles(
  projectId: string,
): Promise<ProjectFile[]> {
  try {
    return await db
      .select()
      .from(projectFile)
      .where(eq(projectFile.projectId, projectId))
      .orderBy(desc(projectFile.createdAt));
  } catch (error) {
    console.error('Failed to get project files from database');
    throw error;
  }
}

export async function createProjectMembers(data: {
  projectId: string;
  emails: string[];
}) {
  try {
    const members = data.emails.map((email) => ({
      projectId: data.projectId,
      email,
      role: 'member' as const,
      status: 'pending' as const,
      invitedAt: new Date(),
      createdAt: new Date(),
    }));

    return await db.insert(projectMember).values(members).returning();
  } catch (error) {
    console.error('Failed to create project members in database');
    throw error;
  }
}

export async function linkUserToProjects(userId: string, email: string) {
  try {
    return await db
      .update(projectMember)
      .set({
        userId,
        status: 'accepted',
        joinedAt: new Date(),
      })
      .where(
        and(
          eq(projectMember.email, email),
          eq(projectMember.status, 'pending'),
        ),
      )
      .returning();
  } catch (error) {
    console.error('Failed to link user to projects');
    throw error;
  }
}

export async function getUserProjects(userId: string) {
  try {
    const ownedProjects = await db
      .select({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        role: sql<string>`'owner'`,
      })
      .from(project)
      .where(eq(project.userId, userId));

    const memberProjects = await db
      .select({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        role: projectMember.role,
      })
      .from(project)
      .innerJoin(projectMember, eq(projectMember.projectId, project.id))
      .where(
        and(
          eq(projectMember.userId, userId),
          eq(projectMember.status, 'accepted'),
        ),
      );

    return [...ownedProjects, ...memberProjects];
  } catch (error) {
    console.error('Failed to get user projects');
    throw error;
  }
}

export async function getProjectFileEmbeddings(fileId: string) {
  try {
    return await db
      .select()
      .from(projectFileEmbedding)
      .where(eq(projectFileEmbedding.fileId, fileId))
      .orderBy(asc(projectFileEmbedding.chunkIndex));
  } catch (error) {
    console.error('Failed to get project file embeddings from database');
    throw error;
  }
}

export async function getProjectById(projectId: string) {
  try {
    const [projectData] = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    return projectData;
  } catch (error) {
    console.error('Failed to get project by id from database');
    throw error;
  }
}

export async function getProjectMembers(projectId: string) {
  try {
    return await db
      .select()
      .from(projectMember)
      .where(eq(projectMember.projectId, projectId))
      .orderBy(asc(projectMember.createdAt));
  } catch (error) {
    console.error('Failed to get project members from database');
    throw error;
  }
}

export async function updateProject(projectId: string, data: { name: string }) {
  try {
    const [updatedProject] = await db
      .update(project)
      .set(data)
      .where(eq(project.id, projectId))
      .returning();

    return updatedProject;
  } catch (error) {
    console.error('Failed to update project in database');
    throw error;
  }
}

export async function deleteProjectFile(fileId: string) {
  try {
    await db
      .delete(projectFileEmbedding)
      .where(eq(projectFileEmbedding.fileId, fileId));

    const [deletedFile] = await db
      .delete(projectFile)
      .where(eq(projectFile.id, fileId))
      .returning();

    return deletedFile;
  } catch (error) {
    console.error('Failed to delete project file from database');
    throw error;
  }
}

export async function deleteProjectMember(memberId: string) {
  try {
    const [deletedMember] = await db
      .delete(projectMember)
      .where(eq(projectMember.id, memberId))
      .returning();

    return deletedMember;
  } catch (error) {
    console.error('Failed to delete project member from database');
    throw error;
  }
}
