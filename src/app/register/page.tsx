"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerUser, getRegisteredCollegeSuggestions, CollegeSuggestion } from "@/app/actions/auth";
import { toast } from "sonner";
import {
  GraduationCap,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Globe2,
  Sparkles,
  Check,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStudentType = searchParams.get("studentType") === "EXTERNAL" ? "EXTERNAL" : "INTERNAL";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Institution affiliation
  const [studentType, setStudentType] = useState<string>(initialStudentType);
  const [collegeName, setCollegeName] = useState("");
  const [department, setDepartment] = useState("Computer Engineering");

  // Auto-suggestion state
  const [suggestions, setSuggestions] = useState<CollegeSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<CollegeSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load college suggestions from database
  useEffect(() => {
    let isMounted = true;
    async function loadSuggestions() {
      try {
        const list = await getRegisteredCollegeSuggestions();
        if (isMounted) {
          setSuggestions(list);
          setFilteredSuggestions(list);
        }
      } catch (err) {
        console.warn("Could not load college suggestions:", err);
      }
    }
    loadSuggestions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    if (!collegeName.trim()) {
      setFilteredSuggestions(suggestions.slice(0, 8));
      return;
    }

    const query = collegeName.toLowerCase().trim();
    const matches = suggestions.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
    setFilteredSuggestions(matches.slice(0, 8));
  }, [collegeName, suggestions]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCollege = (name: string) => {
    setCollegeName(name);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectCollege(filteredSuggestions[highlightedIndex].name);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (studentType === "EXTERNAL" && !collegeName.trim()) {
      setErrorMsg("Please enter your College or University name.");
      return;
    }

    setIsPending(true);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim().toLowerCase());
    formData.append("password", password);
    formData.append("studentType", studentType);
    formData.append(
      "collegeName",
      studentType === "INTERNAL" ? "Pravara Rural Engineering College, Loni" : collegeName.trim()
    );
    formData.append("department", department);

    try {
      const res = await registerUser(formData);
      if (res.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
      } else {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      }
    } catch {
      setErrorMsg("Registration failed. Please try again.");
      toast.error("Registration failed.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border border-border shadow-xs bg-card">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl font-bold">Create Account</CardTitle>
        <CardDescription className="text-xs">
          Join hackathons at Pravara Rural Engineering College, Loni
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMsg && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g. Rohit Shinde or Aditi Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="yourname@pravara.edu or personal@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">
                Password *
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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
              className="text-xs"
            />
          </div>

          {/* Institution Selection */}
          <div className="space-y-2 pt-1 border-t">
            <Label className="text-xs font-semibold">Institution</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-md border text-xs">
              <button
                type="button"
                className={`py-1.5 px-3 rounded-md font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                  studentType === "INTERNAL"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setStudentType("INTERNAL");
                  setShowDropdown(false);
                }}
              >
                <Building2 className="h-3.5 w-3.5" />
                PREC Loni Student
              </button>
              <button
                type="button"
                className={`py-1.5 px-3 rounded-md font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                  studentType === "EXTERNAL"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setStudentType("EXTERNAL");
                  setShowDropdown(true);
                }}
              >
                <Globe2 className="h-3.5 w-3.5" />
                Outside College
              </button>
            </div>

            {studentType === "EXTERNAL" ? (
              <div className="space-y-1.5 pt-1 relative" ref={dropdownRef}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="collegeName" className="text-xs font-semibold">
                    College / University Name *
                  </Label>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-primary" /> Auto-suggests saved colleges
                  </span>
                </div>

                <div className="relative">
                  <Input
                    id="collegeName"
                    list="registered-colleges"
                    placeholder="Type college name (e.g. COEP, PICT, VIIT, SPPU)..."
                    value={collegeName}
                    onChange={(e) => {
                      setCollegeName(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    required
                    disabled={isPending}
                    className="text-xs pr-8"
                  />
                  {collegeName && (
                    <button
                      type="button"
                      onClick={() => {
                        setCollegeName("");
                        setShowDropdown(true);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Native datalist fallback */}
                <datalist id="registered-colleges">
                  {suggestions.map((s, idx) => (
                    <option key={idx} value={s.name} />
                  ))}
                </datalist>

                {/* Interactive Auto-Suggestion Dropdown */}
                {showDropdown && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95">
                    <div className="p-1.5 bg-muted/30 border-b text-[10px] text-muted-foreground font-semibold flex items-center justify-between">
                      <span>Suggested Institutions</span>
                      <span>{filteredSuggestions.length} found</span>
                    </div>
                    {filteredSuggestions.map((item, idx) => {
                      const isSelected = collegeName.toLowerCase() === item.name.toLowerCase();
                      const isHighlighted = highlightedIndex === idx;

                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors border-b last:border-b-0 ${
                            isHighlighted
                              ? "bg-primary/10 text-primary"
                              : isSelected
                              ? "bg-muted font-bold text-foreground"
                              : "hover:bg-muted/70 text-foreground"
                          }`}
                          onClick={() => handleSelectCollege(item.name)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.isRegistered ? (
                              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                {item.count > 0 ? `${item.count} registered` : "Registered"}
                              </span>
                            ) : (
                              <span className="text-[9px] text-muted-foreground">
                                University
                              </span>
                            )}
                            {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="department" className="text-xs font-semibold">
                  Branch
                </Label>
                <Select value={department} onValueChange={setDepartment} disabled={isPending}>
                  <SelectTrigger id="department" className="text-xs">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="AI & Data Science">AI & Data Science</SelectItem>
                    <SelectItem value="Automation & Robotics">Automation & Robotics</SelectItem>
                    <SelectItem value="Electronics & Telecommunication">E & TC</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                    <SelectItem value="Instrumentation & Control">Instrumentation</SelectItem>
                    <SelectItem value="First Year Engineering">First Year (FE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full gap-2 font-bold text-xs mt-3" disabled={isPending}>
            {isPending ? "Creating Account..." : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center text-xs text-muted-foreground bg-muted/10">
        <div>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="container relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[440px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs mb-1">
            <GraduationCap className="h-6 w-6 text-amber-300" />
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Pravara Rural Engineering College
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Join PravaraHack</h1>
        </div>

        <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-muted-foreground">Loading form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
