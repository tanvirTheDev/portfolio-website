# Portfolio — Next.js 16 + Sanity CMS

Brutalist full-stack developer portfolio. Built with Next.js 16 (App Router), Tailwind CSS v4, Sanity v3, GSAP, Matter.js, and Lenis.

---

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in every value in `.env.local` — see comments in the file for where to find each one. Minimum set needed to run locally:

| Variable                         | Required for                                              |
| -------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | All content                                               |
| `NEXT_PUBLIC_SANITY_DATASET`     | All content                                               |
| `NEXT_PUBLIC_SANITY_API_VERSION` | All content                                               |
| `SANITY_API_TOKEN`               | Seed script                                               |
| `SANITY_WEBHOOK_SECRET`          | Revalidation webhook                                      |
| `RESEND_API_KEY`                 | Contact form email (optional — logs to console if absent) |
| `CONTACT_TO_EMAIL`               | Contact form destination                                  |

### 3. Add Departure Mono font

Download `DepartureMono-Regular.woff2` from [departuremono.com](https://departuremono.com) (SIL OFL licensed) and place it at:

```
public/fonts/DepartureMono-Regular.woff2
public/fonts/LICENSE-DepartureMono.txt
```

Without this file, the display font falls back to JetBrains Mono.

### 4. Set up Sanity

Open the embedded Studio after starting the dev server:

```bash
npm run dev
# navigate to http://localhost:3000/studio
```

### 5. Seed content

After setting `SANITY_API_TOKEN`:

```bash
npm run seed
```

Populates your dataset with placeholder projects, experience, certificates, and site settings. Replace with real data via Sanity Studio.

### 6. Install git hooks (first time)

```bash
npm run prepare
```

---

## Development

```bash
npm run dev          # http://localhost:3000
npm run typecheck    # TypeScript strict check
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check)
```

## Build

```bash
npm run build
npm start
```

---

## Deployment

Deploy to Vercel. Set all variables from `.env.local.example` in your Vercel project settings.

After deploying, create a Sanity webhook:

- URL: `https://your-domain.com/api/revalidate`
- Secret: `SANITY_WEBHOOK_SECRET`
- Trigger: on document publish/unpublish

---

## Contact Form Fallback

If `RESEND_API_KEY` is not set, submissions are logged server-side with a `[CONTACT]` prefix and the client receives success. Set the key before launch.

---

## Stack

| Layer      | Technology                                 |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 16 (App Router, TypeScript strict) |
| Styling    | Tailwind CSS v4 + CSS Modules              |
| CMS        | Sanity v3 (embedded at `/studio`)          |
| Animation  | GSAP + ScrollTrigger, Lenis, Framer Motion |
| Physics    | Matter.js                                  |
| Email      | Resend                                     |
| Validation | Zod                                        |
