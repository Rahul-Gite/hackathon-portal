"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GraduationCap,
  ArrowRight,
  User,
  ShieldCheck,
  Award,
  Globe2,
  Crown,
  Eye,
  EyeOff,
  Building2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setErrorMessage("Invalid email or password. Please verify your credentials.");
        toast.error("Invalid credentials.");
      } else {
        toast.success("Welcome back to PravaraHack!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      toast.error("Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, roleName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setEmail(demoEmail);
    setPassword("password123");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: demoEmail,
        password: "password123",
      });

      if (res?.error) {
        setErrorMessage(`User account (${demoEmail}) not found. Please ensure database seed has run.`);
        toast.error("User not found.");
      } else {
        toast.success(`Signed in as ${roleName}`);
        const destination = demoEmail.includes("rokade") || demoEmail.includes("shinde")
          ? "/organizer/dashboard"
          : callbackUrl;
        router.push(destination);
        router.refresh();
      }
    } catch {
      setErrorMessage("Quick sign-in encountered an error.");
      toast.error("Login error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-xs bg-card">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl font-bold">Sign In to PravaraHack</CardTitle>
        <CardDescription className="text-xs">
          Enter your email and password to access your dashboard, squad, or committee
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="student@pravara.edu or personal@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">
                Password
              </Label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="text-xs"
            />
          </div>

          <Button type="submit" className="w-full gap-2 font-bold text-xs" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Development / Evaluation Personas Accordion */}
        <Accordion type="single" collapsible className="w-full pt-1 border-t">
          <AccordionItem value="demo-accounts" className="border-b-0">
            <AccordionTrigger className="text-[11px] text-muted-foreground hover:text-foreground py-2 justify-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" />
              <span>Development Testing Personas</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-0 space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs font-normal h-auto py-2 gap-2 text-left border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 rounded-md"
                  onClick={() => handleQuickLogin("prof.rokade@pravaraengg.org.in", "Prof. Rokade (CESA Owner)")}
                  disabled={isLoading}
                >
                  <Crown className="h-4 w-4 text-amber-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Prof. S. M. Rokade &bull; Committee Owner</span>
                    <span className="text-[10px] text-muted-foreground">CESA Democratic Owner (host events, manage roles)</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs font-normal h-auto py-2 gap-2 text-left border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 rounded-md"
                  onClick={() => handleQuickLogin("rohit.shinde@pravara.edu", "Rohit (PREC Student & Co-Manager)")}
                  disabled={isLoading}
                >
                  <User className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Rohit Shinde &bull; PREC Student & Co-Manager</span>
                    <span className="text-[10px] text-muted-foreground">CESA Co-Manager (configure hackathons, rubrics)</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs font-normal h-auto py-2 gap-2 text-left border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 rounded-md"
                  onClick={() => handleQuickLogin("aditi.sharma@coep.ac.in", "Aditi (Outside Student)")}
                  disabled={isLoading}
                >
                  <Globe2 className="h-4 w-4 text-purple-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Aditi Sharma &bull; Outside Student Hacker</span>
                    <span className="text-[10px] text-muted-foreground">COEP Tech Univ Pune (participates in flagship events)</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs font-normal h-auto py-2 gap-2 text-left border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-md"
                  onClick={() => handleQuickLogin("dr.patil@pravaraengg.org.in", "Dr. Patil (Faculty Judge)")}
                  disabled={isLoading}
                >
                  <Award className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Dr. V. R. Patil &bull; Faculty Judge</span>
                    <span className="text-[10px] text-muted-foreground">Rubric Evaluator, scoring & feedback</span>
                  </div>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3 border-t pt-4 text-xs text-muted-foreground bg-muted/10">
        <div>
          New participant or outside college student?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="container relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs mb-1">
            <GraduationCap className="h-6 w-6 text-amber-300" />
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Pravara Rural Engineering College
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Sign In to PravaraHack</h1>
          <p className="text-xs text-muted-foreground">
            Access your hackathons, squads, and organizing workspaces
          </p>
        </div>

        <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-muted-foreground">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
