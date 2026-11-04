# Runtime and deployment

The retained app runs on Cloudflare Workers with Vinext, React Server Components and D1. Do not select a static-only hosting plan. The React browser bundle and server backend are built together by `npm run build` from the repository root; output is in `frontend/dist`.

## Database

All tracked migrations are in `backend/src/models/migrations/`. The local Vite configuration creates a local binding named `DB` with a development-only placeholder ID. That ID is not a real production database and must not be used as one.

For local data, configure Wrangler migrations against this directory and apply them to the same local D1 persistence store used by the dev server. For production, attach your existing D1 database under `DB`, back it up first, compare its existing migration history, and apply only pending migrations. Never execute an unreviewed full migration replay on a live database. The generated build includes migration files under `dist/.openai/drizzle` for the original host's migration workflow.

## Runtime configuration

- `DB`: Cloudflare D1 database binding, required for stored records and signed-in application features.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: server runtime credentials. Existing code deliberately requires live-mode keys for real paid enrolments; do not bypass the capture/signature checks.
- `GEMINI_API_KEY`: optional chatbot provider credential; FAQ fallback is retained when absent.
- `GEMINI_MODEL`: optional model name supported by your provider account.
- `TRUST_PLATFORM_AUTH_HEADERS`: leave false for an independent deployment. Set true only on the original platform if its trusted edge strips client identity headers and supplies verified values.

The public Firebase web config is in `frontend/src/firebase.ts`; server token verification must continue to use the same Firebase project. Add every intended HTTPS hostname to Firebase Authentication's authorized domains. Do not mix the OITS executor Firebase project with the Oculix website project.

The source hosting file intentionally has no production project ID. A GitHub clone must not accidentally deploy into the existing live Site. If using Sites to deploy this export, bind it through the supported Sites workflow. For independent Workers hosting, configure the real worker name, D1 ID, runtime secrets, assets and custom domain through your own account instead of treating the local binding config as production configuration.

## Validate on staging HTTPS before release

Check Google sign-in/sign-out and return URLs, owner-only admin access, customer record isolation, Razorpay order ownership/signature/captured amount, repeated verification idempotency, paid session access, course/exam completion and certificate verification, uploads or remote media if present, public forms, responsive navigation and 360° WebGL support.

Automated local checks do not establish that production Firebase, Razorpay, remote media, database bindings or Gemini credentials are working. No live payment was made in preparing this export.
