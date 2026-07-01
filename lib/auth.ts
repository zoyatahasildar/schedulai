// lib/auth.ts
// Owned by: Lead (Auth module)
// NextAuth configuration — Google OAuth + Prisma adapter

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import ZoomProvider from "next-auth/providers/zoom";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    ZoomProvider({
      clientId: process.env.ZOOM_CLIENT_ID!,
      clientSecret: process.env.ZOOM_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "meeting:write meeting:read",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch username from DB
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { username: true, id: true },
        });
        token.username = dbUser?.username ?? null;
        token.id = dbUser?.id ?? user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
