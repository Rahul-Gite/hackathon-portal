import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Radio,
  Clock,
  ShieldCheck,
  Building2,
  GraduationCap,
  Globe2,
  Lock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getHackathons() {
  try {
    const hackathons = await db.hackathon.findMany({
      where: {
        status: {
          in: ["REGISTRATION_OPEN", "HACKING_LIVE", "PUBLISHED", "COMPLETED"],
        },
      },
      include: {
        committee: true,
        _count: {
          select: { registrations: true, teams: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (hackathons && hackathons.length > 0) {
      return hackathons;
    }
  } catch (e) {
    console.warn("DB query failed in home:", e);
  }
  return [];
}

export default async function HomePage() {
  const hackathons = await getHackathons();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "HACKING_LIVE":
        return (
          <Badge variant="rose" className="gap-1 text-[10px] font-bold uppercase tracking-wider animate-pulse">
            <Radio className="h-3 w-3" />
            Live Sprint
          </Badge>
        );
      case "REGISTRATION_OPEN":
        return (
          <Badge variant="success" className="gap-1 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            Registration Open
          </Badge>
        );
      case "PUBLISHED":
        return (
          <Badge variant="warning" className="gap-1 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            Upcoming
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="blue" className="text-[10px] font-bold uppercase tracking-wider">
            Concluded
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-card to-background py-16 sm:py-20">
        <div className="container relative z-10 px-4 sm:px-8 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-card px-4 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-primary font-bold">Pravara Rural Engineering College, Loni</span>
            <span className="text-muted-foreground">&bull; NAAC &lsquo;A&rsquo; Grade</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            Empowering Campus & <br />
            <span className="text-primary underline decoration-amber-400 decoration-wavy decoration-2">
              State-Level Innovators
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The unified hackathon hub of Pravara Rural Engineering College (PREC), Loni. Hosting departmental hackathons for our campus students as well as flagship state competitions welcoming outside universities.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="h-11 px-8 font-bold shadow-md text-xs sm:text-sm">
              <a href="#explore">
                Explore Hackathons
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 px-8 font-bold text-xs sm:text-sm border-primary/30"
            >
              <a href="#about-campus">Campus Facilities & Accommodations</a>
            </Button>
          </div>

          {/* Institutional Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-8 mt-10 max-w-3xl mx-auto text-left">
            <div className="bg-card p-3 rounded-lg border shadow-xs">
              <p className="text-xl font-bold text-primary">10 Branches</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Engineering Depts</p>
            </div>
            <div className="bg-card p-3 rounded-lg border shadow-xs">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Inter-College</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Outside Students Welcome</p>
            </div>
            <div className="bg-card p-3 rounded-lg border shadow-xs">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">₹75,000+</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">State Hackathon Prizes</p>
            </div>
            <div className="bg-card p-3 rounded-lg border shadow-xs">
              <p className="text-xl font-bold text-foreground">Free Lodging</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">PREC Campus Hostel</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hackathons Feed */}
      <section id="explore" className="py-14 container px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Campus Competitions & State Hackathons
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Filter by eligibility (Open to Outside Universities vs. Internal PREC Students)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href="/dashboard">My Registrations & Squads</Link>
            </Button>
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon: any) => {
            const isLive = hackathon.status === "HACKING_LIVE";
            const prizePool =
              Array.isArray(hackathon.prizes) && hackathon.prizes.length > 0
                ? hackathon.prizes[0]?.amount || "₹35,000"
                : "₹25,000";

            const isOpenToAll = hackathon.audience === "ALL_COLLEGES";

            return (
              <Card
                key={hackathon.id}
                className="group flex flex-col overflow-hidden border bg-card transition-all duration-200 hover:shadow-md hover:border-primary/50"
              >
                {/* Banner Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={
                      hackathon.bannerUrl ||
                      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={hackathon.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">{getStatusBadge(hackathon.status)}</div>
                  <div className="absolute top-3 left-3">
                    {isOpenToAll ? (
                      <Badge variant="purple" className="gap-1 text-[10px] font-bold shadow-xs">
                        <Globe2 className="h-3 w-3" /> Open to All Colleges
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1 text-[10px] font-bold shadow-xs">
                        <Lock className="h-3 w-3" /> PREC Loni Only
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-card/95 px-2.5 py-1 text-xs font-bold text-foreground border shadow-xs">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      {prizePool} Top Prize
                    </span>
                  </div>
                </div>

                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground mb-1">
                    <span className="font-semibold text-primary truncate">
                      {hackathon.department || "Engineering Dept"}
                    </span>
                    <span className="truncate">&bull; {hackathon.committee?.name}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors">
                    <Link href={`/hackathons/${hackathon.slug}`}>{hackathon.title}</Link>
                  </h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground mt-1 leading-relaxed">
                    {hackathon.tagline}
                  </p>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-2 text-xs text-muted-foreground flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Hacking: {formatDate(hackathon.hackingStart)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{hackathon.venue || "PREC Campus, Loni"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Squads: {hackathon.minTeamSize}&ndash;{hackathon.maxTeamSize} Hackers &bull;{" "}
                      {hackathon._count?.registrations || 0} Registered
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t bg-muted/20 flex gap-2">
                  <Button
                    asChild
                    className="w-full text-xs font-bold"
                    variant={isLive ? "destructive" : "default"}
                    size="sm"
                  >
                    <Link href={isLive ? `/hackathons/${hackathon.slug}/live` : `/hackathons/${hackathon.slug}`}>
                      {isLive ? "Enter Live Hack Portal" : "View Details & Register"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pravara Campus & Infrastructure Feature */}
      <section id="about-campus" className="border-t bg-card py-14">
        <div className="container px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Why Participate at Pravara Rural Engineering College?
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              World-class technical infrastructure nestled in a tranquil, eco-friendly campus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-background p-5 space-y-2.5 shadow-xs">
              <div className="h-9 w-9 rounded-lg badge-pastel-blue flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-base text-foreground">Free On-Campus Hostel Stay</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Outside university students traveling to Loni receive complimentary lodging in PREC campus hostels with 24/7 security, power backup, and Wi-Fi.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-5 space-y-2.5 shadow-xs">
              <div className="h-9 w-9 rounded-lg badge-pastel-amber flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-base text-foreground">State-of-the-Art Labs & IoT Center</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Central Computing Facility, Advanced AI Lab, Robotics & Drone Workshop, and high-speed gigabit fiber internet active all night during sprints.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-5 space-y-2.5 shadow-xs">
              <div className="h-9 w-9 rounded-lg badge-pastel-emerald flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-base text-foreground">PRES Incubation & Seed Grants</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Top winning prototypes receive direct incubation support and seed funding through the Pravara Rural Education Society innovation cell.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
