export const ROUTES = {
  PROJECT: {
    ROOT: '/',
    CREATE_NEW_PROJECT: '/create-new-project',
    EDIT_PROJECT: (id: string) => `${id}/edit-project`,
    CHAT: (id: string) => `/${id}/chat`,
    CHAT_WITH_ID: (projectId: string, chatId: string) =>
      `/${projectId}/chat/${chatId}`,
  },
  CHAT: {
    ROOT: '/chat',
    WITH_ID: (id: string) => `/chat/${id}`,
  },
} as const;
