# Gabe OS

A personal AI-powered life operating system. It opens on a calm blue wave; tap it to dive into a 3D module carousel and your workspaces.

## Stack
- **Front end:** `public/` (installable PWA for iPhone, iPad, Mac and Windows)
- **API:** `src/worker.js`, a Cloudflare Worker serving `/api/*`
- **Database:** Cloudflare D1, binding `DB`. Tables are created automatically on first request.
- **Hosting:** Cloudflare Workers with static assets. Every push to `main` deploys automatically through Workers Builds.

## First run
Open the site and create your passcode. It is stored hashed (PBKDF2) in D1. Sessions last one year per device.

## API
All routes need a signed-in session cookie, or `Authorization: Bearer <API_TOKEN>` when the `API_TOKEN` secret is set (this is for the upcoming MCP server).

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/state` | Everything: events, tasks, notes, habits, settings, assistant log |
| POST/PATCH/DELETE | `/api/tasks[/:id]` | `{title, tag, due, note, done}` |
| POST/PATCH/DELETE | `/api/events[/:id]` | `{title, min, day, tag}`, where `min` is minutes after midnight and `day` is `"daily"` or `YYYY-MM-DD` |
| POST/DELETE | `/api/notes[/:id]` | `{text}` |
| PUT | `/api/settings` | `{clock, notify}` |

Tags: Faith, School, People, Elevate, Personal, Fitness.

## Roadmap
1. ✅ Foundation: web app, sign-in, database, PWA
2. AI tool router: `/api/assist` calling Roteo with tool calling
3. MCP server, so ChatGPT, Claude and Claude Code can use Gabe OS
4. Integrations: Google Calendar, email, push notifications, 3D icons
