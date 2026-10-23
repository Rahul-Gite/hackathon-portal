"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Building2,
  MapPin,
  ExternalLink,
  Users,
} from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Institutional Top Strip */}
      <div className="bg-primary px-4 py-1 text-[11px] text-primary-foreground/90 sm:px-8 border-b border-primary/20">
        <div className="container mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-semibold text-accent">Pravara Rural Education Society&apos;s</span>
            <span>&bull;</span>
            <span className="truncate">Pravara Rural Engineering College (PREC), Loni</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-primary-foreground/80">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-amber-300" /> Tal: Rahata, Dist: Ahilyanagar (Ahmednagar), Maharashtra
            </span>
            <span>&bull;</span>
            <a
              href="https://www.pravaraengg.org.in/"
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-amber-200 inline-flex items-center gap-0.5"
            >
              pravaraengg.org.in
              <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-2xs group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-primary leading-none">
                Pravara<span className="text-amber-600 dark:text-amber-400">Hack</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                PREC Innovation Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-muted-foreground">
            <Link href="/" className="transition hover:text-primary">
              All Hackathons
            </Link>
            {user && (
              <Link href="/dashboard" className="transition hover:text-primary">
                My Squads & Entries
              </Link>
            )}
            {user && (
              <Link href="/organizer/dashboard" className="transition hover:text-primary flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Department Hub
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold rounded-md">
                <Link href="/organizer/committees/create">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Form Committee
                </Link>
              </Button>

              <Button asChild size="sm" className="gap-1.5 shadow-2xs text-xs font-bold rounded-md">
                <Link href="/organizer/hackathons/create">
                  <PlusCircle className="h-4 w-4" />
                  Host Hackathon
                </Link>
              </Button>
            </div>
          )}

          {status === "loading" ? (
            <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <Avatar className="h-9 w-9 rounded-md border border-border shadow-2xs">
                    <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs rounded-md">
                      {user.name?.slice(0, 2).toUpperCase() || "PR"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-bold leading-none text-foreground">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <Badge variant="blue" className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5">
                        {user.role}
                      </Badge>
                      <Badge
                        variant={user.studentType === "INTERNAL" ? "success" : "purple"}
                        className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5"
                      >
                        {user.studentType === "INTERNAL" ? "PREC Loni Student" : "Outside Student"}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium pt-0.5 truncate">
                      {user.collegeName}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer flex items-center gap-2 text-xs">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span>Hacker Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/organizer/dashboard" className="cursor-pointer flex items-center gap-2 text-xs">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Department & Committee Hub</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/organizer/committees/create" className="cursor-pointer flex items-center gap-2 text-xs">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Form New Committee</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2 text-xs"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold rounded-md">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="text-xs font-bold shadow-2xs rounded-md">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
