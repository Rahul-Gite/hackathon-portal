import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Radio,
  Clock,
  Pin,
  MessageSquare,
  Code2,
  ExternalLink,
  Sparkles,
  Wifi,
  FileCode,
  ArrowRight,
  AlertTriangle,
  Cpu,
  Lightbulb,
  GraduationCap,
  Bed,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { LiveCountdown } from "./countdown";

interface PageProps {
  params: { slug: string };
}

export default async function LiveHackathonPage({ params }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  let hackathon: any = null;

  try {
    hackathon = await db.hackathon.findUnique({
      where: { slug: params.slug },
      include: {
        committee: true,
        announcements: {
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        },
        registrations: userId
          ? {
              where: { userId },
              include: { team: { include: { submission: true } } },
            }
          : false,
      },
    });
  } catch (err) {
    console.warn("DB lookup error in live:", err);
  }

  if (!hackathon) {
    notFound();
  }

  const userReg = hackathon.registrations?.[0];
  const userTeam = userReg?.team;
  const userSubmission = userTeam?.submission;
  const pinnedAnnouncements = hackathon.announcements.filter((a: any) => a.isPinned);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "URGENT":
        return (
          <span className="badge-pastel-rose inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold">
            <AlertTriangle className="h-3 w-3" /> Urgent
          </span>
        );
      case "LOGISTICS":
        return (
          <span className="badge-pastel-amber inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold">
            <Cpu className="h-3 w-3" /> Campus & Lab Logistics
          </span>
        );
      case "MENTORSHIP":
        return (
          <span className="badge-pastel-emerald inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold">
            <Lightbulb className="h-3 w-3" /> Mentorship
          </span>
        );
      case "SCHEDULE":
        return (
          <span className="badge-pastel-blue inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold">
            <Clock className="h-3 w-3" /> Schedule Shift
          </span>
        );
      default:
        return (
          <span className="badge-pastel-purple inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold">
            Announcement
          </span>
        );
    }
  };

  return (
    <div className="container px-4 sm:px-8 py-8 space-y-6">
      {/* Pinned Urgent Alert Ticker if any */}
      {pinnedAnnouncements.length > 0 && (
        <Alert variant="destructive" className="border-rose-500/30 bg-rose-500/10">
          <Pin className="h-4 w-4 text-rose-600" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
            <div>
              <AlertTitle className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                Active Broadcast: {pinnedAnnouncements[0].title}
              </AlertTitle>
              <AlertDescription className="text-foreground font-medium mt-0.5">
                {pinnedAnnouncements[0].content}
              </AlertDescription>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {formatDateTime(pinnedAnnouncements[0].createdAt)}
            </span>
          </div>
        </Alert>
      )}

      {/* Live Header with Pastel Banner & Countdown Clock */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge-pastel-rose inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                <Radio className="h-3.5 w-3.5" />
                Live Hack Day Portal
              </span>
              <span className="text-xs text-muted-foreground">
                PREC Loni &bull; {hackathon.department || "Computer Engineering"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {hackathon.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Live announcement stream, mentorship round calls, and prototype submission status.
            </p>
          </div>

          {/* Interactive Countdown */}
          <div className="flex flex-col items-start lg:items-end gap-3">
            <LiveCountdown targetDate={hackathon.hackingEnd} />

            {userTeam ? (
              <Button asChild size="sm" className="font-bold gap-2 text-xs shadow-sm">
                <Link href={`/hackathons/${hackathon.slug}/submit`}>
                  <Code2 className="h-4 w-4" />
                  {userSubmission ? "Update Project Submission" : "Submit Project Prototype"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href={`/hackathons/${hackathon.slug}/register`}>Register Squad to Submit</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Announcements Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Live Broadcaster Feed ({hackathon.announcements.length})
            </h2>
            <span className="text-[11px] text-muted-foreground">Broadcasted by PREC Organizing Team</span>
          </div>

          <div className="space-y-3">
            {hackathon.announcements && hackathon.announcements.length > 0 ? (
              hackathon.announcements.map((ann: any) => (
                <Card
                  key={ann.id}
                  className={
                    ann.isPinned
                      ? "border-primary/40 bg-primary/5 shadow-xs"
                      : "border bg-card shadow-2xs"
                  }
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {ann.isPinned && (
                          <span className="badge-pastel-rose inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold">
                            <Pin className="h-3 w-3" /> Pinned
                          </span>
                        )}
                        {getCategoryBadge(ann.category)}
                        <CardTitle className="text-sm font-bold text-foreground">{ann.title}</CardTitle>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDateTime(ann.createdAt)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center border-dashed bg-card">
                <p className="text-xs text-muted-foreground">No announcements yet. Keep coding!</p>
              </Card>
            )}
          </div>
        </div>

        {/* Campus Logistics & Schedule Sidebar */}
        <div className="space-y-6">
          {/* PREC Logistics Card */}
          <Card className="border bg-card shadow-2xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                PREC Campus Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40">
                <Wifi className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">PREC Gigabit Wi-Fi</p>
                  <p className="text-muted-foreground text-[10px]">
                    SSID: <strong>PREC-HACK-GUEST</strong> / Pass: <strong>pravara2026</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40">
                <Bed className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Hostel Accommodations</p>
                  <p className="text-muted-foreground text-[10px]">
                    Boys Hostel #3 & Girls Hostel #2 desks active 24/7.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40">
                <Cpu className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Hardware & GPU Lab Access</p>
                  <p className="text-muted-foreground text-[10px]">
                    Central Computing Facility (CCF) terminals and high-speed build servers available 24/7.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Timeline */}
          <Card className="border bg-card shadow-2xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Live Schedule Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3.5 text-xs">
              <div className="border-l-2 border-primary/40 pl-3 space-y-3">
                {(Array.isArray(hackathon.scheduleMilestones) && hackathon.scheduleMilestones.length > 0
                  ? hackathon.scheduleMilestones
                  : [
                      { day: "Day 1", time: "10:00 AM", title: "Inauguration Ceremony", description: "" },
                      { day: "Day 1", time: "01:30 PM", title: "Mid-Sprint Architecture Review", description: "" },
                      { day: "Day 1", time: "06:00 PM", title: "Mentorship Round 1", description: "" },
                      { day: "Day 2", time: "11:00 AM", title: "Submissions Close", description: "" },
                    ]
                ).map((m: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex items-center gap-1.5 font-bold text-foreground text-[11px]">
                      <span className="text-primary">{m.time}</span>
                      <span>&bull;</span>
                      <span>{m.title}</span>
                    </div>
                    {m.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        {m.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
