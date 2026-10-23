"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole, StudentType } from "@prisma/client";

export interface RegisterResult {
  success?: boolean;
  error?: string;
}

export interface CollegeSuggestion {
  name: string;
  count: number;
  isRegistered: boolean;
}

/**
 * Fetch auto-suggestions for outside college names based on previously
 * registered students in the database, with curated university defaults.
 */
export async function getRegisteredCollegeSuggestions(query?: string): Promise<CollegeSuggestion[]> {
  try {
    // 1. Fetch college names from registered outside students
    const registeredUsers = await db.user.findMany({
      where: {
        studentType: StudentType.EXTERNAL,
        collegeName: {
          not: "",
        },
      },
      select: {
        collegeName: true,
      },
    });

    const frequencyMap = new Map<string, number>();
    for (const u of registeredUsers) {
      const trimmed = u.collegeName?.trim();
      if (
        trimmed &&
        !trimmed.toLowerCase().includes("pravara rural engineering college")
      ) {
        frequencyMap.set(trimmed, (frequencyMap.get(trimmed) || 0) + 1);
      }
    }

    // 2. Curated standard engineering colleges & universities
    const standardColleges = [
      "COEP Technological University, Pune",
      "Pune Institute of Computer Technology (PICT), Pune",
      "Vishwakarma Institute of Technology (VIIT), Pune",
      "Pimpri Chinchwad College of Engineering (PCCOE), Pune",
      "MIT World Peace University (MIT-WPU), Pune",
      "Veermata Jijabai Technological Institute (VJTI), Mumbai",
      "Sardar Patel Institute of Technology (SPIT), Mumbai",
      "Walchand College of Engineering, Sangli",
      "Government College of Engineering, Chhatrapati Sambhajinagar",
      "Amrutvahini College of Engineering, Sangamner",
      "Sanjivani College of Engineering, Kopargaon",
      "K. K. Wagh Institute of Engineering, Nashik",
      "Sinhgad College of Engineering (SCOE), Pune",
      "Cummins College of Engineering for Women, Pune",
      "Savitribai Phule Pune University (SPPU)",
      "Dr. Babasaheb Ambedkar Technological University (BATU), Lonere",
    ];

    const results: CollegeSuggestion[] = [];
    const seen = new Set<string>();

    // First add all previously registered colleges with their count
    frequencyMap.forEach((count, name) => {
      results.push({ name, count, isRegistered: true });
      seen.add(name.toLowerCase());
    });

    // Then add standard colleges if not already in registered list
    for (const name of standardColleges) {
      if (!seen.has(name.toLowerCase())) {
        results.push({ name, count: 0, isRegistered: false });
        seen.add(name.toLowerCase());
      }
    }

    // Filter by search query if provided
    const q = query ? query.toLowerCase().trim() : "";
    const filtered = q
      ? results.filter((item) => item.name.toLowerCase().includes(q))
      : results;

    // Sort: previously registered colleges first (highest count), then alphabetical
    filtered.sort((a, b) => {
      if (a.isRegistered && !b.isRegistered) return -1;
      if (!a.isRegistered && b.isRegistered) return 1;
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

    return filtered.slice(0, 15);
  } catch (err) {
    console.error("Error fetching college suggestions:", err);
    return [];
  }
}

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  try {
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").toLowerCase().trim();
    const password = String(formData.get("password") || "");
    
    // Validate required account fields
    if (!name || !email || !password) {
      return { error: "Please provide your name, email address, and password." };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address." };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const studentTypeString = String(formData.get("studentType") || "INTERNAL").toUpperCase();
    const studentType: StudentType =
      studentTypeString === "EXTERNAL" ? StudentType.EXTERNAL : StudentType.INTERNAL;

    let collegeName = "Pravara Rural Engineering College, Loni";
    if (studentType === StudentType.EXTERNAL) {
      collegeName = String(formData.get("collegeName") || "").trim() || "Outside University";
    }

    const department = String(formData.get("department") || "").trim() || "Computer Engineering";
    const collegeRollNo = String(formData.get("collegeRollNo") || "").trim() || null;
    const collegeCity =
      String(formData.get("collegeCity") || "").trim() ||
      (studentType === StudentType.INTERNAL ? "Loni" : "Pune");
    const collegeState = String(formData.get("collegeState") || "").trim() || "Maharashtra";
    const graduationYear = 2026;

    // Check for existing user with this email
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists. Please sign in." };
    }

    // Secure password hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with default role STUDENT
    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.STUDENT,
        studentType,
        collegeName,
        collegeRollNo,
        department,
        graduationYear,
        collegeCity,
        collegeState,
      },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Registration error:", err);
    return { error: err.message || "Failed to create account. Please try again." };
  }
}
