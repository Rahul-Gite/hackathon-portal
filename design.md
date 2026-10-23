# PravaraHack — Product, Frontend & UX Specification

> **Product:** PravaraHack — Hackathon Registration and Management Portal  
> **Institution:** Pravara Rural Engineering College (PREC), Loni  
> **Primary goal:** Make discovering a hackathon, registering, forming a team, and managing an event straightforward for students and organizers.  
> **Frontend stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Lucide React  
> **Backend/data stack:** Prisma ORM and PostgreSQL  
> **Authentication:** Auth.js / NextAuth v5, configured consistently with the installed version  
> **Status:** Product specification; implementation details must be checked against the actual repository before coding.

---

## 1. Product Direction

PravaraHack should feel like a credible college technology platform—not an overloaded admin template. The experience must prioritize the next action a user needs to take, explain what happens next, and provide clear feedback after every important action.

### Product principles

1. **Task-first UI:** Every page has one clear primary action. Secondary actions must not compete visually.
2. **Progressive disclosure:** Show essential information first. Place advanced settings behind expandable sections or later steps.
3. **One account, role-aware experience:** A user signs in once. The app exposes only the features permitted by their account and their membership in a specific committee or event.
4. **Predictable navigation:** Public discovery, participant tasks, and organizer operations have distinct navigation structures.
5. **No dead ends:** Every empty, error, loading, and success state tells the user what happened and what to do next.
6. **Responsive by default:** Core flows must work on mobile, tablet, and desktop—not merely shrink to fit.
7. **Accessible by design:** Keyboard support, visible focus, semantic labels, sufficient contrast, and understandable validation are requirements.
8. **Honest status:** Do not show “registered,” “verified,” “checked in,” or “submitted” until the server confirms the change.

### What this specification does not assume

- Do not assume that a college email domain or a typed PRN automatically proves student identity.
- Do not assume that all users can create committees or publish events.
- Do not expose a one-click demo login in production.
- Do not promise free accommodation until availability, eligibility, and approval rules are defined.
- Do not describe data as real-time unless a working update mechanism is implemented.

---

## 2. User Types and Core Jobs

System roles and event-specific permissions are separate concepts. A person may be a student and also be a coordinator for one committee.

| User type | Main job | Primary destination |
|---|---|---|
| Visitor | Discover events, understand eligibility, view rules and dates | Public home / event details |
| Student participant | Create an account, register, join a team, submit a project, view updates | Participant dashboard |
| Team leader | Manage team membership and submission for one event | Team workspace |
| Committee owner | Manage committee membership, roles, ownership, and events | Organizer dashboard |
| Co-manager | Configure events and manage event operations within granted permissions | Event management |
| Coordinator | Handle assigned operational tasks such as check-in | Check-in workspace |
| Judge | Review assigned submissions and submit scores | Judge workspace |
| Faculty / verifier | Verify information only when explicitly assigned and authorized | Verification queue |
| Platform administrator | Manage platform-wide settings, moderation, and access | Admin workspace |

### Role design rules

- `UserRole` should represent platform-level identity or trust, not every action a user may perform.
- `CommitteeRole` controls access within one committee.
- Event-specific assignments should control judge access and other event-specific duties.
- The server must authorize every protected operation. Client-side route guards and hidden buttons are only usability aids.
- Do not grant organizer access merely because someone registered as `FACULTY`.
- A participant must not access another participant’s private registration, QR credential, or team data unless the product explicitly permits it.

---

## 3. Information Architecture and Navigation

### Public routes

- `/` — Landing page and event discovery
- `/hackathons` — Searchable/filterable event directory
- `/hackathons/[slug]` — Event details
- `/login` — Sign in
- `/register` — Create account
- `/forgot-password` — Request password reset
- `/reset-password` — Set a new password
- `/verify-email` — Email verification feedback, if email verification is enabled
- `/terms` and `/privacy` — Policy pages

### Participant routes

- `/dashboard` — Registration summary and next steps
- `/dashboard/profile` — Profile and institution details
- `/dashboard/registrations` — Registration history and statuses
- `/dashboard/teams/[teamId]` — Team workspace
- `/dashboard/registrations/[registrationId]` — Event pass, event-specific information, and check-in status
- `/hackathons/[slug]/register` — Event registration flow
- `/hackathons/[slug]/live` — Schedule and announcements
- `/hackathons/[slug]/submit` — Project submission, when submissions are open

