"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { postAnnouncement } from "@/app/actions/hackathon";
import { AnnouncementCategory } from "@prisma/client";
import { toast } from "sonner";
import { Send, Pin, AlertTriangle, Cpu, Lightbulb, Clock, Megaphone } from "lucide-react";

export function AnnouncementPoster({ hackathonId }: { hackathonId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>(AnnouncementCategory.GENERAL);
  const [isPinned, setIsPinned] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsPending(true);
    try {
      const res = await postAnnouncement(hackathonId, title, content, category, isPinned);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Broadcast published to live portal!");
        setTitle("");
        setContent("");
        setIsPinned(false);
        setCategory(AnnouncementCategory.GENERAL);
      }
    } catch {
      toast.error("Failed to post announcement.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          Broadcast Real-Time Update to Hackers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePost} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="annTitle" className="text-xs font-semibold">Broadcast Headline *</Label>
              <Input
                id="annTitle"
                placeholder="e.g. Wi-Fi Switch 2 Active / CCF Terminal Desks Open / Jury Round 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isPending}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs font-semibold">Priority & Category</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as AnnouncementCategory)}
                disabled={isPending}
              >
                <SelectTrigger id="category" className="text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AnnouncementCategory.GENERAL}>
                    General Announcement
                  </SelectItem>
                  <SelectItem value={AnnouncementCategory.URGENT}>
                    Urgent Alert (Pulsing)
                  </SelectItem>
                  <SelectItem value={AnnouncementCategory.LOGISTICS}>
                    Campus & Lab Logistics
                  </SelectItem>
                  <SelectItem value={AnnouncementCategory.MENTORSHIP}>
                    Mentorship & Jury
                  </SelectItem>
                  <SelectItem value={AnnouncementCategory.SCHEDULE}>
                    Schedule Timeline Shift
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="annContent" className="text-xs font-semibold">Message & Room / Location Details *</Label>
            <Textarea
              id="annContent"
              rows={3}
              placeholder="Provide exact lab room numbers, timeline adjustments, or specific instructions for students..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isPending}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="pin-toggle"
                checked={isPinned}
                onCheckedChange={(checked) => setIsPinned(Boolean(checked))}
                disabled={isPending}
              />
              <Label htmlFor="pin-toggle" className="flex items-center gap-1 font-bold text-xs text-foreground cursor-pointer select-none">
                <Pin className="h-3 w-3 text-primary" /> Pin to top of live portal banner
              </Label>
            </div>

            <Button type="submit" size="sm" className="gap-1.5 font-bold text-xs" disabled={isPending}>
              <Send className="h-3.5 w-3.5" />
              {isPending ? "Broadcasting..." : "Broadcast Update"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
