import { UserRole, StudentType } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      studentType: StudentType;
      collegeName: string;
      collegeRollNo?: string | null;
      department?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    studentType?: StudentType;
    collegeName?: string;
    collegeRollNo?: string | null;
    department?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    studentType: StudentType;
    collegeName: string;
    department?: string | null;
  }
}
