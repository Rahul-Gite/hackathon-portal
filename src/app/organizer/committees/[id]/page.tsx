import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Users,
  ShieldCheck,
  Crown,
  UserPlus,
  ArrowLeft,
  Calendar,
  Settings,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";
import { AddMemberForm } from "./add-member-form";
import { TransferOwnershipModal } from "./transfer-ownership-modal";
import { MemberRowActions } from "./member-row-actions";

interface PageProps {
  params: { id: string };
}

export default async function ManageCommitteePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    redirect(`/login?callbackUrl=/organizer/committees/${params.id}`);
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

  let committee: any = null;

  try {
    committee = await db.committee.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: { user: true },
          orderBy: { role: "asc" }, // OWNER first, then CO_MANAGER, then COORDINATOR
        },
        hackathons: {
          include: {
            _count: { select: { registrations: true, teams: true, submissions: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (err) {
    console.warn("DB committee lookup error:", err);
  }

  if (!committee) {
    notFound();
  }

  const myMembership = committee.members.find((m: any) => m.userId === userId);

  if (!myMembership) {
    return (
      <div className="container max-w-lg py-20 px-4 text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-xs text-muted-foreground mt-2">
          You are not an authorized member of <strong>{committee.name}</strong>.
        </p>
      </div>
    );
  }

  const isOwner = myMembership.role === "OWNER";
  const isManager = myMembership.role === "OWNER" || myMembership.role === "CO_MANAGER";
  const ownerMember = committee.members.find((m: any) => m.role === "OWNER");

  return (
    <div className="container max-w-4xl py-10 px-4 sm:px-8 space-y-8">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1 mb-4 text-xs font-semibold">
          <Link href="/organizer/dashboard">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Department Hub
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge-pastel-blue text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                {committee.department || "Engineering Dept"}
              </span>
              <span className="text-muted-foreground">&bull;</span>
              <span className="text-xs text-muted-foreground font-semibold">PREC Loni Committee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{committee.name}</h1>
            <p className="text-xs text-muted-foreground">
              Official Email: <strong className="text-foreground">{committee.contactEmail}</strong> &bull; Your Role:{" "}
              <strong className="text-primary font-bold">{myMembership.role}</strong>
            </p>
          </div>

          {isManager && (
            <Button asChild size="sm" className="font-bold text-xs shadow-xs">
              <Link href={`/organizer/hackathons/create?committeeId=${committee.id}`}>
                Host Hackathon under this Committee
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Democratic Governance Banner */}
      <Card className="border border-amber-500/30 bg-amber-500/5 shadow-2xs">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg badge-pastel-amber flex items-center justify-center text-amber-700 shrink-0">
              <Crown className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">
                  Democratic Head / Primary Owner
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground">
                {ownerMember?.user?.name || "Unassigned"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {ownerMember?.user?.email} &bull; Holds top authority and can democratically rotate ownership to any active member.
              </p>
            </div>
          </div>

          {isOwner && (
            <TransferOwnershipModal
              committeeId={committee.id}
              currentOwnerId={userId}
              members={committee.members.filter((m: any) => m.userId !== userId)}
            />
          )}
        </CardContent>
      </Card>

      {/* 3-Tier Democratic Permission Matrix Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border bg-card p-3.5 space-y-1">
          <span className="badge-pastel-amber text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
            Level 1: OWNER
          </span>
          <p className="font-bold text-foreground">Democratic Head</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Full governance, invite members, modify roles, transfer ownership, and delete committee.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3.5 space-y-1">
          <span className="badge-pastel-blue text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
            Level 2: CO_MANAGER
          </span>
          <p className="font-bold text-foreground">Event & Tech Manager</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Create/edit hackathons, page customizations, rubric scoring, announcements, and team management.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3.5 space-y-1">
          <span className="badge-pastel-emerald text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
            Level 3: COORDINATOR
          </span>
          <p className="font-bold text-foreground">Desk Operator</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Operational attendance check-in, identity verification, hostel help desk, and student queries.
          </p>
        </div>
      </div>

      {/* Members Management Table */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Committee Members ({committee.members.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Login accounts granted management access under this committee
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow className="uppercase text-[10px]">
                <TableHead className="py-2.5 px-3">Member Name & Email</TableHead>
                <TableHead className="py-2.5 px-3">Institution & Dept</TableHead>
                <TableHead className="py-2.5 px-3">Permission Level</TableHead>
                <TableHead className="py-2.5 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {committee.members.map((m: any) => {
                const roleBadgeClass =
                  m.role === "OWNER"
                    ? "badge-pastel-amber"
                    : m.role === "CO_MANAGER"
                    ? "badge-pastel-blue"
                    : "badge-pastel-emerald";

                return (
                  <TableRow key={m.id} className="hover:bg-muted/20">
                    <TableCell className="py-3 px-3">
                      <p className="font-bold text-foreground">{m.user.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.user.email}</p>
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <p className="font-medium text-foreground">{m.user.collegeName}</p>
                      <p className="text-[10px] text-muted-foreground">{m.user.department || "Engineering"}</p>
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold ${roleBadgeClass}`}>
                        {m.role}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right">
                      <MemberRowActions
                        committeeId={committee.id}
                        memberId={m.id}
                        currentRole={m.role}
                        isOwner={isOwner}
                        isSelf={m.userId === userId}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Add Member Form (visible to Owner and Co-Managers) */}
          {isManager && (
            <div className="pt-4 border-t">
              <AddMemberForm committeeId={committee.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hosted Hackathons */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Hackathons Hosted by {committee.name} ({committee.hackathons.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {committee.hackathons.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No hackathons hosted yet by this committee.</p>
          ) : (
            committee.hackathons.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{h.title}</h4>
                  <p className="text-muted-foreground text-[11px]">
                    {h._count.registrations} Registrations &bull; {h._count.teams} Squads &bull; Status: {h.status}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs">
                  <Link href={`/organizer/hackathons/${h.id}`}>Manage Event & Teams</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
