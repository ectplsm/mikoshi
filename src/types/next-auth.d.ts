import "next-auth";

declare module "next-auth" {
  interface User {
    username?: string;
  }

  interface Session {
    user: User & {
      id: string;
      username: string;
    };
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    username?: string;
  }
}