### Organizer routes

- `/organizer/dashboard` — Events and committee overview
- `/organizer/committees` — Committees the current user belongs to
- `/organizer/committees/create` — Create a committee, if permitted
- `/organizer/committees/[committeeId]` — Committee settings and membership
- `/organizer/hackathons/create` — Event creation wizard
- `/organizer/hackathons/[hackathonId]` — Event operations overview
- `/organizer/hackathons/[hackathonId]/registrations` — Registration management
- `/organizer/hackathons/[hackathonId]/check-in` — Check-in desk
- `/organizer/hackathons/[hackathonId]/announcements` — Announcements
- `/organizer/hackathons/[hackathonId]/submissions` — Submission review
- `/organizer/hackathons/[hackathonId]/judges` — Judge assignment, if permitted

### Judge routes

- `/judge/dashboard` — Events and submissions assigned to the judge
- `/judge/hackathons/[hackathonId]/submissions/[submissionId]` — Submission details and rubric

### Navigation behavior

- Public navigation: **Home, Hackathons, About/How it works**, with **Sign in** and a primary **Explore hackathons** action.
- Signed-in participant navigation: **Dashboard, Explore events, My teams, Profile**.
- Organizer navigation: **Overview, Events, Registrations, Check-in, Committee**; show only items allowed by the user’s permissions.
- Judge navigation is a focused evaluation workspace, not the full organizer sidebar.
- On mobile, use a compact header and an accessible menu or bottom navigation for the most common participant tasks.
- Keep the current page visually identifiable. Navigation must not depend on icons alone.

---

## 4. Core User Journeys

### 4.1 Visitor → participant

1. Visitor lands on the homepage.
2. They can immediately see upcoming/open hackathons and the key dates.
3. They open an event and inspect eligibility, team rules, location, schedule, prizes, and registration dates.
4. They select **Register for this hackathon**.
5. If signed out, they are sent to sign in or create an account, then returned to the event registration flow.
6. The form collects only the information required at that point.
7. The server validates eligibility and registration availability.
8. The user sees a clear confirmation page and a registration entry on their dashboard.

**Requirement:** Preserve the intended destination after authentication. Do not send every user to a generic home page after sign-in.

### 4.2 Account creation

Use a short, step-based form rather than a long form containing every possible field.

**Step 1 — Account**
- Full name
- Email
- Password and confirmation, if password authentication is enabled
- Terms/privacy acknowledgement

**Step 2 — Student profile**
- Institution type: PREC student / student from another institution
- Institution name
- Department / branch
- Current academic year or graduation year
- PRN / college roll number only when required for the selected institution type

**Step 3 — Confirmation**
- Explain whether email verification or manual verification is required.
- Show a success state and the next action.

Rules:
- Ask external students for their institution details; do not prefill them with PREC.
- Ask internal students for the relevant identifier, but label it accurately (PRN, university seat number, or college roll number according to actual policy).
- Use select/autocomplete controls for known lists where practical, but allow a clear “Other” path when appropriate.
- Never use a client-provided `studentType`, `role`, or verification flag as authoritative. Determine and validate sensitive fields on the server.
- If a user changes their institution type later, explain which fields need re-verification.
- Passwords must be hashed server-side. Never log passwords or authentication tokens.

### 4.3 Sign in and recovery

- Support the authentication methods that are actually configured; do not show nonfunctional social-login buttons.
- Include show/hide password, clear field labels, inline errors, and a working password-reset path if password login is used.
- Error messages should be specific enough to help but must not reveal whether an arbitrary email address has an account.
- Provide loading feedback and prevent accidental duplicate submission.
- Provide a visible route back to registration.
- Production builds must not expose demo credentials or one-click role switching.

### 4.4 Event registration

Use a clear stepper with a small number of steps:

1. **Eligibility** — display event-specific restrictions and validate them.
2. **Team** — create a team, join an existing team, or choose solo participation if allowed.
3. **Details** — ask required event-specific questions and accommodation preference only when relevant.
4. **Review** — summarize choices and let users go back to edit.
5. **Confirmation** — show server-confirmed registration status and next steps.

