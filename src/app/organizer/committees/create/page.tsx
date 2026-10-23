"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createCommittee } from "@/app/actions/committee";
import { toast } from "sonner";
import { Users, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

export default function CreateCommitteePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [department, setDepartment] = useState("Computer Engineering");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await createCommittee({
        name,
        slug,
        department,
        description,
        contactEmail,
        logoUrl,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Committee formed successfully! You are the primary Owner.");
        router.push("/organizer/dashboard");
      }
    } catch {
      toast.error("Failed to create committee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-12 px-4 sm:px-8 space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold">
        <Link href="/organizer/dashboard">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Department Hub
        </Link>
      </Button>

      <div>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          Pravara Rural Engineering College, Loni
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Form a Democratic Committee / Association
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Create an organizing committee (e.g., CESA, ITSA, AI Society) without needing a separate shared club login. As the creator, you can invite co-managers, coordinators, and transfer primary leadership democratically at any time.
        </p>
      </div>

      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Committee Information
          </CardTitle>
          <CardDescription className="text-xs">
            Assigned to Pravara Rural Engineering College departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Committee / Association Name *</Label>
              <Input
                id="name"
                placeholder="e.g. CESA (Computer Engineering Students Association)"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs font-semibold">Engineering Branch</Label>
                <select
                  id="department"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Automation & Robotics">Automation & Robotics</option>
                  <option value="Electronics & Telecommunication">E & TC</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Inter-Departmental">Inter-Departmental / Central</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs font-semibold">Identifier Slug *</Label>
                <Input
                  id="slug"
                  placeholder="cesa-computer"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Official Contact / Notice Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="cesa.computer@pravaraengg.org.in"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold">Description & Objective</Label>
              <Textarea
                id="desc"
                rows={3}
                placeholder="Describe the student association, executive members, faculty coordinators, and annual sprint goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="logo" className="text-xs font-semibold">Logo or Emblem Image URL</Label>
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

            <div className="pt-2">
              <Button type="submit" className="w-full gap-2 font-bold text-xs" disabled={isSubmitting}>
                {isSubmitting ? "Creating Committee..." : "Create Committee & Become Owner"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
