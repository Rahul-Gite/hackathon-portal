import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CheckCircle2,
  Radio,
  Clock,
  Pin,
  ExternalLink,
  Code2,
  Send,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  Globe2,
  Bed,
  FileText,
  Github,
  Mail,
  UserCheck,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { CheckInToggle } from "./checkin-toggle";
import { AnnouncementPoster } from "./announcement-poster";
import { StatusSwitcher } from "./status-switcher";

interface PageProps {
  params: { id: string };
}

export default async function ManageHackathonPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    redirect(`/login?callbackUrl=/organizer/hackathons/${params.id}`);
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

  let hackathon: any = null;

  try {
    hackathon = await db.hackathon.findUnique({
      where: { id: params.id },
      include: {
        committee: {
          include: { members: true },
        },
        registrations: {
          include: {
            user: true,
            team: {
              include: {
                members: { include: { user: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        teams: {
          include: {
            members: {
              include: { user: true },
            },
            submission: {
              include: { scores: { include: { judge: true } } },
            },
            registrations: {
              include: { user: true },
            },
          },
        },
        announcements: {
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        },
      },
    });
  } catch (err) {
    console.warn("DB lookup error:", err);
  }

  if (!hackathon) {
    notFound();
  }

  const checkedInCount = hackathon.registrations.filter((r: any) => r.status === "CHECKED_IN").length;
  const submissionsCount = hackathon.teams.filter((t: any) => Boolean(t.submission)).length;
  const hostelCount = hackathon.registrations.filter((r: any) => r.needsAccommodation).length;
  const outsideCount = hackathon.registrations.filter((r: any) => r.studentType === "EXTERNAL").length;

  return (
    <div className="container px-4 sm:px-8 py-10 space-y-8">
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
              <span className="badge-pastel-blue text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                {hackathon.department || "Computer Engineering"}
              </span>
              <span className="text-muted-foreground">&bull;</span>
              <span className="text-xs text-muted-foreground font-semibold">{hackathon.committee?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{hackathon.title}</h1>
            <p className="text-xs text-muted-foreground">
              Slug: <code className="font-mono text-primary font-bold">{hackathon.slug}</code> &bull; Hacking Window:{" "}
              {formatDate(hackathon.hackingStart)} &ndash; {formatDate(hackathon.hackingEnd)}
            </p>
          </div>

          <StatusSwitcher hackathonId={hackathon.id} currentStatus={hackathon.status} />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold">Registrations</CardDescription>
            <CardTitle className="text-2xl font-black text-primary">{hackathon.registrations.length}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            {outsideCount} Outside &bull; {hackathon.registrations.length - outsideCount} Internal
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold">Venue Checked-In</CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {checkedInCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1.5 text-[11px] text-muted-foreground">
            <div className="flex justify-between items-center text-[10px]">
              <span>Desk Verification</span>
              <span className="font-bold text-foreground">
                {hackathon.registrations.length > 0
                  ? `${Math.round((checkedInCount / hackathon.registrations.length) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <Progress
              value={
                hackathon.registrations.length > 0
                  ? Math.round((checkedInCount / hackathon.registrations.length) * 100)
                  : 0
              }
              className="h-1.5"
            />
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold">Hostel Accommodations</CardDescription>
            <CardTitle className="text-2xl font-black text-purple-700 dark:text-purple-300">
              {hostelCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            PREC Campus Hostel Requests
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold">Squads Formed</CardDescription>
            <CardTitle className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {hackathon.teams.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            {submissionsCount} Projects Submitted
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="squads" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/60">
          <TabsTrigger value="squads" className="text-xs font-semibold">
            Squads & Member Directory ({hackathon.teams.length})
          </TabsTrigger>
          <TabsTrigger value="registrations" className="text-xs font-semibold">
            All Registrants ({hackathon.registrations.length})
          </TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs font-semibold">
            Broadcast Updates ({hackathon.announcements.length})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs font-semibold">
            Prototypes & Scoring ({submissionsCount})
          </TabsTrigger>
        </TabsList>

        {/* Squads Directory Tab */}
        <TabsContent value="squads" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Registered Squads & Member Information</h3>
              <p className="text-xs text-muted-foreground">
                Deep access into every formed squad, member profiles, contact info, and track selections
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {hackathon.teams.length === 0 ? (
              <Card className="p-8 text-center border-dashed bg-card">
                <p className="text-xs text-muted-foreground">No squads formed yet for this hackathon.</p>
              </Card>
            ) : (
              hackathon.teams.map((team: any) => (
                <Card key={team.id} className="border bg-card shadow-xs p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-foreground">{team.name}</h4>
                        <span className="badge-pastel-blue text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm">
                          CODE: {team.joinCode}
                        </span>
                        {team.submission ? (
                          <span className="badge-pastel-emerald text-[9px] font-bold px-2 py-0.5 rounded-sm">
                            Project Submitted
                          </span>
                        ) : (
                          <span className="badge-pastel-amber text-[9px] font-bold px-2 py-0.5 rounded-sm">
                            Hacking
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Track: <strong>{team.trackPreference || "Open Innovation"}</strong>
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <span>Squad Size: <strong>{team.members.length} / {hackathon.maxTeamSize}</strong></span>
                    </div>
                  </div>

                  {/* Member Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {team.members.map((m: any) => {
                      const isExt = m.user.studentType === "EXTERNAL";
                      const regInfo = team.registrations.find((r: any) => r.userId === m.userId);

                      return (
                        <div key={m.id} className="p-3 rounded-md border bg-muted/20 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              {m.user.name}
                              {m.role === "LEADER" && (
                                <span className="badge-pastel-amber text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-sm">
                                  Leader
                                </span>
                              )}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                                isExt ? "badge-pastel-purple" : "badge-pastel-emerald"
                              }`}
                            >
                              {isExt ? "Outside" : "PREC"}
                            </span>
                          </div>

                          <p className="text-muted-foreground text-[11px]">{m.user.email}</p>
                          <p className="text-[11px] text-foreground font-semibold truncate">{m.user.collegeName}</p>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t">
                            <span>PRN: {m.user.collegeRollNo || "—"}</span>
                            <span>&bull;</span>
                            <span>Dept: {m.user.department || "Engg"}</span>
                            {regInfo?.needsAccommodation && (
                              <span className="badge-pastel-purple px-1.5 py-0.5 rounded-xs font-bold flex items-center gap-1">
                                <Bed className="h-3 w-3" /> Hostel
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* All Registrants Tab */}
        <TabsContent value="registrations" className="mt-6 space-y-4">
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Individual Participant Attendance Roster</CardTitle>
              <CardDescription className="text-xs">
                Toggle desk check-in as hackers arrive at the PREC campus registration counter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="uppercase text-[10px]">
                    <TableHead className="py-2.5 px-3">Student Name</TableHead>
                    <TableHead className="py-2.5 px-3">College & Department</TableHead>
                    <TableHead className="py-2.5 px-3">Squad</TableHead>
                    <TableHead className="py-2.5 px-3">Hostel</TableHead>
                    <TableHead className="py-2.5 px-3">Status</TableHead>
                    <TableHead className="py-2.5 px-3 text-right">Desk Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hackathon.registrations.map((reg: any) => {
                    const isExt = reg.studentType === "EXTERNAL";
                    return (
                      <TableRow key={reg.id} className="hover:bg-muted/20">
                        <TableCell className="py-3 px-3">
                          <p className="font-bold text-foreground">{reg.user.name}</p>
                          <p className="text-muted-foreground text-[11px]">{reg.user.email}</p>
                        </TableCell>
                        <TableCell className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                                isExt ? "badge-pastel-purple" : "badge-pastel-emerald"
                              }`}
                            >
                              {isExt ? "Outside" : "PREC"}
                            </span>
                            <span className="font-semibold text-foreground truncate max-w-[200px]">
                              {reg.collegeName}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            PRN: {reg.user.collegeRollNo || "—"} &bull; {reg.user.department || "Engg"}
                          </p>
                        </TableCell>
                        <TableCell className="py-3 px-3">
                          {reg.team ? (
                            <span className="font-bold text-foreground">{reg.team.name}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Solo</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-3">
                          {reg.needsAccommodation ? (
                            <span className="badge-pastel-purple px-1.5 py-0.5 rounded-sm text-[10px] font-bold flex items-center gap-1 w-fit">
                              <Bed className="h-3 w-3" /> Hostel
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">No</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                              reg.status === "CHECKED_IN" ? "badge-pastel-emerald" : "badge-pastel-blue"
                            }`}
                          >
                            {reg.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-3 text-right">
                          <CheckInToggle registrationId={reg.id} initialStatus={reg.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="mt-6 space-y-6">
          <AnnouncementPoster hackathonId={hackathon.id} />

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Previously Broadcasted Updates</h3>
            {hackathon.announcements.map((ann: any) => (
              <Card
                key={ann.id}
                className={ann.isPinned ? "border-primary/40 bg-primary/5 shadow-2xs" : "border bg-card"}
              >
                <CardHeader className="p-4 pb-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {ann.isPinned && (
                        <span className="badge-pastel-rose text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                      <CardTitle className="text-xs font-bold text-foreground">{ann.title}</CardTitle>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDateTime(ann.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  {ann.content}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="mt-6 space-y-4">
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Prototypes & Jury Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hackathon.teams
                  .filter((t: any) => Boolean(t.submission))
                  .map((team: any) => {
                    const sub = team.submission;
                    const avgScore =
                      sub.scores.length > 0
                        ? (sub.scores.reduce((a: number, b: any) => a + b.totalScore, 0) / sub.scores.length).toFixed(1)
                        : "Pending";

                    return (
                      <div key={team.id} className="rounded-md border p-4 space-y-2.5 bg-muted/20 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-foreground">{sub.title}</h4>
                              <span className="badge-pastel-blue text-[10px] px-2 py-0.5 rounded-sm font-bold">
                                {sub.track}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{sub.tagline}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">Faculty Score:</span>
                            <span className="badge-pastel-emerald px-2 py-0.5 rounded-sm text-xs font-bold">
                              {avgScore} / 10
                            </span>
                          </div>
                        </div>

                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">{sub.description}</p>

                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-[11px]">
                          <span className="text-muted-foreground">Squad: <strong>{team.name}</strong></span>
                          {sub.repoUrl && (
                            <a href={sub.repoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 font-semibold">
                              GitHub Repo <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {sub.demoUrl && (
                            <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 font-semibold">
                              Live Demo <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {sub.videoUrl && (
                            <a href={sub.videoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 font-semibold">
                              Video Demo <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
