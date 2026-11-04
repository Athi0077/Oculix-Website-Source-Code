# Oculix — React frontend and backend source

Complete editable source recovered from the Oculix hosted source repository on 2 November 2026, reorganized for a GitHub handover to Azhaghiri. Includes the website, client portal, administration, Google/Firebase sign-in, Razorpay order verification, AI Odyssey, Live AI Lab and exam, and the 3D office experience, plus the tracked media assets and database migrations.

This is React + TypeScript (`.tsx`), using Vinext's Next-compatible React server rendering and Cloudflare Workers/D1. **Frontend and backend are separate source folders in one application runtime.** The backend is not an independent Express/Node HTTP server. The original server-rendered pages still call server services directly; browser requests use the existing `/api/*` routes. GitHub stores and reviews this code; GitHub Pages alone cannot run the database, authentication or payment endpoints.

## Folder structure

- `frontend/src/assets/styles/`: site, course, tour and exam styles.
- `frontend/public/assets/`: original images and other static media.
- `frontend/src/components/`: reusable React components, admin panels, checkout and 3D UI.
- `frontend/src/context/hooks/`: existing React hooks.
- `frontend/src/pages/`: implementations of every public, portal and admin page.
- `frontend/src/routes/`: root layout.
- `frontend/src/services/`: browser Firebase authentication/session synchronization.
- `frontend/src/utils/`: browser utility functions.
- `frontend/src/firebase.ts`: public Firebase web configuration.
- `frontend/app/`: thin framework route adapters; normally edit `src/pages` or backend controllers instead.
- `backend/src/config/`: server Firebase token verification and configuration notes.
- `backend/src/controllers/`: all 13 existing API endpoint implementations.
- `backend/src/middleware/`: server identity and sign-in requirements.
- `backend/src/models/`: database schema, D1 access and SQL migrations.
- `backend/src/routes/registry.json`: endpoint-to-controller map.
- `backend/src/services/`: application services, course content, payment helpers and approved chatbot knowledge.
- `backend/checks/`, `backend/tests/`: retained source regression checks.
- `docs/`: GitHub handover and deployment instructions.

## Run locally

Install Node.js 22.13+ (Node 22 LTS recommended). Open a terminal in this root folder:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Use `npm install` only when intentionally updating dependencies; commit the resulting `package-lock.json`.

Local D1 starts empty. Run `npm run db:local` before using stored data; this applies the included migrations only to the local database. See `docs/DEPLOYMENT.md`. Copy `frontend/.dev.vars.example` to `frontend/.dev.vars` and configure only the services you need. Never commit real credentials. Firebase web configuration is public; Firebase service account credentials and Razorpay/Gemini secrets are not.

Google session cookies are `Secure`, so real sign-in requires an HTTPS preview or deployed HTTPS hostname authorized in Firebase. A plain HTTP localhost preview is useful for page work, but is not proof of a complete login/payment flow. The legacy fake/platform identity path is disabled by default in this export.

```sh
npm run check:imports
npm run typecheck
npm test
npm run build
```

## Give Azhaghiri access

See `docs/GITHUB-HANDOVER.md`. Upload the extracted contents of this folder into a **private repository**, invite his GitHub username as a collaborator, and review pull requests before merging. No repository has been created and no collaborator access has been granted by this ZIP.

## Deployment and data

This is a source export, not a database backup. It contains no live customer records, payment secrets, admin passcodes or production runtime secret values. Preserve and attach the existing production D1 database when deploying; do not replace it with an empty database. Source asset files are included; externally hosted videos/URLs remain external dependencies.

The live Oculix website has not been changed by this handover. Azhaghiri's commits will not automatically update it unless you deliberately connect deployment. Read `docs/DEPLOYMENT.md` before deploying; live Google sign-in, Razorpay capture, enrolment, exam and paid session access must be checked on HTTPS with the actual runtime configuration.
