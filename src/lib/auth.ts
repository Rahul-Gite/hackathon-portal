import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole, StudentType } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentType: user.studentType,
          collegeName: user.collegeName,
          department: user.department,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.role = (user.role as UserRole) || UserRole.STUDENT;
        token.studentType = (user.studentType as StudentType) || StudentType.INTERNAL;
        token.collegeName = user.collegeName || "Pravara Rural Engineering College, Loni";
        token.department = user.department;
      } else if (token.email) {
        // Self-heal stale token.id across database resets or seed operations
        try {
          const dbUser = await db.user.findUnique({
            where: { email: String(token.email).toLowerCase().trim() },
            select: { id: true, role: true, studentType: true, collegeName: true, department: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.studentType = dbUser.studentType;
            token.collegeName = dbUser.collegeName;
            token.department = dbUser.department;
          }
        } catch (e) {
          console.warn("Error refreshing JWT user token:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.studentType = token.studentType as StudentType;
        session.user.collegeName = token.collegeName as string;
        session.user.department = token.department as string | null | undefined;
      }
      return session;
    },
  },
});
