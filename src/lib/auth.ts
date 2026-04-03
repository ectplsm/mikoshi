import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      (session.user as Record<string, unknown>).username =
        (user as Record<string, unknown>).username ?? "";
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Generate a unique username from email or name
      const base = (user.email?.split("@")[0] ?? user.name ?? "user")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 20);

      let username = base;
      let suffix = 0;

      while (await db.user.findUnique({ where: { username } })) {
        suffix++;
        username = `${base}${suffix}`;
      }

      await db.user.update({
        where: { id: user.id },
        data: { username },
      });
    },
  },
  pages: {
    signIn: "/",
  },
});
