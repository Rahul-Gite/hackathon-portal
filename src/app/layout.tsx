import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "CampusHack | College Hackathon & Innovation Platform",
  description: "Discover, organize, and participate in premier collegiate hackathons, form teams, and showcase student innovations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
