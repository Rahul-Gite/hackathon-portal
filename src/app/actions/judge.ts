"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitJudgeScore(data: {
  submissionId: string;
  innovation: number;
  technicalDepth: number;
  design: number;
  pitch: number;
  feedback?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }

  const judgeId = session.user.id;
  const totalScore = Number(
    ((data.innovation + data.technicalDepth + data.design + data.pitch) / 4).toFixed(1)
  );

  try {
    await db.judgeScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId: data.submissionId,
          judgeId,
        },
      },
      update: {
        criteriaScores: {
          innovation: data.innovation,
          technicalDepth: data.technicalDepth,
          design: data.design,
          pitch: data.pitch,
        },
        totalScore,
        feedback: data.feedback,
      },
      create: {
        submissionId: data.submissionId,
        judgeId,
        criteriaScores: {
          innovation: data.innovation,
          technicalDepth: data.technicalDepth,
          design: data.design,
          pitch: data.pitch,
        },
        totalScore,
        feedback: data.feedback,
      },
    });

    revalidatePath("/hackathons");
    return { success: true, totalScore };
  } catch (err: any) {
    console.error("Judge score error:", err);
    return { error: err.message || "Failed to submit score." };
  }
}