Rules:
- Display registration opening/closing dates and current availability near the primary action.
- Disable registration only with a visible explanation (for example, “Registration closes on 12 November at 5:00 PM IST”).
- Preserve form values when navigating between steps.
- Validate on both client and server. Client validation improves usability; server validation is authoritative.
- Prevent duplicate registrations using a database constraint and server-side handling.
- Do not create a team or registration until the user confirms the relevant action, unless the workflow explicitly explains draft creation.
- If registration requires organizer approval, label the result **Pending approval**, not **Registered/Accepted**.
- Explain accommodation requests as requests, not confirmed bookings. Show the approval/status process.

### 4.5 Team creation and joining

Provide two equally understandable choices: **Create a team** and **Join with a code**.

**Create team**
- Team name
- Track preference, if tracks exist
- Confirm the user becomes team leader
- Generate a secure, random, event-scoped join code

**Join team**
- Enter join code
- Preview team name, event, current member count, and any relevant eligibility restrictions before joining
- Confirm join

Rules:
- A join code is an invitation mechanism, not a substitute for authentication or authorization.
- Codes must be generated with a cryptographically secure random source, be unique within the required scope, and be rate-limited against guessing.
- Normalize codes consistently (for example, uppercase and trim whitespace).
- Validate event match, registration window, team capacity, team eligibility, and duplicate membership on the server.
- Use a transaction or equivalent concurrency-safe operation so two simultaneous joins cannot exceed the maximum team size.
- Define and enforce whether a participant may belong to more than one team per hackathon. Default recommendation: one team per hackathon.
- Define how a team leader leaves, transfers leadership, removes members, and disbands a team.
- Show a confirmation dialog for destructive membership actions.
- Never expose a team’s private join code on a public event page.

### 4.6 Organizer creates an event

Use a multi-step wizard with autosave or explicit draft saving. Do not expose every configuration field on one massive screen.

1. **Basics:** title, short description, banner, organizing committee
2. **Eligibility & format:** internal/all colleges, online/in-person/hybrid, solo/team options, team-size limits
3. **Dates & venue:** registration window, event start/end, venue and time zone
4. **Tracks & prizes:** optional tracks, mentors, sponsors, prizes
5. **Schedule & rules:** milestones, rules, FAQs
6. **Registration form:** custom questions and required flags
7. **Review & publish:** validation summary and preview

Rules:
- Drafts can be saved before every field is complete.
- Publish is blocked until required fields and date relationships are valid.
- Clearly distinguish **Save draft**, **Preview**, and **Publish**.
- Publishing requires confirmation and explains which information becomes public.
- Editing dates after registration opens should warn about the impact on existing registrations.
- Do not allow event managers to edit events outside committees where they have the relevant permission.
- Custom question types must be explicitly supported and validated. Start with short text, paragraph, single select, and checkbox only if they can be fully implemented.

### 4.7 Check-in

- Provide a dedicated, simplified check-in page rather than burying the task in a large event dashboard.
- Search by participant name, registration ID, institution, or team.
- Display only the personal data needed at the desk.
- Require an authorized coordinator role for the selected event.
- Confirm identity using the actual approved college process; do not imply that scanning a QR code alone proves identity.
- Check-in must be idempotent: repeated scans should show “Already checked in” rather than creating duplicate attendance.
- Show a clear success/error result with the participant and team context.
- Never expose the QR token or a reusable secret in logs or public URLs.

### 4.8 Submission and judging

- Display submission deadlines and accepted link/file formats before users begin.
- Save drafts where practical; distinguish **Draft** from **Submitted**.
- A successful submission requires server confirmation and a timestamp.
- After the deadline, follow the event’s configured policy and explain whether edits are blocked or allowed.
- Judges see only submissions assigned to them.
- Validate rubric values server-side and calculate total scores on the server from defined weights.
- Prevent a judge from scoring the same submission twice unless an explicit edit/resubmission workflow is supported.
- Keep judge feedback and scores private until the configured release point.

---

## 5. Public Landing Page UX

The homepage should communicate the platform’s purpose and direct users toward events. Avoid a large hero that pushes all useful content below the fold.

