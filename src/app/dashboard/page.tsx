import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  Code2,
  QrCode,
  GraduationCap,
  Globe2,
  Bed,
  Sparkles,
  ArrowRight,
  Building2,
  PlusCircle,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userId = session.user.id;

  let registrations: any[] = [];
  let userProfile: any = null;
  let userCommittees: any[] = [];

  try {
    userProfile = await db.user.findUnique({
      where: { id: userId },
    });

    registrations = await db.registration.findMany({
      where: { userId },
      include: {
        hackathon: {
          include: {
            committee: true,
          },
        },
        team: {
          include: {
            members: {
              include: { user: true },
            },
            submission: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    userCommittees = await db.committeeMember.findMany({
      where: { userId },
      include: {
        committee: {
          include: {
            _count: {
              select: { hackathons: true, members: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
  } catch (err) {
    console.warn("DB query error in dashboard:", err);
  }

  const isExternal = userProfile?.studentType === "EXTERNAL";

  // Compute primary next action
  const liveRegistration = registrations.find((r) => r.hackathon?.status === "HACKING_LIVE");
  const missingSubmissionRegistration = registrations.find(
    (r) => r.team && !r.team.submission && r.hackathon?.status !== "COMPLETED"
  );
  const soloRegistration = registrations.find((r) => !r.team);

  return (
    <div className="container px-4 sm:px-8 py-10 space-y-8">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Hacker Dashboard</h1>
            <span
              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                isExternal ? "badge-pastel-purple" : "badge-pastel-emerald"
              }`}
            >
              {isExternal ? "Outside University Student" : "PREC Loni Student"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Logged in as <strong className="text-foreground">{session.user.name}</strong> &bull;{" "}
            {userProfile?.collegeName} &bull; {userProfile?.department || "Engineering"} (PRN: {userProfile?.collegeRollNo || "—"})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
            <Link href="/#explore">Browse Hackathons</Link>
          </Button>
          <Button asChild size="sm" className="text-xs font-bold gap-1.5">
            <Link href="/organizer/committees/create">
              <PlusCircle className="h-3.5 w-3.5" />
              Form Committee
            </Link>
          </Button>
        </div>
      </div>

      {/* State-Aware Next Action Banner */}
      {liveRegistration ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive text-destructive-foreground shrink-0 animate-pulse">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-destructive">Sprint Is Active Right Now</p>
              <h3 className="text-sm font-bold text-foreground">
                {liveRegistration.hackathon?.title} is Live!
              </h3>
              <p className="text-xs text-muted-foreground">
                Check schedule milestones, live mentor sessions, and announcements.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="destructive" className="font-bold text-xs gap-1.5 shrink-0">
            <Link href={`/hackathons/${liveRegistration.hackathon?.slug}/live`}>
              Open Live Portal
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ) : missingSubmissionRegistration ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Submission Pending</p>
              <h3 className="text-sm font-bold text-foreground">
                Ready to submit prototype for {missingSubmissionRegistration.hackathon?.title}?
              </h3>
              <p className="text-xs text-muted-foreground">
                Squad: <strong>{missingSubmissionRegistration.team?.name}</strong>. Add your GitHub repository, live demo URL, and project notes.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="font-bold text-xs gap-1.5 shrink-0">
            <Link href={`/hackathons/${missingSubmissionRegistration.hackathon?.slug}/submit`}>
              Submit Prototype
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ) : soloRegistration ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Squad Formation</p>
              <h3 className="text-sm font-bold text-foreground">
                You are registered solo for {soloRegistration.hackathon?.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                You can participate solo or invite teammates to form a collaborative squad before hacking commences.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="border-amber-500/40 text-xs font-semibold shrink-0">
            <Link href={`/hackathons/${soloRegistration.hackathon?.slug}`}>
              View Hackathon Details
            </Link>
          </Button>
        </div>
      ) : registrations.length === 0 ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Ready to Innovate?</p>
              <h3 className="text-sm font-bold text-foreground">
                Explore Open Hackathons at Pravara Rural Engineering College
              </h3>
              <p className="text-xs text-muted-foreground">
                Join campus departmental hackathons or flagship state competitions welcoming outside universities.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="font-bold text-xs gap-1.5 shrink-0">
            <Link href="/#explore">
              Explore Hackathons
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ) : null}

      {/* Registrations List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            My Registered Hackathons ({registrations.length})
          </h2>
          {registrations.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/#explore">Browse More Events</Link>
            </Button>
          )}
        </div>

        {registrations.length === 0 ? (
          <Card className="border-dashed p-10 text-center bg-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary mb-3">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">No active hackathon registrations</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              You haven&apos;t joined any hackathons yet. Check out open competitions at Pravara Rural Engineering College!
            </p>
            <Button asChild className="mt-4 text-xs font-bold" size="sm">
              <Link href="/#explore">Discover Hackathons</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {registrations.map((reg) => {
              const hack = reg.hackathon;
              const team = reg.team;
              const isLive = hack.status === "HACKING_LIVE";

              return (
                <Card key={reg.id} className="overflow-hidden border bg-card shadow-xs">
                  <div className="flex flex-col lg:flex-row">
                    {/* Hackathon Info */}
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {isLive ? (
                          <span className="badge-pastel-rose text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1">
                            <Radio className="h-3 w-3" /> Live Sprint
                          </span>
                        ) : (
                          <span className="badge-pastel-emerald text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Registration Confirmed
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {hack.department || "Engineering Dept"}, PREC Loni
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold leading-tight text-foreground">
                          <Link href={`/hackathons/${hack.slug}`} className="hover:text-primary transition-colors">
                            {hack.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{hack.tagline}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div>
                          <span className="font-semibold text-foreground">Dates:</span> {formatDate(hack.hackingStart)} &ndash; {formatDate(hack.hackingEnd)}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Venue:</span> {hack.venue || "PREC Campus, Loni"}
                        </div>
                      </div>

                      {/* Squad Details */}
                      <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            Squad: <strong className="text-primary">{team ? team.name : "Solo Hacker"}</strong>
                          </span>
                          {team && (
                            <div className="flex items-center gap-1.5 bg-card border px-2 py-0.5 rounded text-xs font-mono shadow-2xs">
                              <span className="text-muted-foreground text-[9px]">JOIN CODE:</span>
                              <strong className="text-primary font-bold tracking-wider">{team.joinCode}</strong>
                            </div>
                          )}
                        </div>

                        {team ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {team.members.map((m: any) => (
                                <div
                                  key={m.id}
                                  className="inline-flex items-center gap-1.5 bg-card border rounded-md px-2.5 py-0.5 text-xs shadow-2xs"
                                >
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-[8px] bg-primary/20 text-primary font-bold">
                                      {m.user?.name?.slice(0, 1)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-foreground font-semibold text-[11px]">{m.user?.name}</span>
                                  {m.role === "LEADER" && (
                                    <span className="text-[8px] uppercase font-bold px-1 rounded-sm badge-pastel-amber">
                                      Leader
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                <span>Squad Capacity: {team.members.length} / {hack.maxTeamSize} Members</span>
                                <span className="font-bold text-foreground">
                                  {Math.round((team.members.length / hack.maxTeamSize) * 100)}%
                                </span>
                              </div>
                              <Progress
                                value={Math.round((team.members.length / hack.maxTeamSize) * 100)}
                                className="h-1.5"
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              Share code <strong className="font-mono text-foreground">{team.joinCode}</strong> with classmates to invite up to {hack.maxTeamSize} hackers.
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            You are registered solo. Form a squad or join via code before hacking commences.
                          </p>
                        )}
                      </div>

                      {/* Hostel request status */}
                      {reg.needsAccommodation && (
                        <div className="flex items-center gap-1.5 text-[11px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md">
                          <Bed className="h-3.5 w-3.5" />
                          Complimentary on-campus hostel accommodation confirmed at PREC Loni.
                        </div>
                      )}
                    </div>

                    {/* QR Code Desk Pass */}
                    <div className="border-t lg:border-t-0 lg:border-l bg-muted/20 p-6 flex flex-col justify-between w-full lg:w-72 space-y-4">
                      <div className="rounded-lg border bg-card p-3.5 space-y-2 text-center shadow-2xs">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Desk Check-In Pass
                        </div>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed bg-muted/40">
                          <QrCode className="h-12 w-12 text-primary" />
                        </div>
                        <p className="text-[9px] text-muted-foreground font-mono font-bold tracking-wider">
                          PASS: {reg.qrCodeSecret.slice(0, 12).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Present at PREC Central Desk</p>
                      </div>

                      <div className="space-y-2">
                        {isLive ? (
                          <Button asChild className="w-full font-bold gap-1.5 text-xs shadow-xs" variant="destructive" size="sm">
                            <Link href={`/hackathons/${hack.slug}/live`}>
                              <Radio className="h-3.5 w-3.5 animate-pulse" />
                              Open Live Hack Portal
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild className="w-full text-xs" variant="outline" size="sm">
                            <Link href={`/hackathons/${hack.slug}`}>View Event Details</Link>
                          </Button>
                        )}

                        {team && (
                          <Button asChild className="w-full gap-1.5 text-xs font-semibold" size="sm">
                            <Link href={`/hackathons/${hack.slug}/submit`}>
                              <Code2 className="h-3.5 w-3.5" />
                              {team.submission ? "Update Submission" : "Submit Prototype"}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Organizing Committees & Democratic Hub */}
      <div className="space-y-4 border-t pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              My Organizing Committees & Associations ({userCommittees.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Form or lead student bodies (e.g., CESA, ITSA, AI Society) to host hackathons with democratic leadership transfer
            </p>
          </div>

          <Button asChild size="sm" variant="outline" className="text-xs font-semibold gap-1.5 shrink-0">
            <Link href="/organizer/committees/create">
              <PlusCircle className="h-3.5 w-3.5 text-primary" />
              Form New Committee
            </Link>
          </Button>
        </div>

        {userCommittees.length === 0 ? (
          <Card className="border bg-card p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Want to host a departmental hackathon?
                </h4>
                <p className="text-xs text-muted-foreground max-w-xl">
                  You don&apos;t need a separate club account. Form a democratic committee under your student or faculty login, invite team members, and host hackathons with full rubric customization.
                </p>
              </div>
              <Button asChild size="sm" className="text-xs font-bold shrink-0">
                <Link href="/organizer/committees/create">Form Committee Now</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCommittees.map((item) => (
              <Card key={item.id} className="border bg-card p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md badge-pastel-blue">
                    {item.role}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.committee._count?.hackathons || 0} Events
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    <Link href={`/organizer/committees/${item.committee.id}`} className="hover:text-primary transition-colors">
                      {item.committee.name}
                    </Link>
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {item.committee.department} &bull; {item.committee.contactEmail}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t">
                  <Button asChild size="sm" variant="ghost" className="text-xs font-semibold h-7 px-2">
                    <Link href={`/organizer/committees/${item.committee.id}`}>
                      Manage & Roles
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="text-xs font-bold h-7 px-2 ml-auto">
                    <Link href="/organizer/dashboard">
                      Organizer Hub
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
