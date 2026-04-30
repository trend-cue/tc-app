# TrendCue

Discover trending posts across TikTok, Instagram, and X, and organize them into projects.

Built with Next.js 15 (App Router, Turbopack), React 19, Supabase (Auth + Postgres), and Tailwind CSS v4. Trend data is currently served from in-repo mock data; persistence (auth, projects, saved posts) runs against Supabase.

## Features

- Email/password auth with Supabase, session managed via SSR cookies in [middleware](src/middleware.ts)
- Discover view: clustered trending posts with filters, search, and a detail panel
- Projects view: save posts into colored projects scoped per user (RLS-enforced)
- Server and client Supabase helpers in [src/lib/supabase/](src/lib/supabase/)

## Getting started

```bash
cp .env.local.example .env.local   # fill in Supabase URL + anon key
npm install
npm run dev                         # http://localhost:3000
```

Apply the schema to your Supabase project:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260429_initial_schema.sql
```

Scripts: `dev`, `build`, `start`, `lint`.

## System architecture

```mermaid
flowchart LR
    User([User Browser])

    subgraph Next["Next.js 15 App (Vercel)"]
        MW[middleware.ts<br/>Auth gate]
        Pages[App Router pages<br/>/login · /dashboard · /auth/callback]
        Client[Client components<br/>app-shell, discover-view,<br/>projects-view, detail-panel]
        SBClient[lib/supabase/client.ts]
        SBServer[lib/supabase/server.ts]
        Mock[(lib/mock-data.ts<br/>trend posts + clusters)]
    end

    subgraph Supabase["Supabase"]
        Auth[Auth<br/>email/password]
        DB[(Postgres<br/>projects, project_posts<br/>+ RLS)]
    end

    User -->|HTTP| MW
    MW -->|getUser| Auth
    MW --> Pages
    Pages --> Client
    Client --> SBClient
    Pages --> SBServer
    SBClient -->|auth, queries| Auth
    SBClient -->|RLS-scoped CRUD| DB
    SBServer --> Auth
    SBServer --> DB
    Client --> Mock
```

Request flow: every request passes through [middleware.ts](src/middleware.ts), which refreshes the Supabase session cookie and redirects unauthenticated users to `/login`. The dashboard is a client shell that reads trends from mock data and writes saved posts to Supabase via the browser client. Server components (e.g. [app/page.tsx](src/app/page.tsx)) use the SSR client for the initial auth check.

## Database schema

```mermaid
erDiagram
    AUTH_USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ PROJECT_POSTS : contains

    AUTH_USERS {
        uuid id PK
        text email
    }
    PROJECTS {
        uuid id PK
        uuid user_id FK
        text name
        text color
        timestamptz created_at
        timestamptz updated_at
    }
    PROJECT_POSTS {
        uuid project_id PK,FK
        text post_id PK
        timestamptz saved_at
    }
```

Notes:

- `auth.users` is managed by Supabase Auth.
- `project_posts.post_id` is currently a string id from mock data; it will become a foreign key once a real `posts` table is introduced.
- Every table has RLS enabled. Policies in [supabase/migrations/20260429_initial_schema.sql](supabase/migrations/20260429_initial_schema.sql) restrict reads/writes to rows owned by `auth.uid()`.
- A `projects_updated_at` trigger keeps `updated_at` fresh on update.

## Project layout

```
src/
  app/                Next.js App Router (login, dashboard, auth/callback)
  components/         UI: app-shell, discover-view, projects-view, detail-panel, ...
  lib/
    supabase/         SSR + browser Supabase clients
    types.ts          Post, Cluster, Project, helpers
    mock-data.ts      Trend data fixture
  middleware.ts       Session refresh + auth redirects
supabase/migrations/  SQL schema + RLS
```

## Deployment

Configured for Vercel. The login route is rendered dynamically (no prerender) so Supabase cookies resolve at request time. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the Vercel project environment.