### Recommended page order

1. **Header:** PravaraHack wordmark, Home, Hackathons, How it works, Sign in, primary CTA.
2. **Hero:** concise headline, one-sentence explanation, primary “Explore hackathons” CTA, secondary “How it works” link.
3. **Featured / open hackathons:** cards with title, status, date, format, eligibility, and clear action.
4. **How it works:** Discover → Register → Build with a team → Submit.
5. **Why participate:** learning, collaboration, mentoring, and prizes only where supported by the actual event.
6. **Upcoming timeline or key dates:** only when reliable data exists.
7. **Institutional footer:** college attribution, contact, terms, privacy.

### Event card requirements

Each card should show:
- Event title and short description
- Status label: Draft is never public; otherwise Upcoming, Registration open, Registration closed, Live, or Completed
- Registration closing date where relevant
- Online / in-person / hybrid
- Eligibility summary
- Team size or solo option
- A single primary link such as **View details**

Do not use color as the only status indicator. Do not display fake countdowns, placeholder event counts, fake testimonials, or fabricated statistics.

### Event details page

Use a predictable structure:
- Title, banner, organizer, status, and key dates
- A visible registration CTA with contextual state
- Overview
- Eligibility and team rules
- Tracks and prizes
- Schedule
- Venue / online participation details
- Rules and FAQs
- Contact/support information

On desktop, a compact sticky registration panel may be used if it does not obscure content. On mobile, use a clear CTA without covering essential page content.

---

## 6. Participant Dashboard UX

The dashboard must answer these questions immediately:
1. What am I registered for?
2. What do I need to do next?
3. What is my team’s current status?
4. Are there any important announcements or deadlines?

### Dashboard layout

- Greeting and concise page title
- **Next action** panel, based on actual state (complete profile, finish registration, invite teammates, submit project)
- Upcoming / active hackathons
- Registration status list
- Team summary and member list
- Recent announcements relevant to the participant’s events
- Upcoming deadlines

### State-aware content

- New user: explain how to find an event and complete their profile.
- No registrations: show a helpful empty state and a button to explore hackathons.
- Pending approval: show the pending state and what happens next.
- Accepted: show event details and preparation steps.
- Team incomplete: show missing members or team setup actions, if relevant.
- Submission not open: show the opening time.
- Submission open: show the submit/resume action.
- Event completed: show historical status and results only if results are published.

Do not show every dashboard widget to every user. Hide irrelevant sections without making the interface feel broken.

---

## 7. Organizer UX

Organizer tools are operational software. Optimize them for clarity, accuracy, and repeated use rather than decorative effects.

### Organizer dashboard

Show:
- Events the user is authorized to manage
- Draft / published / live / completed status
- Registration counts only when calculated from real data
- Upcoming deadlines
- Pending operational tasks
- Quick actions: Create event, Manage registrations, Check-in

### Event management layout

Use a stable tab structure:
- Overview
- Event setup
- Registrations
- Teams
- Check-in
- Announcements
- Submissions
- Judges / results, when enabled

Only render tabs that the user is authorized to use. For large tables, provide search, filters, sorting, pagination, and clear empty states. On mobile, use a card/list presentation rather than forcing a wide desktop table into a tiny viewport.

### Committee management

- Show committee name, verification status, members, and roles.
- Make role permissions understandable in plain language.
- Invite members through an explicit, expiring invitation flow; do not silently grant access based on an email address typed into a form.
- Ownership transfer requires a confirmation step naming the new owner and explaining the effect.
- Execute ownership transfer atomically on the server. Ensure the target is an active committee member and the committee cannot end up with zero owners.
- Record sensitive governance changes in an audit log.
- Prevent owners from accidentally removing their own last-owner access without transferring ownership.

---

## 8. Visual Design System

### 8.1 Design direction

Use a clean institutional style: confident typography, restrained color, consistent spacing, and strong information hierarchy. Pastel colors are supporting surfaces, not the main visual identity. Avoid excessive cards, gradients, shadows, and oversized headings.

### 8.2 Brand palette

