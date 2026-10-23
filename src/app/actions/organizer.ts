"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { HackathonStatus, LocationType, RegistrationStatus, HackathonAudience } from "@prisma/client";

async function getSessionUser(session: any) {
  if (!session?.user) return null;
  const id = session.user.id;
  const email = session.user.email ? String(session.user.email).toLowerCase().trim() : null;

  if (id) {
    const userById = await db.user.findUnique({ where: { id } });
    if (userById) return userById;
  }

  if (email) {
    const userByEmail = await db.user.findUnique({ where: { email } });
    if (userByEmail) return userByEmail;
  }

  return null;
}

export interface CreateHackathonParams {
  committeeId: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  bannerUrl?: string;
  logoUrl?: string;
  department: string;
  audience: HackathonAudience;
  themeColor: string;
  heroLayout: string;
  locationType: LocationType;
  venue?: string;
  allowSolo: boolean;
  allowInterCollegeTeams: boolean;
  requireCollegeId: boolean;
  requireGithub: boolean;
  discordUrl?: string;
  wifiDetails?: string;
  registrationStart: string;
  registrationEnd: string;
  hackingStart: string;
  hackingEnd: string;
  minTeamSize: number;
  maxTeamSize: number;
  tracks: Array<{ id: string; name: string; description: string; sponsor?: string; prize?: string; mentor?: string }>;
  prizes: Array<{ title: string; amount: string; perks?: string; rank?: number }>;
  scheduleMilestones: Array<{ day: string; time: string; title: string; description: string; phase?: string }>;
  customQuestions?: Array<{ id: string; label: string; type: string; required: boolean; options?: string[] }>;
  rules?: string;
  faqs?: Array<{ q: string; a: string }>;
}

export async function createHackathon(data: CreateHackathonParams) {
  const session = await auth();
  const currentUser = await getSessionUser(session);
  if (!currentUser) {
    return { error: "Unauthorized. Please sign in." };
  }

  const userId = currentUser.id;

  try {
    // Check caller is a manager in the specified committee
    const membership = await db.committeeMember.findUnique({
      where: {
        committeeId_userId: {
          committeeId: data.committeeId,
          userId,
        },
      },
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "CO_MANAGER")) {
      return { error: "You must be an Owner or Co-Manager of this committee to host a hackathon." };
    }

    const existing = await db.hackathon.findUnique({
      where: { slug: data.slug.toLowerCase().trim() },
    });

    if (existing) {
      return { error: "A hackathon with this slug or URL already exists. Please choose another." };
    }

    const hackathon = await db.hackathon.create({
      data: {
        committeeId: data.committeeId,
        title: data.title.trim(),
        slug: data.slug.toLowerCase().trim(),
        tagline: data.tagline.trim(),
        description: data.description.trim(),
        bannerUrl:
          data.bannerUrl ||
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
        logoUrl: data.logoUrl,
        department: data.department || "Computer Engineering",
        audience: data.audience || HackathonAudience.ALL_COLLEGES,
        themeColor: data.themeColor || "sapphire",
        heroLayout: data.heroLayout || "standard",
        locationType: data.locationType || LocationType.IN_PERSON,
        venue: data.venue || "Central Computing Facility, PREC Campus, Loni",
        allowSolo: data.allowSolo,
        allowInterCollegeTeams: data.allowInterCollegeTeams,
        requireCollegeId: data.requireCollegeId,
        requireGithub: data.requireGithub,
        discordUrl: data.discordUrl,
        wifiDetails: data.wifiDetails,
        registrationStart: new Date(data.registrationStart),
        registrationEnd: new Date(data.registrationEnd),
        hackingStart: new Date(data.hackingStart),
        hackingEnd: new Date(data.hackingEnd),
        minTeamSize: Number(data.minTeamSize) || 1,
        maxTeamSize: Number(data.maxTeamSize) || 4,
        status: HackathonStatus.REGISTRATION_OPEN,
        tracks: data.tracks || [],
        prizes: data.prizes || [],
        scheduleMilestones: data.scheduleMilestones || [],
        customQuestions: data.customQuestions || [],
        rules: data.rules,
        faqs: data.faqs || [],
      },
    });

    revalidatePath("/organizer/dashboard");
    revalidatePath("/");

    return { success: true, slug: hackathon.slug };
  } catch (err: any) {
    console.error("Create hackathon error:", err);
    return { error: err.message || "Failed to create hackathon." };
  }
}

export async function updateHackathonStatus(hackathonId: string, status: HackathonStatus) {
  const session = await auth();
  const currentUser = await getSessionUser(session);
  if (!currentUser) return { error: "Unauthorized" };

  try {
    await db.hackathon.update({
      where: { id: hackathonId },
      data: { status },
    });

    revalidatePath("/organizer/dashboard");
    revalidatePath(`/organizer/hackathons/${hackathonId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function toggleCheckIn(registrationId: string) {
  const session = await auth();
  const currentUser = await getSessionUser(session);
  if (!currentUser) return { error: "Unauthorized" };

  try {
    const reg = await db.registration.findUnique({
      where: { id: registrationId },
    });

    if (!reg) return { error: "Registration not found" };

    const newStatus =
      reg.status === RegistrationStatus.CHECKED_IN
        ? RegistrationStatus.ACCEPTED
        : RegistrationStatus.CHECKED_IN;

    await db.registration.update({
      where: { id: registrationId },
      data: { status: newStatus },
    });

    revalidatePath(`/organizer/hackathons/${reg.hackathonId}`);
    return { success: true, newStatus };
  } catch (err: any) {
    return { error: err.message };
  }
}
