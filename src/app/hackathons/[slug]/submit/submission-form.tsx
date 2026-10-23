"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitProject } from "@/app/actions/hackathon";
import { toast } from "sonner";
import { ArrowRight, Github, Globe, Video, FileText } from "lucide-react";

interface FormProps {
  hackathonId: string;
  teamId: string;
  slug: string;
  initialData?: any;
  tracks: any[];
}

export function ProjectSubmissionForm({
  hackathonId,
  teamId,
  slug,
  initialData,
  tracks,
}: FormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [track, setTrack] = useState(initialData?.track || tracks[0]?.name || "Smart Agriculture & Rural AI");
  const [demoUrl, setDemoUrl] = useState(initialData?.demoUrl || "");
  const [repoUrl, setRepoUrl] = useState(initialData?.repoUrl || "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [deckUrl, setDeckUrl] = useState(initialData?.deckUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await submitProject({
        hackathonId,
        teamId,
        title,
        tagline,
        description,
        track,
        demoUrl,
        repoUrl,
        videoUrl,
        deckUrl,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Project submitted successfully!");
        router.push(`/dashboard`);
      }
    } catch {
      toast.error("Failed to submit project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="e.g. EcoRoute AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Short Tagline / Pitch *</Label>
            <Input
              id="tagline"
              placeholder="e.g. Smart zero-emissions navigation for campus shuttles"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="track">Target Track / Category</Label>
            <Select value={track} onValueChange={setTrack} disabled={isSubmitting}>
              <SelectTrigger id="track">
                <SelectValue placeholder="Select target track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.length > 0 ? (
                  tracks.map((t: any, idx: number) => {
                    const name = t.name || t.title;
                    return (
                      <SelectItem key={idx} value={name}>
                        {name}
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem value="Smart Agriculture & Rural AI">
                    Smart Agriculture & Rural AI
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description & What We Built *</Label>
            <Textarea
              id="description"
              rows={6}
              placeholder="Explain the problem you solved, how you built it, technologies used, challenges overcome, and future plans..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="repo" className="flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" />
                GitHub Repository URL
              </Label>
              <Input
                id="repo"
                type="url"
                placeholder="https://github.com/..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Live Demo / Deployment URL
              </Label>
              <Input
                id="demo"
                type="url"
                placeholder="https://my-project.vercel.app"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video" className="flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" />
                Video Demo / Loom URL
              </Label>
              <Input
                id="video"
                type="url"
                placeholder="https://youtube.com/watch?v=... or Loom"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deck" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Pitch Deck / Slides URL
              </Label>
              <Input
                id="deck"
                type="url"
                placeholder="https://canva.com/... or Google Slides"
                value={deckUrl}
                onChange={(e) => setDeckUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2 font-bold shadow-sm" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : initialData ? "Update Project Submission" : "Submit Final Project"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
