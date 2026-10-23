import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, ExternalLink, Github, Globe, Video, FileText } from "lucide-react";
import { JudgeRubricForm } from "./rubric-form";

interface PageProps {
  params: { slug: string };
}

export default async function JudgePortalPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/hackathons/${params.slug}/judge`);
  }

  let hackathon: any = null;

  try {
    hackathon = await db.hackathon.findUnique({
      where: { slug: params.slug },
      include: {
        submissions: {
          include: {
            team: true,
            scores: {
              where: { judgeId: session.user.id },
            },
          },
        },
      },
    });
  } catch (err) {
    console.warn("DB lookup error:", err);
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-10 px-4 sm:px-8 space-y-8">
      <div className="border-b pb-6 space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="success" className="uppercase text-[10px] font-bold">
            Judge Portal
          </Badge>
          <span className="text-xs text-muted-foreground">{hackathon.title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Project Evaluations & Scoring</h1>
        <p className="text-xs text-muted-foreground">
          Evaluating as <strong>{session.user.name}</strong>. Score each prototype across Innovation, Technical Depth, Design, and Presentation.
        </p>
      </div>

      <div className="space-y-6">
        {hackathon.submissions.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-sm text-muted-foreground">No submissions have been filed yet for this hackathon.</p>
          </Card>
        ) : (
          hackathon.submissions.map((sub: any) => {
            const myScore = sub.scores?.[0];
            const criteria = myScore?.criteriaScores || {};

            return (
              <Card key={sub.id} className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold">{sub.title}</CardTitle>
                        <Badge variant="secondary" className="text-[10px]">{sub.track || "General"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub.tagline}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Squad:</span>{" "}
                      <strong className="text-xs text-foreground">{sub.team?.name}</strong>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-5">
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-card p-3 rounded-lg border">
                    {sub.description}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {sub.repoUrl && (
                      <a href={sub.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                        <Github className="h-4 w-4" /> Code Repository
                      </a>
                    )}
                    {sub.demoUrl && (
                      <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                        <Globe className="h-4 w-4" /> Live Web App
                      </a>
                    )}
                    {sub.videoUrl && (
                      <a href={sub.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                        <Video className="h-4 w-4" /> Demo Video
                      </a>
                    )}
                    {sub.deckUrl && (
                      <a href={sub.deckUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                        <FileText className="h-4 w-4" /> Pitch Deck
                      </a>
                    )}
                  </div>

                  {/* Rubric Evaluation Form */}
                  <div className="border-t pt-4">
                    <JudgeRubricForm
                      submissionId={sub.id}
                      initialScores={{
                        innovation: criteria.innovation || 8,
                        technicalDepth: criteria.technicalDepth || 8,
                        design: criteria.design || 8,
                        pitch: criteria.pitch || 8,
                        feedback: myScore?.feedback || "",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
