export type TValiDateRequest =
    | { user: User; session: Session }
    | {
          user: null;
          session: null;
      };
