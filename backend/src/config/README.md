# Server configuration

`firebase-token.ts` verifies Google/Firebase ID tokens server-side. The public Firebase web configuration lives in `frontend/src/firebase.ts`.

Runtime bindings are supplied by Cloudflare: `DB` is the existing D1 database. Razorpay and Gemini credentials must be runtime secrets, never frontend environment variables. Copy `frontend/.dev.vars.example` for local configuration.

`TRUST_PLATFORM_AUTH_HEADERS` defaults to false in this export. Enable it only behind the original trusted edge that removes public incoming identity headers and injects verified ones. Normal Google authentication uses a verified secure cookie.
