"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateJoinCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { AnnouncementCategory, StudentType } from "@prisma/client";

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

export interface HackathonRegisterParams {
  slug: string;
  registrationType: "SOLO" | "CREATE_TEAM" | "JOIN_TEAM";
  teamName?: string;
  joinCode?: string;
  trackPreference?: string;
  needsAccommodation?: boolean;
}

export async function registerForHackathon(params: HackathonRegisterParams) {
  const session = await auth();
  const user = await getSessionUser(session);
  if (!user) {
    return { error: "You must be signed in to register for a hackathon." };
  }

  const userId = user.id;

  try {
    const hackathon = await db.hackathon.findUnique({
      where: { slug: params.slug },
      include: {
        registrations: { where: { userId } },
      },
    });

    if (!hackathon) {
      return { error: "Hackathon not found." };
    }

    // Check audience restriction
    if (hackathon.audience === "INTERNAL_ONLY" && user.studentType === StudentType.EXTERNAL) {
      return {
        error:
          "This hackathon is an internal departmental competition reserved exclusively for students of Pravara Rural Engineering College (PREC), Loni.",
      };
    }

    if (hackathon.registrations.length > 0) {
      return { error: "You are already registered for this hackathon." };
    }

    let teamId: string | null = null;

    if (params.registrationType === "CREATE_TEAM") {
      if (!params.teamName?.trim()) {
        return { error: "Team name is required." };
      }

      let code = generateJoinCode();
      let codeExists = await db.team.findUnique({ where: { joinCode: code } });
      while (codeExists) {
        code = generateJoinCode();
        codeExists = await db.team.findUnique({ where: { joinCode: code } });
      }

      const team = await db.team.create({
        data: {
          hackathonId: hackathon.id,
          name: params.teamName.trim(),
          joinCode: code,
          leaderId: userId,
          trackPreference: params.trackPreference,
          members: {
            create: {
              userId,
              role: "LEADER",
            },
          },
        },
      });

      teamId = team.id;
    } else if (params.registrationType === "JOIN_TEAM") {
      if (!params.joinCode?.trim()) {
        return { error: "Join code is required to join an existing team." };
      }

      const code = params.joinCode.trim().toUpperCase();
      const existingTeam = await db.team.findUnique({
        where: { joinCode: code },
        include: {
          members: true,
        },
      });

      if (!existingTeam || existingTeam.hackathonId !== hackathon.id) {
        return { error: "Invalid join code for this hackathon." };
      }

      if (existingTeam.members.length >= hackathon.maxTeamSize) {
        return {
          error: `This team has already reached the maximum capacity of ${hackathon.maxTeamSize} members.`,
        };
      }

      await db.teamMember.create({
        data: {
          teamId: existingTeam.id,
          userId,
          role: "MEMBER",
        },
      });

      teamId = existingTeam.id;
    }

    // Create registration record
    await db.registration.create({
      data: {
        hackathonId: hackathon.id,
        userId,
        teamId,
        status: "ACCEPTED",
        studentType: user.studentType || StudentType.INTERNAL,
        collegeName: user.collegeName || "Pravara Rural Engineering College, Loni",
        needsAccommodation: Boolean(params.needsAccommodation),
      },
    });

    revalidatePath(`/hackathons/${params.slug}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Hackathon registration error:", err);
    return { error: err.message || "Failed to complete registration." };
  }
}

export async function submitProject(data: {
  hackathonId: string;
  teamId: string;
  title: string;
  tagline: string;
  description: string;
  demoUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  deckUrl?: string;
  track?: string;
}) {
  const session = await auth();
  const user = await getSessionUser(session);
  if (!user) {
    return { error: "Unauthorized." };
  }

  try {
    const existing = await db.submission.findUnique({
      where: { teamId: data.teamId },
    });

    if (existing) {
      await db.submission.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          tagline: data.tagline,
          description: data.description,
          demoUrl: data.demoUrl,
          repoUrl: data.repoUrl,
          videoUrl: data.videoUrl,
          deckUrl: data.deckUrl,
          track: data.track,
          updatedAt: new Date(),
        },
      });
    } else {
      await db.submission.create({
        data: {
          hackathonId: data.hackathonId,
          teamId: data.teamId,
          title: data.title,
          tagline: data.tagline,
          description: data.description,
          demoUrl: data.demoUrl,
          repoUrl: data.repoUrl,
          videoUrl: data.videoUrl,
          deckUrl: data.deckUrl,
          track: data.track,
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Submit project error:", err);
    return { error: err.message || "Failed to submit project." };
  }
}

export async function postAnnouncement(
  hackathonId: string,
  title: string,
  content: string,
  category: AnnouncementCategory = AnnouncementCategory.GENERAL,
  isPinned = false
) {
  const session = await auth();
  const user = await getSessionUser(session);
  if (!user) {
    return { error: "Unauthorized." };
  }

  try {
    await db.announcement.create({
      data: {
        hackathonId,
        title,
        content,
        category,
        isPinned,
      },
    });

    revalidatePath(`/hackathons`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to post announcement." };
  }
}
