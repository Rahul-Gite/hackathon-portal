# PravaraHack — Unified Hackathon & Innovation Platform

> **Institution:** Pravara Rural Engineering College (PREC), Loni  
> **Affiliation:** Savitribai Phule Pune University (SPPU), NAAC 'A' Grade  
> **Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui, Prisma ORM, PostgreSQL, NextAuth v5

PravaraHack is a full-featured campus and state-level hackathon management portal developed for **Pravara Rural Engineering College (PREC), Loni**. It facilitates departmental hackathons across campus branches as well as flagship state competitions welcoming outside universities.

---

## Key Capabilities

### 1. Student Hacker Journey
- **Streamlined Account Creation (`/register`)**:
  - Frictionless signup (Name, Email, Password).
  - Institution selector (PREC Loni student vs. Outside University student).
  - **Dynamic Auto-Suggestions** for outside colleges based on previously registered student records and major regional universities.
- **Participant Dashboard (`/dashboard`)**:
  - Context-aware next action cards (Live sprint portal, prototype submission prompt, solo squad assembly).
  - Digital desk check-in pass with secure QR token.
  - Squad member roster with real-time capacity progress.
- **Squad Formation**:
  - Instant 6-character cryptographically random join codes (e.g. `PREC26`).
  - Strict server-side capacity enforcement and duplicate membership guards.
- **Live Hack Portal (`/hackathons/[slug]/live`)**:
  - Real-time schedule milestones and live committee announcements.
- **Prototype Submission Engine (`/hackathons/[slug]/submit`)**:
  - Repository link, live demo deployment, track selection, and pitch deck submission.

### 2. Democratic Committee Governance (`/organizer/committees`)
- **No Shared Account Bottleneck**:
  - Any authenticated student head or faculty member can form an organizing committee (e.g., CESA, ITSA, AI Society).
  - Creator is assigned `OWNER` with democratic rights to add `CO_MANAGER` or `COORDINATOR` members.
  - **Atomic Leadership Transfer**: Ownership can be democratically transferred between committee members directly in the portal.
- **Full Hackathon Customization (`/organizer/hackathons/create`)**:
  - Eligibility scope (PREC Only vs. All Colleges).
  - Multi-track setup, prizes, custom schedules, and accommodation toggles.

### 3. Faculty & Industry Judging Portal (`/hackathons/[slug]/judge`)
- Dedicated evaluation dashboard for assigned evaluators.
- Multi-criteria rubric slider scoring (Innovation, Technical Execution, Impact, Pitch).
- Private evaluation notes and server-calculated aggregate scores.

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+
- **PostgreSQL**: Local PostgreSQL or serverless PostgreSQL (Neon / Vercel Postgres)

### 2. Setup Environment
```bash
# Clone the repository
git clone https://github.com/Rahul-Gite/hackathon-portal.git
cd hackathon-portal

# Copy environment variables template
cp .env.example .env
```

Edit `.env` with your PostgreSQL database credentials:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/hackathon_portal?schema=public"
AUTH_SECRET="your-generated-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Migration & Seed
```bash
# Push Prisma schema to database
npx prisma db push

# Seed demo committees, hackathons, and test personas
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Deployment

```bash
# Run production build
npm run build

# Start production server
npm start
```
Optimized for deployment on [Vercel](https://vercel.com) with Vercel Postgres or Neon.
