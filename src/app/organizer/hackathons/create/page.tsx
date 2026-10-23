import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { CreateHackathonForm } from "./create-form";

export default async function CreateHackathonPage({
  searchParams,
}: {
  searchParams: { committeeId?: string };
}) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    redirect("/login?callbackUrl=/organizer/hackathons/create");
  }

  const currentUser = await db.user.findFirst({
    where: {
      OR: [
        session.user.id ? { id: session.user.id } : undefined,
        session.user.email ? { email: String(session.user.email).toLowerCase().trim() } : undefined,
      ].filter(Boolean) as any,
    },
  });

  const userId = currentUser?.id || session.user.id;

  // Find committees where user is OWNER or CO_MANAGER
  const memberships = await db.committeeMember.findMany({
    where: {
      userId,
      role: { in: ["OWNER", "CO_MANAGER"] },
    },
    include: {
      committee: true,
    },
  });

  const availableCommittees = memberships.map((m) => ({
    id: m.committee.id,
    name: m.committee.name,
    department: m.committee.department,
    role: m.role,
  }));

  if (availableCommittees.length === 0) {
    return (
      <div className="container max-w-lg py-20 px-4 text-center">
        <Card className="p-8 border-dashed bg-card space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Form a Committee First</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hackathons at Pravara Rural Engineering College are hosted democratically under Student Associations or Departmental Committees (e.g. CESA, ITSA, AI Society).
          </p>
          <div className="pt-2">
            <Button asChild size="sm" className="font-bold text-xs">
              <Link href="/organizer/committees/create">Form New Committee</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-12 px-4 sm:px-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          Pravara Rural Engineering College, Loni
        </span>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Host a Department Hackathon
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Customize all visual elements, audience eligibility (Inter-College vs Internal PREC), custom questions, tracks, and timeline milestones
        </p>
      </div>

      <CreateHackathonForm
        committees={availableCommittees}
        initialCommitteeId={searchParams.committeeId || availableCommittees[0].id}
      />
    </div>
  );
}
