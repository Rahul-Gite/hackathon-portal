"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { createHackathon } from "@/app/actions/organizer";
import { toast } from "sonner";
import { LocationType, HackathonAudience } from "@prisma/client";
import {
  Plus,
  Trash2,
  ArrowRight,
  Calendar,
  Layers,
  Trophy,
  Clock,
  Globe2,
  Lock,
  Palette,
  HelpCircle,
  Building2,
  Wifi,
  Sparkles,
} from "lucide-react";

interface FormProps {
  committees: Array<{ id: string; name: string; department: string; role: string }>;
  initialCommitteeId: string;
}

export function CreateHackathonForm({ committees, initialCommitteeId }: FormProps) {
  const router = useRouter();

  const [committeeId, setCommitteeId] = useState(initialCommitteeId);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
  );
  const [logoUrl, setLogoUrl] = useState("");
  const [department, setDepartment] = useState(committees[0]?.department || "Computer Engineering");
  const [audience, setAudience] = useState<HackathonAudience>(HackathonAudience.ALL_COLLEGES);
  const [themeColor, setThemeColor] = useState("sapphire");
  const [heroLayout, setHeroLayout] = useState("standard");
  const [locationType, setLocationType] = useState<LocationType>(LocationType.IN_PERSON);
  const [venue, setVenue] = useState("Central Computing Facility & Auditorium, PREC Campus, Loni");

  // Squad & Verification Toggles
  const [allowSolo, setAllowSolo] = useState(true);
  const [allowInterCollegeTeams, setAllowInterCollegeTeams] = useState(true);
  const [requireCollegeId, setRequireCollegeId] = useState(true);
  const [requireGithub, setRequireGithub] = useState(true);
  const [discordUrl, setDiscordUrl] = useState("https://discord.gg/pravarahack");
  const [wifiDetails, setWifiDetails] = useState("SSID: PREC-HACK-GUEST / Pass: pravara2026 (1 Gbps)");

  // Dates
  const [regStart, setRegStart] = useState(new Date().toISOString().slice(0, 16));
  const [regEnd, setRegEnd] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16));
  const [hackStart, setHackStart] = useState(new Date(Date.now() + 16 * 86400000).toISOString().slice(0, 16));
  const [hackEnd, setHackEnd] = useState(new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 16));

  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(4);

  // Dynamic Tracks
  const [tracks, setTracks] = useState([
    {
      id: "track-1",
      name: "Smart Agriculture & Rural AI",
      description: "Drone imagery, localized crop pathology, and IoT sensor automation.",
      sponsor: "Pravara Agricultural Research Cell",
      prize: "₹25,000",
      mentor: "Dr. V. R. Patil",
    },
    {
      id: "track-2",
      name: "Healthcare & Assistive Technology",
      description: "Rural clinic diagnostics and emergency coordination systems.",
      sponsor: "Pravara Medical Trust",
      prize: "₹20,000",
      mentor: "Prof. S. M. Rokade",
    },
  ]);

  // Dynamic Prizes
  const [prizes, setPrizes] = useState([
    { title: "Grand Champion (PREC Trophy)", amount: "₹35,000", perks: "Winner Trophy + PRES Incubation Seed Fund", rank: 1 },
    { title: "1st Runner Up", amount: "₹20,000", perks: "Trophy + Direct Technical Mentorship Referrals", rank: 2 },
  ]);

  // Dynamic Milestones
  const [scheduleMilestones, setScheduleMilestones] = useState([
    { day: "Day 1", time: "08:30 AM", title: "Reporting & Verification", description: "Identity verification at PREC Central Lobby", phase: "Check-in" },
    { day: "Day 1", time: "10:00 AM", title: "Inaugural Ceremony", description: "Problem statements release by PRES dignitaries", phase: "Inauguration" },
    { day: "Day 1", time: "11:00 AM", title: "Hacking Sprint Begins", description: "24/7 access to labs, high-speed Wi-Fi & power", phase: "Coding" },
    { day: "Day 2", time: "11:00 AM", title: "Submissions Hard Deadline", description: "Final code freeze and jury evaluations", phase: "Jury" },
  ]);

  // Dynamic Custom Questions
  const [customQuestions, setCustomQuestions] = useState([
    { id: "q1", label: "GitHub Profile URL", type: "text", required: true },
    { id: "q2", label: "Project Idea Synopsis / Problem Chosen", type: "textarea", required: true },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const addTrack = () => {
    setTracks([
      ...tracks,
      { id: `track-${Date.now()}`, name: "", description: "", sponsor: "", prize: "", mentor: "" },
    ]);
  };

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const addPrize = () => {
    setPrizes([...prizes, { title: "", amount: "", perks: "", rank: prizes.length + 1 }]);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    setScheduleMilestones([
      ...scheduleMilestones,
      { day: "Day 1", time: "12:00 PM", title: "", description: "", phase: "Milestone" },
    ]);
  };

  const removeMilestone = (index: number) => {
    setScheduleMilestones(scheduleMilestones.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      { id: `q-${Date.now()}`, label: "", type: "text", required: false },
    ]);
  };

  const removeQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!committeeId) {
      toast.error("Please select a hosting committee.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createHackathon({
        committeeId,
        title,
        slug,
        tagline,
        description,
        bannerUrl,
        logoUrl,
        department,
        audience,
        themeColor,
        heroLayout,
        locationType,
        venue,
        allowSolo,
        allowInterCollegeTeams,
        requireCollegeId,
        requireGithub,
        discordUrl,
        wifiDetails,
        registrationStart: regStart,
        registrationEnd: regEnd,
        hackingStart: hackStart,
        hackingEnd: hackEnd,
        minTeamSize,
        maxTeamSize,
        tracks,
        prizes,
        scheduleMilestones,
        customQuestions,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Department Hackathon launched successfully!");
        router.push("/organizer/dashboard");
      }
    } catch {
      toast.error("Failed to create hackathon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Host Committee & Identity */}
      <Card className="border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            1. Hosting Committee & Core Identity
          </CardTitle>
          <CardDescription className="text-xs">
            Select which of your democratic committees is hosting this event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="committee" className="text-xs font-semibold">Hosting Committee *</Label>
              <Select
                value={committeeId}
                onValueChange={(val) => {
                  setCommitteeId(val);
                  const selected = committees.find((c) => c.id === val);
                  if (selected) setDepartment(selected.department);
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="committee" className="text-xs font-bold">
                  <SelectValue placeholder="Select hosting committee" />
                </SelectTrigger>
                <SelectContent>
                  {committees.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-xs font-semibold">Engineering Department</Label>
              <Select
                value={department}
                onValueChange={setDepartment}
                disabled={isSubmitting}
              >
                <SelectTrigger id="department" className="text-xs">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Engineering">Computer Engineering (CESA)</SelectItem>
                  <SelectItem value="Information Technology">Information Technology (ITSA)</SelectItem>
                  <SelectItem value="AI & Data Science">AI & Data Science</SelectItem>
                  <SelectItem value="Automation & Robotics">Automation & Robotics</SelectItem>
                  <SelectItem value="Electronics & Telecommunication">E & TC</SelectItem>
                  <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                  <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                  <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                  <SelectItem value="Inter-Departmental">Inter-Departmental (PRES Central)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">Hackathon Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Pravara InnovateX 2026 / State-Level Engineering Sprint"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              disabled={isSubmitting}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-xs font-semibold">URL Identifier Slug *</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">/hackathons/</span>
              <Input
                id="slug"
                placeholder="innovatex-2026"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="text-xs font-semibold">Elevator Pitch / Tagline *</Label>
            <Input
              id="tagline"
              placeholder="e.g. 36-Hour collegiate sprint on rural AI, drone tech, and clean energy"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              required
              disabled={isSubmitting}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">Full Overview Description *</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Explain the background, challenge themes, lab facilities, and who should join..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="banner" className="text-xs font-semibold">Banner Image URL</Label>
              <Input
                id="banner"
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                disabled={isSubmitting}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logo" className="text-xs font-semibold">Event Logo / Insignia URL</Label>
              <Input
                id="logo"
                type="url"
                placeholder="https://..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={isSubmitting}
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Visual Palette & Audience Scope */}
      <Card className="border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            2. Audience Scope & Visual Palette
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Audience Eligibility</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  className={`p-3 rounded-md border text-left flex flex-col gap-1 transition-all ${
                    audience === HackathonAudience.ALL_COLLEGES
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                      : "border-input bg-background text-muted-foreground"
                  }`}
                  onClick={() => setAudience(HackathonAudience.ALL_COLLEGES)}
                >
                  <span className="flex items-center gap-1 font-bold text-xs">
                    <Globe2 className="h-3.5 w-3.5" /> All Colleges
                  </span>
                  <span className="text-[10px] font-normal leading-tight">
                    Outside universities & PREC Loni students
                  </span>
                </button>

                <button
                  type="button"
                  className={`p-3 rounded-md border text-left flex flex-col gap-1 transition-all ${
                    audience === HackathonAudience.INTERNAL_ONLY
                      ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold shadow-2xs"
                      : "border-input bg-background text-muted-foreground"
                  }`}
                  onClick={() => setAudience(HackathonAudience.INTERNAL_ONLY)}
                >
                  <span className="flex items-center gap-1 font-bold text-xs">
                    <Lock className="h-3.5 w-3.5" /> PREC Only
                  </span>
                  <span className="text-[10px] font-normal leading-tight">
                    Restricted strictly to PREC Loni students
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="themeColor" className="text-xs font-semibold">Pastel Theme Accent</Label>
              <Select value={themeColor} onValueChange={setThemeColor} disabled={isSubmitting}>
                <SelectTrigger id="themeColor" className="text-xs font-bold">
                  <SelectValue placeholder="Select theme color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sapphire">Academic Sapphire Blue (Official Pravara)</SelectItem>
                  <SelectItem value="amber">Golden Saffron Amber (Pravara Trust)</SelectItem>
                  <SelectItem value="emerald">Rural Emerald Mint</SelectItem>
                  <SelectItem value="lavender">Tech Lavender</SelectItem>
                  <SelectItem value="coral">Soft Coral Crimson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Squad Rules & Verification Toggles */}
          <div className="pt-2 border-t space-y-2">
            <Label className="text-xs font-semibold">Participant & Squad Governance</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/20">
                <Label htmlFor="allowSolo" className="font-semibold text-[11px] cursor-pointer">Allow Solo Entry</Label>
                <Switch
                  id="allowSolo"
                  checked={allowSolo}
                  onCheckedChange={setAllowSolo}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/20">
                <Label htmlFor="allowInterCollege" className="font-semibold text-[11px] cursor-pointer">Inter-College Teams</Label>
                <Switch
                  id="allowInterCollege"
                  checked={allowInterCollegeTeams}
                  onCheckedChange={setAllowInterCollegeTeams}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/20">
                <Label htmlFor="requireCollegeId" className="font-semibold text-[11px] cursor-pointer">Require College ID</Label>
                <Switch
                  id="requireCollegeId"
                  checked={requireCollegeId}
                  onCheckedChange={setRequireCollegeId}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/20">
                <Label htmlFor="requireGithub" className="font-semibold text-[11px] cursor-pointer">Require GitHub URL</Label>
                <Switch
                  id="requireGithub"
                  checked={requireGithub}
                  onCheckedChange={setRequireGithub}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Dates & Logistics */}
      <Card className="border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            3. Timeline & Venue Logistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="venue" className="text-xs font-semibold">Campus Venue</Label>
              <Input
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                disabled={isSubmitting}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="locationType" className="text-xs font-semibold">Event Format</Label>
              <Select
                value={locationType}
                onValueChange={(val) => setLocationType(val as LocationType)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="locationType" className="text-xs">
                  <SelectValue placeholder="Select event format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LocationType.IN_PERSON}>In-Person on PREC Campus</SelectItem>
                  <SelectItem value={LocationType.ONLINE}>Virtual / Discord Sprint</SelectItem>
                  <SelectItem value={LocationType.HYBRID}>Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="regEnd" className="text-xs font-semibold">Registration Closes</Label>
              <Input
                id="regEnd"
                type="datetime-local"
                value={regEnd}
                onChange={(e) => setRegEnd(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hackStart" className="text-xs font-semibold">Hacking Begins</Label>
              <Input
                id="hackStart"
                type="datetime-local"
                value={hackStart}
                onChange={(e) => setHackStart(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="hackEnd" className="text-xs font-semibold">Submissions Hard Deadline</Label>
              <Input
                id="hackEnd"
                type="datetime-local"
                value={hackEnd}
                onChange={(e) => setHackEnd(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="minTeam" className="text-xs font-semibold">Min Squad</Label>
                <Input
                  id="minTeam"
                  type="number"
                  min={1}
                  max={4}
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxTeam" className="text-xs font-semibold">Max Squad</Label>
                <Input
                  id="maxTeam"
                  type="number"
                  min={1}
                  max={6}
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Schedule Milestones Builder */}
      <Card className="border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              4. Custom Schedule Milestones ({scheduleMilestones.length})
            </CardTitle>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="text-xs gap-1 font-bold">
            <Plus className="h-3.5 w-3.5" /> Add Milestone
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {scheduleMilestones.map((m, idx) => (
            <div key={idx} className="rounded-md border bg-muted/20 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground text-[10px]">Milestone #{idx + 1}</span>
                {scheduleMilestones.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => removeMilestone(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Day 1"
                  value={m.day}
                  onChange={(e) => {
                    const updated = [...scheduleMilestones];
                    updated[idx].day = e.target.value;
                    setScheduleMilestones(updated);
                  }}
                  className="text-xs"
                />
                <Input
                  placeholder="08:30 AM"
                  value={m.time}
                  onChange={(e) => {
                    const updated = [...scheduleMilestones];
                    updated[idx].time = e.target.value;
                    setScheduleMilestones(updated);
                  }}
                  className="text-xs"
                />
                <Input
                  placeholder="Milestone Title"
                  value={m.title}
                  onChange={(e) => {
                    const updated = [...scheduleMilestones];
                    updated[idx].title = e.target.value;
                    setScheduleMilestones(updated);
                  }}
                  className="text-xs font-bold"
                />
              </div>
              <Input
                placeholder="Description / Details"
                value={m.description}
                onChange={(e) => {
                  const updated = [...scheduleMilestones];
                  updated[idx].description = e.target.value;
                  setScheduleMilestones(updated);
                }}
                className="text-xs"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 5. Tracks & Bounties Builder */}
      <Card className="border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              5. Custom Tracks & Sponsoring Partners ({tracks.length})
            </CardTitle>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addTrack} className="text-xs gap-1 font-bold">
            <Plus className="h-3.5 w-3.5" /> Add Track
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {tracks.map((t, idx) => (
            <div key={idx} className="rounded-md border bg-muted/20 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground text-[10px]">Track #{idx + 1}</span>
                {tracks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => removeTrack(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  placeholder="Track Title"
                  value={t.name}
                  onChange={(e) => {
                    const updated = [...tracks];
                    updated[idx].name = e.target.value;
                    setTracks(updated);
                  }}
                  className="text-xs font-bold"
                  required
                />
                <Input
                  placeholder="Sponsoring Organization"
                  value={t.sponsor}
                  onChange={(e) => {
                    const updated = [...tracks];
                    updated[idx].sponsor = e.target.value;
                    setTracks(updated);
                  }}
                  className="text-xs"
                />
                <Input
                  placeholder="Track Prize / Bounty (e.g. ₹25,000)"
                  value={t.prize}
                  onChange={(e) => {
                    const updated = [...tracks];
                    updated[idx].prize = e.target.value;
                    setTracks(updated);
                  }}
                  className="text-xs"
                />
              </div>
              <Input
                placeholder="Problem statement description / criteria"
                value={t.description}
                onChange={(e) => {
                  const updated = [...tracks];
                  updated[idx].description = e.target.value;
                  setTracks(updated);
                }}
                className="text-xs"
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 6. Custom Registration Questions */}
      <Card className="border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              6. Custom Registration Questions ({customQuestions.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Collect specific participant or project information at sign-up
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="text-xs gap-1 font-bold">
            <Plus className="h-3.5 w-3.5" /> Add Question
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {customQuestions.map((q, idx) => (
            <div key={idx} className="rounded-md border bg-muted/20 p-3 flex items-center gap-2 text-xs">
              <Input
                placeholder="Question Label (e.g. GitHub URL / Prior Experience)"
                value={q.label}
                onChange={(e) => {
                  const updated = [...customQuestions];
                  updated[idx].label = e.target.value;
                  setCustomQuestions(updated);
                }}
                className="text-xs"
                required
              />
              <div className="w-36 shrink-0">
                <Select
                  value={q.type}
                  onValueChange={(val) => {
                    const updated = [...customQuestions];
                    updated[idx].type = val;
                    setCustomQuestions(updated);
                  }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Short Text</SelectItem>
                    <SelectItem value="textarea">Paragraph</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap pl-1">
                <Checkbox
                  id={`q-req-${idx}`}
                  checked={q.required}
                  onCheckedChange={(checked) => {
                    const updated = [...customQuestions];
                    updated[idx].required = Boolean(checked);
                    setCustomQuestions(updated);
                  }}
                />
                <Label htmlFor={`q-req-${idx}`} className="text-xs cursor-pointer select-none">
                  Required
                </Label>
              </div>
              {customQuestions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive shrink-0"
                  onClick={() => removeQuestion(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full gap-2 font-bold shadow-md text-xs sm:text-sm" disabled={isSubmitting}>
        {isSubmitting ? "Publishing Hackathon..." : "Launch & Open Hackathon"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