| Token | Value | Use |
|---|---|---|
| Primary blue | `#1D4ED8` | Main actions, links, focus and selected states |
| Deep blue | `#1E3A8A` | High-emphasis headings and dark blue surfaces |
| Saffron amber | `#D97706` | Awards and limited highlights |
| Page background | `#F8FAFC` | App background |
| Surface | `#FFFFFF` | Cards, dialogs, form surfaces |
| Main text | `#0F172A` | Primary text |
| Muted text | `#475569` | Secondary text; verify contrast |
| Border | `#E2E8F0` | Dividers, fields, card boundaries |
| Success | `#166534` | Success text/icon with accessible surface |
| Warning | `#92400E` | Warning text/icon with accessible surface |
| Error | `#B91C1C` | Error text/icon with accessible surface |
| Info | `#1D4ED8` | Informational messages |

Pastel status backgrounds may be used only with readable foreground colors. Test contrast rather than assuming a pastel combination is accessible.

### 8.3 Shape, spacing, and typography

- Use a consistent spacing scale based on 4px increments.
- Main content width: typically `max-width: 1200px` to `1280px`, with responsive side padding.
- Use `rounded-md` for fields and controls, `rounded-lg` for cards, and restrained rounding for dialogs.
- Avoid capsule-shaped badges and chips to maintain the specified institutional style. Do not apply this restriction to controls whose established accessibility/usability pattern requires another shape.
- Use one readable sans-serif family and a small, consistent type scale.
- Body text should be comfortably readable; avoid tiny muted labels for important information.
- Use shadows sparingly. Prefer borders and spacing to separate sections.
- Keep page titles, section headings, helper text, and metadata visually distinct.

### 8.4 Iconography

- Use Lucide React consistently.
- Icons must have accessible labels when they communicate meaning without visible text.
- Decorative icons should be hidden from assistive technology.
- Do not use emoji as interface icons.
- Never rely on an icon alone for destructive actions, statuses, or navigation.

### 8.5 Component standards

Use shadcn/ui components where appropriate and customize them through shared design tokens:
- Button
- Input, Textarea, Select, Checkbox, Switch
- Form labels and validation messages
- Dialog / AlertDialog
- DropdownMenu
- Tabs
- Table
- Badge
- Card
- Skeleton
- Tooltip
- Accordion
- Toast / Sonner or the existing project’s notification system
- Progress / Stepper (a stepper may be a small custom component)

Avoid building multiple visually different versions of the same button, input, card, or badge across routes.

### 8.6 Buttons and actions

Define consistent variants:
- **Primary:** one main action per page/section
- **Secondary:** important but non-primary actions
- **Outline / Ghost:** low-emphasis navigation or utility actions
- **Destructive:** delete, remove, revoke, or disband

Rules:
- Button text describes the action: “Create team,” “Save draft,” “Publish event.”
- Show a pending state during server requests and prevent duplicate clicks.
- Do not show a success toast before the operation succeeds.
- Destructive actions require an explanatory confirmation when consequences are meaningful.
- Use disabled styling plus a reason when an action is unavailable.

### 8.7 Forms and validation

- Every field has a persistent visible label. Placeholder text is not a label.
- Mark required and optional fields clearly.
- Put errors next to the relevant field and summarize form-level failures near the top where useful.
- Preserve valid user input after server errors.
- Use correct input types and autocomplete attributes.
- Avoid validating too aggressively while the user is still typing.
- Explain formatting requirements before submission.
- Focus the first invalid field after a failed submit when practical.
- Use confirmation summaries for high-impact actions such as publishing an event or transferring committee ownership.

---

## 9. Responsive Behavior

Support at minimum:
- Small mobile: 320–375px
- Standard mobile: 390–430px
- Tablet: 768px
- Laptop: 1024–1440px
- Large desktop: 1440px and above

Requirements:
- No horizontal page overflow at supported widths.
- Navigation, dialogs, form fields, tables, and menus remain usable by touch.
- Form fields and primary actions should be easy to tap.
- On mobile, stack multi-column forms and dashboard panels.
- Tables should use responsive cards, selective columns, or controlled horizontal scrolling with an obvious affordance.
- Dialogs should fit within the viewport and allow scrolling.
- Sticky elements must not cover focused fields, validation errors, or primary content.
- Test at browser zoom of 200%.

---

