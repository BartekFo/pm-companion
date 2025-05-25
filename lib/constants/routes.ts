export const ROUTES = {
  PROJECT: {
    ROOT: '/',
    CREATE_NEW_PROJECT: '/create-new-project',
    EDIT_PROJECT: (id: string) => `${id}/edit-project`,
  },
} as const;
