"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { submitJudgeScore } from "@/app/actions/judge";
import { toast } from "sonner";
import { Award, Check } from "lucide-react";

interface RubricProps {
  submissionId: string;
  initialScores: {
    innovation: number;
    technicalDepth: number;
    design: number;
    pitch: number;
    feedback?: string;
  };
}

export function JudgeRubricForm({ submissionId, initialScores }: RubricProps) {
  const [innovation, setInnovation] = useState(initialScores.innovation);
  const [technicalDepth, setTechnicalDepth] = useState(initialScores.technicalDepth);
  const [design, setDesign] = useState(initialScores.design);
  const [pitch, setPitch] = useState(initialScores.pitch);
  const [feedback, setFeedback] = useState(initialScores.feedback || "");
  const [isPending, setIsPending] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);

  const average = ((innovation + technicalDepth + design + pitch) / 4).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const res = await submitJudgeScore({
        submissionId,
        innovation: Number(innovation),
        technicalDepth: Number(technicalDepth),
        design: Number(design),
        pitch: Number(pitch),
        feedback,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        setSavedScore(res.totalScore ?? null);
        toast.success(`Score of ${res.totalScore}/10 recorded!`);
      }
    } catch {
      toast.error("Failed to record score.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-muted/20 p-4 border">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Award className="h-4 w-4 text-primary" />
            Scoring Rubric (1 &ndash; 10)
          </h4>
          <div className="text-sm font-bold text-foreground">
            Average: <span className="text-primary text-base">{average}</span> / 10
          </div>
        </div>
        <Progress value={Number(average) * 10} className="h-1.5" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <Label className="text-[11px]">Innovation</Label>
            <span className="font-bold text-foreground">{innovation}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={innovation}
            onChange={(e) => setInnovation(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <Label className="text-[11px]">Tech Depth</Label>
            <span className="font-bold text-foreground">{technicalDepth}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={technicalDepth}
            onChange={(e) => setTechnicalDepth(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <Label className="text-[11px]">UI & Design</Label>
            <span className="font-bold text-foreground">{design}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={design}
            onChange={(e) => setDesign(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <Label className="text-[11px]">Presentation</Label>
            <span className="font-bold text-foreground">{pitch}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="feedback" className="text-[11px]">Private Feedback & Observations</Label>
        <Textarea
          id="feedback"
          rows={2}
          placeholder="Constructive notes for organizers and participants..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="text-xs"
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        {savedScore !== null && (
          <Badge variant="success" className="gap-1 text-xs">
            <Check className="h-3.5 w-3.5" /> Saved Score: {savedScore}/10
          </Badge>
        )}
        <div className="ml-auto">
          <Button type="submit" size="sm" className="font-semibold text-xs" disabled={isPending}>
            {isPending ? "Recording..." : "Save Score"}
          </Button>
        </div>
      </div>
    </form>
  );
}