## 10. Accessibility and Usability Requirements

Target WCAG 2.2 AA as the accessibility goal.

- Semantic headings in logical order.
- Keyboard-operable navigation, menus, dialogs, tables, and forms.
- Visible keyboard focus indicators.
- Proper label, description, and error associations.
- Dialog focus management and Escape handling where appropriate.
- Do not communicate status using color alone.
- Provide text alternatives for meaningful images and empty `alt` text for decorative images.
- Respect reduced-motion preferences.
- Avoid auto-playing audio/video and unnecessary motion.
- Countdown timers must not be the only way deadlines are communicated.
- Announcements and validation feedback should be accessible to screen readers without excessively interrupting users.
- Use descriptive link text; avoid repeated “Click here.”

---

## 11. Loading, Empty, Error, and Success States

Every data-backed page must define all of these states before it is considered complete.

| State | Required behavior |
|---|---|
| Loading | Show skeletons or a local pending indicator with stable layout; avoid a blank screen |
| Empty | Explain why no items are present and provide a relevant next action |
| Validation error | Identify the field and explain how to fix it |
| Network/server error | Show a recoverable message and retry where safe |
| Unauthorized | Explain that the user lacks permission and provide a safe route back |
| Not found | Show a real not-found state, not a broken page |
| Expired session | Preserve the intended destination and request sign-in |
| Pending approval | Explain what is pending and what the user can do meanwhile |
| Success | Confirm the completed action and show the next step |
| Partial failure | Clearly identify which items succeeded and failed; do not imply full success |

Do not expose stack traces, database errors, internal IDs, secrets, or sensitive user details in user-facing error messages.

---

## 12. Frontend Architecture and Implementation Rules

### Suggested app structure

Adapt to the actual repository; do not duplicate existing patterns without checking them first.

```text
src/
  app/
    (public)/
      page.tsx
      hackathons/
      login/
      register/
    (participant)/
      dashboard/
    (organizer)/
      organizer/
    (judge)/
      judge/
    api/                    # only if API routes are used
    layout.tsx
    globals.css
  components/
    ui/                     # shadcn/ui primitives
    layout/                 # header, footer, sidebars, mobile nav
    shared/                 # status badge, empty state, page header
    forms/                  # reusable field and validation components
    hackathons/
    teams/
    organizer/
  lib/
    auth/
    permissions/
    validations/
    dates/
    utils.ts
  server/
    services/
    repositories/           # optional; follow existing architecture
  types/
prisma/
  schema.prisma
```

This is a recommended organization, not a mandate to move working files blindly.

### Component rules

- Keep route pages focused on composition and route-specific data loading.
- Use Server Components by default. Add `"use client"` only when client-side interaction/state is required.
- Do not turn the entire application into a Client Component.
- Extract shared UI only when it represents a stable repeated pattern.
- Keep database access and secret-bearing logic on the server.
- Never import Prisma or server-only modules into client components.
- Avoid duplicating permission logic in several components; centralize the server-side authorization rules.
- Use a consistent form library and schema validation approach if the repository already has one. Zod and React Hook Form are reasonable options, but verify installed dependencies before assuming them.
- Use typed server actions or API responses with predictable success/error shapes.
- Keep URL state for shareable filters and pagination where useful.
- Use stable keys and handle empty or missing data explicitly.
- Do not use mock data as if it were production data. Clearly isolate demo fixtures and disable them in production.
- Avoid giant components that combine data fetching, validation, layout, dialogs, and business logic.

### Suggested reusable UI patterns

