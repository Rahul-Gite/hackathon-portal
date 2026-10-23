import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Clock,
  Sparkles,
  FileText,
  HelpCircle,
  Award,
  Globe2,
  Lock,
  Bed,
  GraduationCap,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function HackathonDetailsPage({ params }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  let hackathon: any = null;

  try {
    hackathon = await db.hackathon.findUnique({
      where: { slug: params.slug },
      include: {
        committee: true,
        registrations: {
          where: userId ? { userId } : { id: "none" },
          include: {
            team: {
              include: {
                members: {
                  include: { user: true },
                },
              },
            },
          },
        },
        _count: {
          select: { registrations: true, teams: true },
        },
      },
    });
  } catch (e) {
    console.warn("DB lookup error:", e);
  }

  if (!hackathon) {
    notFound();
  }

  const userRegistration = hackathon.registrations?.[0];
  const isRegistered = Boolean(userRegistration);
  const isLive = hackathon.status === "HACKING_LIVE";
  const isOpenToAll = hackathon.audience === "ALL_COLLEGES";

  return (
    <div className="min-h-screen pb-16">
      {/* Banner Header */}
      <div className="relative border-b bg-card">
        <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-900">
          <img
            src={
              hackathon.bannerUrl ||
              "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
            }
            alt={hackathon.title}
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="container relative -mt-24 px-4 sm:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {isLive ? (
                  <span className="badge-pastel-rose inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    <Radio className="h-3 w-3" /> Live Sprint
                  </span>
                ) : (
                  <span className="badge-pastel-emerald inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" /> Registration Open
                  </span>
                )}

                {isOpenToAll ? (
                  <span className="badge-pastel-purple inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-bold">
                    <Globe2 className="h-3 w-3" /> State-Level &bull; Open to All Outside Colleges
                  </span>
                ) : (
                  <span className="badge-pastel-amber inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-bold">
                    <Lock className="h-3 w-3" /> PREC Loni Internal Sprints Only
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-card px-2.5 py-0.5 rounded-md border shadow-2xs">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  {hackathon.department || "Engineering Dept"}, PREC Loni
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                {hackathon.title}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {hackathon.tagline}
              </p>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-end">
              {isLive ? (
                <Button asChild size="lg" variant="destructive" className="gap-2 font-bold shadow-md text-xs sm:text-sm">
                  <Link href={`/hackathons/${hackathon.slug}/live`}>
                    <Radio className="h-4 w-4 animate-pulse" />
                    Enter Live Hack Portal
                  </Link>
                </Button>
              ) : isRegistered ? (
                <Button asChild size="lg" className="gap-2 font-bold text-xs sm:text-sm">
                  <Link href="/dashboard">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    View Registration & Squad
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="gap-2 font-bold shadow-md text-xs sm:text-sm">
                  <Link href={`/hackathons/${hackathon.slug}/register`}>
                    Register Squad Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Details & Tabs */}
      <div className="container px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {isRegistered && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                    You are registered for {hackathon.title}!
                  </h4>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    {userRegistration.team ? (
                      <>
                        Squad: <strong>{userRegistration.team.name}</strong> &bull; Join Code:{" "}
                        <code className="bg-emerald-200 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded font-mono font-bold">
                          {userRegistration.team.joinCode}
                        </code>
                      </>
                    ) : (
                      "Registered solo. Join or assemble a squad anytime before hacking commences."
                    )}
                  </p>
                </div>
              </div>
            )}

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted/60">
                <TabsTrigger value="overview" className="text-xs font-semibold">Overview</TabsTrigger>
                <TabsTrigger value="tracks" className="text-xs font-semibold">Tracks & Bounties</TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs font-semibold">Schedule Milestones</TabsTrigger>
                <TabsTrigger value="prizes" className="text-xs font-semibold">Prizes & FAQs</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card className="border bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-foreground">About Pravara InnovateX</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {hackathon.description}
                  </CardContent>
                </Card>

                {isOpenToAll && (
                  <Card className="border border-purple-500/20 bg-purple-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Bed className="h-4 w-4 text-purple-600" />
                        Hostel Lodging for Outside College Participants
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground leading-relaxed">
                      Pravara Rural Engineering College provides complimentary hostel accommodation and all meals on campus for registered outside student squads traveling to Loni. Just tick &lsquo;Request Accommodation&rsquo; during registration.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tracks Tab */}
              <TabsContent value="tracks" className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Array.isArray(hackathon.tracks) ? hackathon.tracks : []).map((track: any, idx: number) => (
                    <Card key={idx} className="border bg-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-bold text-foreground">
                            {track.name || track.title}
                          </CardTitle>
                          <Sparkles className="h-4 w-4 text-amber-500" />
                        </div>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground space-y-2.5">
                        <p className="leading-relaxed">{track.description}</p>
                        {track.prize && (
                          <div className="rounded-md badge-pastel-amber px-2.5 py-1 font-bold text-[11px] inline-block">
                            Track Bounty: {track.prize}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Schedule Milestones Tab */}
              <TabsContent value="schedule" className="mt-6 space-y-4">
                <Card className="border bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Hackathon Timeline & Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative border-l-2 border-primary/30 pl-4 space-y-6 text-xs">
                      {(Array.isArray(hackathon.scheduleMilestones) && hackathon.scheduleMilestones.length > 0
                        ? hackathon.scheduleMilestones
                        : [
                            { day: "Day 1", time: "08:30 AM", title: "Reporting & Kit Distribution", description: "Verification at PREC Central Lobby" },
                            { day: "Day 1", time: "10:00 AM", title: "Inaugural Ceremony", description: "Problem statements release by PRES dignitaries" },
                            { day: "Day 1", time: "11:00 AM", title: "Hacking Sprint Begins", description: "24/7 access to labs, high-speed Wi-Fi & power" },
                            { day: "Day 2", time: "11:00 AM", title: "Submissions Hard Deadline", description: "Final code freeze and jury evaluations" },
                          ]
                      ).map((m: any, idx: number) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{m.day || "Day 1"} &bull; {m.time}</span>
                            <span className="font-bold text-foreground">{m.title}</span>
                          </div>
                          <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prizes & FAQs */}
              <TabsContent value="prizes" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Array.isArray(hackathon.prizes) ? hackathon.prizes : []).map((prize: any, idx: number) => (
                    <Card key={idx} className="border bg-card p-4 text-center space-y-1">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md badge-pastel-amber mb-1">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{prize.title}</h4>
                      <p className="text-xl font-black text-primary">{prize.amount}</p>
                      <p className="text-[11px] text-muted-foreground">{prize.perks}</p>
                    </Card>
                  ))}
                </div>

                <Card className="border bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Competition Regulations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hackathon.rules ||
                      "1. Open to enrolled engineering students with valid ID cards.\n2. Squads of 2 to 4 members. Inter-college squads allowed.\n3. All code must be authored during the competition."}
                  </CardContent>
                </Card>

                <Card className="border bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Accordion type="single" collapsible className="w-full">
                      {(Array.isArray(hackathon.faqs) && hackathon.faqs.length > 0
                        ? hackathon.faqs
                        : [
                            {
                              q: "Who is eligible to participate?",
                              a: isOpenToAll
                                ? "Open to enrolled undergraduate and postgraduate students from PREC Loni as well as all recognized engineering colleges across India."
                                : "Reserved exclusively for currently enrolled students of Pravara Rural Engineering College (PREC), Loni.",
                            },
                            {
                              q: "Can students from different colleges team up?",
                              a: hackathon.allowInterCollegeTeams
                                ? "Yes! Inter-college squads are welcomed and encouraged."
                                : "Squads must be composed of students from the same institution.",
                            },
                            {
                              q: "Is hostel lodging provided for outside participants?",
                              a: "Yes. PREC provides complimentary hostel stay on campus for verified teams arriving from outside Loni.",
                            },
                            {
                              q: "What hardware or Wi-Fi is available on campus?",
                              a: "Participants have 24/7 access to the Central Computing Facility (CCF), high-speed 1 Gbps campus Wi-Fi, and lab hardware stations.",
                            },
                          ]
                      ).map((faq: any, idx: number) => (
                        <AccordionItem key={idx} value={`faq-${idx}`}>
                          <AccordionTrigger className="text-xs font-semibold text-foreground text-left">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border bg-card shadow-xs">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold">Event Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <Globe2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Audience</p>
                    <p className="text-muted-foreground text-[11px]">
                      {isOpenToAll ? "Open to Outside & PREC Students" : "PREC Loni Internal Only"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Hacking Window</p>
                    <p className="text-muted-foreground text-[11px]">
                      {formatDate(hackathon.hackingStart)} &ndash; {formatDate(hackathon.hackingEnd)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Venue</p>
                    <p className="text-muted-foreground text-[11px]">{hackathon.venue || "PREC Campus, Loni"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Squad Requirements</p>
                    <p className="text-muted-foreground text-[11px]">
                      {hackathon.minTeamSize} to {hackathon.maxTeamSize} Members per team
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  {isRegistered ? (
                    <Button asChild className="w-full text-xs font-bold" variant="outline" size="sm">
                      <Link href="/dashboard">View My Squad Dashboard</Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full text-xs font-bold shadow-sm" size="sm">
                      <Link href={`/hackathons/${hackathon.slug}/register`}>Register Squad</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
