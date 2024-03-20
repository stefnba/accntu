declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    email: string;
    lastName?: string;
    firstName?: string;
    image?: string;
}

export type TValiDateRequest =
    | { user: User; session: Session }
    | {
          user: null;
          session: null;
      };