- `PageHeader`
- `SectionHeading`
- `StatusBadge`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`
- `ConfirmActionDialog`
- `FormField`
- `FormErrorSummary`
- `EventCard`
- `RegistrationStatusCard`
- `TeamMemberList`
- `PermissionGate` (presentation only; not a security boundary)
- `DataTableToolbar`
- `ResponsiveDataList`

---

## 13. Data and Status Semantics That Affect the UI

The UI must display one consistent status for each concept. Do not mix registration, approval, attendance, and submission into a single ambiguous status field.

### Event lifecycle

Recommended event states:
- `DRAFT`
- `PUBLISHED`
- `CANCELLED`
- `COMPLETED`

Registration availability (`NOT_OPEN`, `OPEN`, `CLOSED`) should be derived from the event state and registration dates unless manual override behavior is explicitly required.

### Registration lifecycle

Define registration and approval separately if both are needed. For example:
- Registration lifecycle: `ACTIVE`, `WITHDRAWN`
- Approval status: `PENDING`, `ACCEPTED`, `REJECTED`
- Attendance: `NOT_CHECKED_IN`, `CHECKED_IN`

If the implementation keeps a single status enum, document the allowed transitions and ensure they cannot represent contradictory states.

### Team lifecycle

Define what happens when:
- A team is created but not yet registered
- A team is full
- A leader leaves
- A member withdraws
- Registration closes
- A team becomes ineligible
- A team is disbanded

The interface must never infer that a team is registered merely because a `Team` row exists.

### Submission lifecycle

At minimum, distinguish:
- No submission
- Draft
- Submitted
- Late submission, if permitted
- Locked / final, if the event supports finalization

Define whether edits are permitted after submission and after the deadline. Display the exact policy to participants.

### Date and time

- Store timestamps consistently (normally UTC) and display event times in the event’s configured time zone.
- If the platform is initially India-only, make `Asia/Kolkata` the explicit default rather than relying on the viewer’s device time zone.
- Display a time-zone label near important deadlines.
- Validate that registration ends before the event ends and that start/end pairs are ordered correctly.
- Use server time for authoritative deadline checks.

---

## 14. Security and Trust Requirements

- All protected mutations must validate the authenticated user, resource ownership, role, and event/committee scope on the server.
- Validate and normalize all input on the server.
- Use database constraints for uniqueness and relationships wherever possible.
- Use rate limiting for login, password reset, join-code attempts, invitation acceptance, and other abuse-prone endpoints.
- Store only password hashes, never plaintext passwords.
- Keep database credentials, auth secrets, and storage tokens in environment variables.
- Never put server secrets in `NEXT_PUBLIC_*` variables.
- Do not store reusable QR secrets in public URLs or expose them in logs.
- Validate uploaded file types, size, and access policy. Use a configured object-storage provider for uploads; do not assume a provider is configured just because a package is installed.
- Use an audit log for important actions such as role changes, ownership transfers, publishing/cancelling events, check-ins, and result release.
- Define data retention and who can view PRN, phone numbers, institution data, accommodation requests, and judge feedback.
- Do not use real student information in seed/demo data.
- If the existing local database credential in the old specification was real or reused, rotate it and update local environment configuration. Never commit `.env` files.

---

## 15. MVP Scope and Delivery Order

Build a complete, reliable core before adding every advanced feature.

### Phase 1 — Core MVP

- Public homepage and hackathon directory
- Event details page
- Registration, login, logout, and account recovery if password login is enabled
- Participant profile
- Participant dashboard
- Organizer access controlled by committee membership
- Create/edit/publish event with core fields
- Registration with clear status and duplicate prevention
- Create team / join team with secure code and capacity enforcement
- Basic organizer registration list
- Responsive loading, empty, error, and success states

### Phase 2 — Event operations

- Check-in workspace and QR scanning
- Announcements
- Schedule and live event page
- Accommodation request workflow with explicit approval/status
- CSV export with permission checks and privacy safeguards

### Phase 3 — Submissions and judging

- Submission drafts and final submission
- Judge assignment
- Rubric scoring and feedback
- Results publication

### Phase 4 — Advanced capabilities

- Custom questionnaire builder beyond basic question types
- Rich track/mentor/sponsor management
- Advanced analytics
- Notifications and real-time updates, if infrastructure supports them
- Additional verification workflows

Do not present a later-phase feature in the UI as available until it is implemented end to end.

---

## 16. Acceptance Criteria

A page or flow is not complete until the applicable criteria pass.

### Global

- Works on mobile and desktop without horizontal overflow.
- All interactive controls have labels and visible focus.
- Loading, empty, error, and success states exist.
- No placeholder links or nonfunctional buttons.
- No fake data presented as live data.
- No sensitive server logic is trusted to the client.
- User-facing dates include a clear time-zone convention.
- Errors are actionable and do not leak internal details.

### Authentication

- Sign-up validates input on the server.
- Passwords are never stored or logged in plaintext.
- Login errors do not disclose whether an email exists.
- Logout invalidates the session according to the auth provider.
- Protected navigation returns users to their intended destination after login.
- Production has no public demo-login bypass.

### Registration and teams

- A user cannot register twice for the same event.
- A user cannot join a team for a different event using a code.
- Team size cannot exceed the configured limit, including concurrent requests.
- Eligibility restrictions are enforced server-side.
- A user cannot be on multiple teams for one event if the policy is one team per event.
- The UI reflects server-confirmed registration and team state.

### Organizer operations

- A user cannot edit an event outside their authorized scope.
- Draft events are not publicly discoverable.
- Publishing validates required fields and date relationships.
- Ownership transfer is atomic and audited.
- Coordinators can only check in participants for events to which they are assigned.

### Accessibility

- Main flows can be completed by keyboard.
- Forms expose labels and error messages to assistive technology.
- Status is not conveyed by color alone.
- Dialogs manage focus appropriately.
- Text and interactive states meet the project’s contrast target.

---

## 17. Implementation Checklist for Fixing the Existing Frontend

Before making large changes, inspect the actual repository and test the current implementation.

1. Inventory routes, shared layouts, components, form libraries, authentication configuration, and dependencies.
2. Identify broken or duplicated navigation and ensure each role sees the correct menu.
3. Map the current user journey from homepage → event details → sign-up/sign-in → registration → dashboard.
4. Fix the core journey before polishing secondary pages.
5. Establish shared design tokens and standardize typography, spacing, buttons, inputs, cards, badges, and dialogs.
6. Implement all empty/loading/error/success states for each data-backed page.
7. Replace long, intimidating forms with progressive steps and conditional fields.
8. Ensure the participant dashboard displays state-specific next actions.
9. Give organizers a dedicated operational layout and a simple event-creation wizard.
10. Test team joining under duplicate and concurrent requests.
11. Verify permission checks on the server, not only in the frontend.
12. Test mobile layouts, keyboard navigation, contrast, and 200% zoom.
13. Remove dead buttons, placeholder routes, fake counts, and production demo shortcuts.
14. Run lint, type checks, tests, and a production build. Fix the underlying causes rather than suppressing errors.

### Required test scenarios

- Visitor opens a published event with registration closed.
- User signs in while trying to register and returns to the same event afterward.
- External student signs up and does not receive PREC-specific values by default.
- User submits an invalid form and retains valid field values.
- Two users attempt to join the final available team slot simultaneously.
- User tries to access an organizer URL without permission.
- Coordinator scans a participant who is already checked in.
- Organizer saves an incomplete draft and returns to finish it.
- Organizer tries to publish an event with invalid dates.
- User opens each main flow on a narrow mobile viewport.
- Network failure occurs during registration, team join, publish, and submission.

---

## 18. Repository-Specific Notes

The original specification references specific local file paths such as `src/app/globals.css`, registration pages, judge forms, and server actions. These paths may or may not match the current repository. Inspect the actual files before changing them.

The previous document also included a database URL containing a password. Do not copy that value into this specification, source code, screenshots, issue trackers, or commits. Use `.env.local` for local configuration and deployment environment variables for production.

For Prisma migrations:
- Use migrations as the repeatable source of schema changes in a shared or production environment.
- Review generated migrations before deploying.
- Do not casually run destructive schema operations against production data.
- Confirm the chosen database provider’s pooling and direct-connection requirements before configuring `DATABASE_URL` and `DIRECT_URL`.

For authentication:
- Keep the installed Auth.js / NextAuth version and its configuration consistent. Avoid mixing examples from incompatible versions.
- Configure production URLs and secrets through the deployment environment.
- Verify that any session strategy used by the app supports the authorization and revocation behavior required by the product.

---

## 19. Definition of Done

PravaraHack is ready for a public MVP when a real student can discover an event, understand its rules, create an account, register, create or join a team, and see the correct status on their dashboard—and an authorized organizer can publish an event and manage registrations—without broken controls, confusing state changes, inaccessible layouts, or unauthorized access.

A visually polished page alone is not done. The interaction, validation, persistence, permissions, responsive behavior, and recovery states must all work together.
