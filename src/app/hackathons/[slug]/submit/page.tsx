import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ProjectSubmissionForm } from "./submission-form";

interface PageProps {
  params: { slug: string };
}

export default async function SubmitProjectPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/hackathons/${params.slug}/submit`);
  }

  const userId = session.user.id;

  let hackathon: any = null;
  let userReg: any = null;

  try {
    hackathon = await db.hackathon.findUnique({
      where: { slug: params.slug },
    });

    userReg = await db.registration.findFirst({
      where: {
        hackathonId: hackathon?.id,
        userId,
      },
      include: {
        team: {
          include: {
            submission: true,
          },
        },
      },
    });
  } catch (err) {
    console.warn("DB lookup error:", err);
  }

  if (!hackathon) {
    notFound();
  }

  if (!userReg || !userReg.team) {
    return (
      <div className="container max-w-lg py-20 px-4 text-center">
        <h2 className="text-xl font-bold">Team Required</h2>
        <p className="text-sm text-muted-foreground mt-2">
          You must be part of a registered squad in <strong>{hackathon.title}</strong> to submit a project.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12 px-4 sm:px-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Project Submission</h1>
        <p className="text-sm text-muted-foreground">
          Submit your team&apos;s project for <strong>{hackathon.title}</strong> (Team: {userReg.team.name})
        </p>
      </div>

      <ProjectSubmissionForm
        hackathonId={hackathon.id}
        teamId={userReg.team.id}
        slug={hackathon.slug}
        initialData={userReg.team.submission}
        tracks={Array.isArray(hackathon.tracks) ? hackathon.tracks : []}
      />
    </div>
  );
}
