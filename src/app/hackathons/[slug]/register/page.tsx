"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { registerForHackathon } from "@/app/actions/hackathon";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  UserCheck,
  Building2,
  Bed,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface PageProps {
  params: { slug: string };
}

export default function RegisterHackathonPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [registrationType, setRegistrationType] = useState<"CREATE_TEAM" | "JOIN_TEAM" | "SOLO">("CREATE_TEAM");
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [trackPreference, setTrackPreference] = useState("Smart Agriculture & Rural AI");
  const [needsAccommodation, setNeedsAccommodation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "loading") {
    return (
      <div className="container py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-md border-4 border-primary border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container max-w-lg py-20 px-4">
        <Card className="text-center p-6 border-dashed bg-card">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary mb-2">
              <GraduationCap className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg">Sign In to Register</CardTitle>
            <CardDescription className="text-xs">
              You need an account to participate in this hackathon. Both PREC Loni students and outside university students are welcome.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full text-xs font-bold">
              <Link href={`/login?callbackUrl=/hackathons/${params.slug}/register`}>
                Sign In to Continue
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full text-xs font-semibold">
              <Link href="/register">Create New Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExternal = session.user.studentType === "EXTERNAL";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await registerForHackathon({
        slug: params.slug,
        registrationType,
        teamName,
        joinCode,
        trackPreference,
        needsAccommodation,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Successfully registered for the hackathon!");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-12 px-4 sm:px-8 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Pravara Rural Engineering College
          </span>
          <span className="text-muted-foreground">&bull;</span>
          <span className="text-xs text-muted-foreground">Hackathon Entry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Squad Registration
        </h1>
        <p className="text-xs text-muted-foreground">
          Registering as <strong className="text-foreground">{session.user.name}</strong> (
          {session.user.collegeName})
        </p>
      </div>

      {/* User Affiliation Badge Card */}
      <div className="flex items-center justify-between p-3.5 rounded-lg border bg-card shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-foreground">{session.user.collegeName}</p>
            <p className="text-[10px] text-muted-foreground">
              {isExternal ? "Outside University Student" : "PREC Loni Internal Student"} &bull;{" "}
              {session.user.department || "Engineering"}
            </p>
          </div>
        </div>
        <span
          className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
            isExternal ? "badge-pastel-purple" : "badge-pastel-emerald"
          }`}
        >
          {isExternal ? "Outside Participant" : "Internal"}
        </span>
      </div>

      <Card className="border shadow-sm bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Participation Format</CardTitle>
          <Tabs
            value={registrationType}
            onValueChange={(val: any) => setRegistrationType(val)}
            className="w-full pt-1"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="CREATE_TEAM" className="text-xs gap-1.5 font-semibold">
                <UserPlus className="h-3.5 w-3.5" />
                Create Squad
              </TabsTrigger>
              <TabsTrigger value="JOIN_TEAM" className="text-xs gap-1.5 font-semibold">
                <Users className="h-3.5 w-3.5" />
                Join via Code
              </TabsTrigger>
              <TabsTrigger value="SOLO" className="text-xs gap-1.5 font-semibold">
                <UserCheck className="h-3.5 w-3.5" />
                Solo Hacker
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {registrationType === "CREATE_TEAM" && (
              <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="teamName" className="text-xs font-semibold">Squad / Team Name *</Label>
                  <Input
                    id="teamName"
                    placeholder="e.g. PravaraPioneers, AgriBots"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    A unique 6-character Join Code will be generated for your squad members to join.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="track" className="text-xs font-semibold">Target Track / Problem Statement</Label>
                  <Select value={trackPreference} onValueChange={setTrackPreference} disabled={isSubmitting}>
                    <SelectTrigger id="track" className="text-xs">
                      <SelectValue placeholder="Select target track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Smart Agriculture & Rural AI">Smart Agriculture & Rural AI</SelectItem>
                      <SelectItem value="Healthcare & Assistive Technology">Healthcare & Assistive Technology</SelectItem>
                      <SelectItem value="Clean Energy, Water & Sustainability">Clean Energy & Sustainability</SelectItem>
                      <SelectItem value="Open Student Innovation & Web3">Open Student Innovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {registrationType === "JOIN_TEAM" && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
                <Label htmlFor="joinCode" className="text-xs font-semibold">6-Digit Squad Join Code *</Label>
                <Input
                  id="joinCode"
                  placeholder="e.g. PREC26"
                  className="font-mono uppercase tracking-widest text-sm font-bold"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-[10px] text-muted-foreground">
                  Ask your squad leader for their 6-character code (can be a mix of Pravara & outside students).
                </p>
              </div>
            )}

            {registrationType === "SOLO" && (
              <Alert variant="warning">
                <AlertTitle className="text-xs font-bold">Solo Registration</AlertTitle>
                <AlertDescription>
                  You will be registered solo. You can assemble or join a squad at any point before the hackathon begins.
                </AlertDescription>
              </Alert>
            )}

            {/* Outside Student Accommodation Option */}
            {isExternal && (
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3.5 space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hostel-toggle"
                    checked={needsAccommodation}
                    onCheckedChange={(checked) => setNeedsAccommodation(Boolean(checked))}
                    disabled={isSubmitting}
                    className="mt-0.5 border-purple-600 data-[state=checked]:bg-purple-600"
                  />
                  <div className="text-xs space-y-0.5">
                    <Label htmlFor="hostel-toggle" className="font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                      <Bed className="h-3.5 w-3.5 text-purple-600" />
                      Request On-Campus Hostel Accommodation (Complimentary)
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Since you are visiting from outside Loni, PREC provides free lodging in our student hostels during the hackathon period.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full gap-2 font-bold text-xs mt-3 shadow-sm" disabled={isSubmitting}>
              {isSubmitting ? "Confirming..." : "Confirm Hackathon Entry"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
