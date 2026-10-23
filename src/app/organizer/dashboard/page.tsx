import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  PlusCircle,
  Calendar,
  Users,
  Radio,
  Clock,
  ArrowRight,
  Settings,
  Trophy,
  Crown,
  Building2,
  Lock,
  Globe2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function OrganizerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    redirect("/login?callbackUrl=/organizer/dashboard");
  }

  let userProfile: any = null;
  let committeeMemberships: any[] = [];

  try {
    userProfile = await db.user.findFirst({
      where: {
        OR: [
          session.user.id ? { id: session.user.id } : undefined,
          session.user.email ? { email: String(session.user.email).toLowerCase().trim() } : undefined,
        ].filter(Boolean) as any,
      },
    });

    const userId = userProfile?.id || session.user.id;

    if (userId) {
      committeeMemberships = await db.committeeMember.findMany({
        where: { userId },
        include: {
          committee: {
            include: {
              members: { include: { user: true } },
              hackathons: {
                include: {
                  _count: { select: { registrations: true, teams: true, submissions: true } },
                },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });
    }
  } catch (err) {
    console.warn("Organizer DB error:", err);
  }

  // Aggregate hackathons across all committees user is a member of
  const allCommittees = committeeMemberships.map((m) => m.committee);
  const allHackathons = allCommittees.flatMap((c) =>
    c.hackathons.map((h: any) => ({ ...h, committeeName: c.name }))
  );

  const totalHackers = allHackathons.reduce((acc, h) => acc + (h._count?.registrations || 0), 0);
  const totalTeams = allHackathons.reduce((acc, h) => acc + (h._count?.teams || 0), 0);
  const totalSubmissions = allHackathons.reduce((acc, h) => acc + (h._count?.submissions || 0), 0);

  return (
    <div className="container px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-pastel-blue text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm">
              Democratic Committee Portal
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground font-semibold">Pravara Rural Engineering College</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
            Department & Committee Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged in as <strong className="text-foreground">{session.user.name}</strong> &bull; Member of{" "}
            <strong className="text-primary font-bold">{allCommittees.length}</strong> Organizing Committee(s)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
            <Link href="/organizer/committees/create">
              <Users className="h-4 w-4 text-primary" />
              Form New Committee
            </Link>
          </Button>

          {allCommittees.length > 0 && (
            <Button asChild size="sm" className="gap-1.5 font-bold shadow-xs text-xs">
              <Link href="/organizer/hackathons/create">
                <PlusCircle className="h-4 w-4" />
                Host New Hackathon
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold">Your Committees</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{allCommittees.length}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            Democratic Associations
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold">Total Registrants</CardDescription>
            <CardTitle className="text-2xl font-black text-primary">{totalHackers}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            Enrolled Hackers
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold">Active Squads</CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {totalTeams}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            Formed Teams
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold">Prototypes Received</CardDescription>
            <CardTitle className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {totalSubmissions}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1.5 text-[11px] text-muted-foreground">
            <div className="flex justify-between items-center text-[10px]">
              <span>Submission Rate</span>
              <span className="font-bold text-foreground">
                {totalTeams > 0 ? `${Math.round((totalSubmissions / totalTeams) * 100)}%` : "0%"}
              </span>
            </div>
            <Progress
              value={totalTeams > 0 ? Math.round((totalSubmissions / totalTeams) * 100) : 0}
              className="h-1.5"
            />
          </CardContent>
        </Card>
      </div>

      {/* Committees Managed by Current User */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Your Committees & Leadership Roles ({allCommittees.length})
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-bold">
            <Link href="/organizer/committees/create">+ Create Committee</Link>
          </Button>
        </div>

        {allCommittees.length === 0 ? (
          <Card className="border-dashed p-8 text-center bg-card">
            <h3 className="font-bold text-sm text-foreground">You are not a member of any committee yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Create an organizing committee for your department (e.g. CESA, ITSA, AI Society) or ask a committee manager to add your email.
            </p>
            <Button asChild size="sm" className="mt-4 text-xs font-bold">
              <Link href="/organizer/committees/create">Form First Committee</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {committeeMemberships.map((m) => {
              const comm = m.committee;
              const isOwner = m.role === "OWNER";
              const roleBadgeClass =
                m.role === "OWNER"
                  ? "badge-pastel-amber"
                  : m.role === "CO_MANAGER"
                  ? "badge-pastel-blue"
                  : "badge-pastel-emerald";

              return (
                <Card key={comm.id} className="border bg-card shadow-xs p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-foreground">{comm.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{comm.department || "Engineering Dept"}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${roleBadgeClass}`}>
                      {m.role}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {comm.description || "Active departmental hackathon organizing committee."}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <span className="text-muted-foreground text-[11px]">
                      {comm.members.length} Members &bull; {comm.hackathons.length} Hackathons
                    </span>

                    <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
                      <Link href={`/organizer/committees/${comm.id}`}>
                        <Settings className="h-3.5 w-3.5 mr-1 text-primary" />
                        Manage Committee & Leadership
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Hosted Hackathons Across Committees */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Hackathons Managed by Your Committees ({allHackathons.length})
          </h2>
        </div>

        {allHackathons.length === 0 ? (
          <Card className="border-dashed p-8 text-center bg-card">
            <p className="text-xs text-muted-foreground">No hackathons hosted yet. Click &apos;Host New Hackathon&apos; above.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {allHackathons.map((hack: any) => {
              const isLive = hack.status === "HACKING_LIVE";
              const isOpenToAll = hack.audience === "ALL_COLLEGES";

              return (
                <Card key={hack.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border bg-card shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${
                          isLive ? "badge-pastel-rose animate-pulse" : "badge-pastel-emerald"
                        }`}
                      >
                        {hack.status.replace("_", " ")}
                      </span>

                      {isOpenToAll ? (
                        <span className="badge-pastel-purple text-[9px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                          <Globe2 className="h-3 w-3" /> State-Level (All Colleges)
                        </span>
                      ) : (
                        <span className="badge-pastel-amber text-[9px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                          <Lock className="h-3 w-3" /> PREC Loni Only
                        </span>
                      )}

                      <span className="text-[11px] text-muted-foreground">
                        {hack.committeeName} &bull; {formatDate(hack.hackingStart)}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-foreground">
                      <Link href={`/organizer/hackathons/${hack.id}`} className="hover:text-primary transition-colors">
                        {hack.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {hack._count?.registrations || 0} Registrations &bull; {hack._count?.teams || 0} Squads &bull;{" "}
                      {hack._count?.submissions || 0} Submissions
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="text-xs">
                      <Link href={`/hackathons/${hack.slug}`} target="_blank">
                        Public Page
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="gap-1.5 text-xs font-bold">
                      <Link href={`/organizer/hackathons/${hack.id}`}>
                        <Settings className="h-3.5 w-3.5" />
                        Manage Event & Check-In
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
