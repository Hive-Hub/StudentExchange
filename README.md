# StudentExchange

**Tagline:** Learn. Build. Exchange. Grow.

StudentExchange is a public, zero-login-wall student technology platform where learners can discover free learning resources, explore student-built projects, exchange unused electronic hardware, track hackathons and competitions, and participate in student-led cloud builder initiatives.

## Architecture

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, React Router (`react-router-dom`), Lucide Icons (`lucide-react`).
- **Backend:** Express (`server.ts`) running with Vite middleware in development and static `dist/` serving in production on port `3000`.
- **Database:** Embedded SQLite via Node.js built-in `node:sqlite` (`data/studentexchange.db`) with parameterized queries and seeded demonstration content (`is_demo = 1`).

## Public Routes

- `/` — Homepage (Hero, Editable Platform Stats, Explore Platform, Featured Learning, Project Showcase, Hardware Exchange, Competitions, AWS Student Builder Community, How It Works, Community CTA)
- `/explore` — Unified platform directory search
- `/learning` — Learning Hub with category, difficulty, free/paid, and search filters
- `/projects` — Student Project Showcase with category filters and public project submission queue
- `/hardware` — Hardware Exchange marketplace (Buy, Sell, Exchange, Donate)
- `/hardware/:id` — Component details and direct seller contact without registration
- `/competitions` — Hackathons, AWS challenges, coding contests, innovation programs, internships, and workshops
- `/community` — Student communities and upcoming events
- `/aws-builders` — Student-led AWS Student Builder Community learning paths and sessions
- `/about`, `/contact`, `/privacy`, `/terms`

## Content Management (`/admin`)

- Protected `/admin` route separated from public browsing.
- Set `ADMIN_PASSCODE` in environment secrets, or use the one-time first-run password claim form on `/admin` (hashed with `scrypt` + random salt).
- Supports editing homepage platform stats, approving/rejecting student project submissions, managing learning resources, hardware listings, competitions, community events, and reviewing contact/hardware inquiries.

## Local Installation & Build

```bash
npm install
npm run dev
```

For production build and start:

```bash
npm run build
npm run start
```
