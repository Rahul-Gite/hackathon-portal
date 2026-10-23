"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CommitteeRole } from "@prisma/client";

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

export async function createCommittee(data: {
  name: string;
  slug: string;
  department: string;
  description?: string;
  contactEmail: string;
  logoUrl?: string;
}) {
  const session = await auth();
  const currentUser = await getSessionUser(session);
  if (!currentUser) {
    return { error: "You must be signed in to create a committee. Please log in again." };
  }

  const userId = currentUser.id;

  try {
    const existingSlug = await db.committee.findUnique({
      where: { slug: data.slug.toLowerCase().trim() },
    });

    if (existingSlug) {
      return { error: "A committee with this URL identifier already exists." };
    }

    const committee = await db.committee.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
        department: data.department || "Computer Engineering",
        description: data.description,
        contactEmail: data.contactEmail.trim().toLowerCase(),
        logoUrl: data.logoUrl,
        members: {
          create: {
            userId,
            role: CommitteeRole.OWNER, // Creator is automatically the democratic Owner
          },
        },
      },
    });

    revalidatePath("/organizer/dashboard");
    return { success: true, committeeId: committee.id };
  } catch (err: any) {
    console.error("Create committee error:", err);
    return { error: err.message || "Failed to create committee." };
  }
}

export async function addCommitteeMember(committeeId: string, email: string, role: CommitteeRole) {
  const session = await auth();
  const currentUser = await getSessionUser(session);
  if (!currentUser) return { error: "Unauthorized. Please sign in." };

  const currentUserId = currentUser.id;

  try {
    // Verify caller is OWNER or CO_MANAGER
    const callerMember = await db.committeeMember.findUnique({
      where: {
        committeeId_userId: {
          committeeId,
          userId: currentUserId,
        },
      },
    });

    if (!callerMember || (callerMember.role !== "OWNER" && callerMember.role !== "CO_MANAGER")) {
      return { error: "Only the Committee Owner or Co-Managers can add members." };
    }

    const targetUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!targetUser) {
      return { error: "No registered user found with this email. Please ask them to sign up first." };
    }

    const existingMembership = await db.committeeMember.findUnique({
      where: {
        committeeId_userId: {
          committeeId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMembership) {
      return { error: "This user is already a member of this committee." };
    }

    // Role cannot be OWNER directly via invite
    const assignedRole = role === "OWNER" ? "CO_MANAGER" : role;

    await db.committeeMember.create({
      data: {
        committeeId,
        userId: targetUser.id,
        role: assignedRole,
      },
    });

    revalidatePath(`/organizer/committees/${committeeId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to add member." };
  }
}

export async function transferCommitteeOwnership(committeeId: string, targetUserId: string) {
  const session = await auth();
  const currentUser = await getSessionUser(session);
  if (!currentUser) return { error: "Unauthorized. Please sign in." };

  const currentUserId = currentUser.id;

  try {
    // Only current OWNER can transfer ownership
    const callerMembership = await db.committeeMember.findUnique({
      where: {
        committeeId_userId: {
          committeeId,
          userId: currentUserId,
        },
      },
    });

    if (!callerMembership || callerMembership.role !== "OWNER") {
      return { error: "Only the primary Committee Owner can transfer ownership." };
    }

    const targetMembership = await db.committeeMember.findUnique({
      where: {
        committeeId_userId: {
          committeeId,
          userId: targetUserId,
        },
      },
    });

    if (!targetMembership) {
      return { error: "Target user must already be an active committee member." };
    }

    // Execute atomic democratic leadership transfer:
    // 1. Promote target user to OWNER
    // 2. Demote current user to CO_MANAGER
    await db.$transaction([
      db.committeeMember.update({
        where: { id: targetMembership.id },
        data: { role: CommitteeRole.OWNER },
      }),
      db.committeeMember.update({
        where: { id: callerMembership.id },
        data: { role: CommitteeRole.CO_MANAGER },
      }),
    ]);

    revalidatePath(`/organizer/committees/${committeeId}`);
    revalidatePath("/organizer/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Transfer ownership error:", err);
    return { error: err.message || "Failed to transfer ownership." };
  }
}

export async function updateMemberRole(committeeId: string, memberId: string, newRole: CommitteeRole) {
  const session = await auth();
  const currentUser = await getSessionUser(session);
  if (!currentUser) return { error: "Unauthorized. Please sign in." };

  try {
    const callerMember = await db.committeeMember.findUnique({
      where: {
        committeeId_userId: {
          committeeId,
          userId: currentUser.id,
        },
      },
    });

    if (!callerMember || callerMember.role !== "OWNER") {
      return { error: "Only the Committee Owner can modify member permission levels." };
    }

    const targetMember = await db.committeeMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.role === "OWNER") {
      return { error: "Cannot modify the primary Owner role directly. Use Ownership Transfer." };
    }

    await db.committeeMember.update({
      where: { id: memberId },
      data: { role: newRole },
    });

    revalidatePath(`/organizer/committees/${committeeId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update role." };
  }
}

export async function removeCommitteeMember(committeeId: string, memberId: string) {
  const session = await auth();
  const currentUser = await getSessionUser(session);
  if (!currentUser) return { error: "Unauthorized. Please sign in." };

  try {
    const callerMember = await db.committeeMember.findUnique({
      where: {
        committeeId_userId: {
          committeeId,
          userId: currentUser.id,
        },
      },
    });

    if (!callerMember || callerMember.role !== "OWNER") {
      return { error: "Only the Committee Owner can remove members." };
    }

    const target = await db.committeeMember.findUnique({
      where: { id: memberId },
    });

    if (target?.role === "OWNER") {
      return { error: "The primary Owner cannot be removed." };
    }

    await db.committeeMember.delete({
      where: { id: memberId },
    });

    revalidatePath(`/organizer/committees/${committeeId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to remove member." };
  }
}
