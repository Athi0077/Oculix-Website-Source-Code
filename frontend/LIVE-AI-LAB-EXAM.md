# Live AI Lab — post-webinar assessment

Participant route: `/education/live-ai-lab/exam`. The existing paid webinar panel and `/portal` link here. Admin controls appear in the Live AI Lab section of `/admin`.

## Release flow
1. Set the webinar start time (IST) in the existing session settings.
2. After the 60-minute session ends, use the actual Zoom/Meet attendance report to tick each paid participant's attendance. Meeting-link clicks do not prove attendance; no attendance integration is claimed.
3. Choose the assessment closing time (IST; UI initially suggests seven days after the session) and select **Open assessment after webinar**. The server rejects opening before the configured session ends.
4. Registered, attendance-confirmed participants can start up to two attempts. Each has a server-defined 20-minute deadline, or the assessment closing time if sooner. Refreshing/closing the page does not restart the timer. Closing new attempts does not interrupt an existing attempt's deadline.
5. Answers autosave after edits and can be saved manually. On expiry the last server-saved answers are submitted; offline unsaved edits cannot be recovered by the server.
6. Fourteen MCQs are auto-scored server-side. The written prompt is reviewed by admin against six one-mark criteria. The passing score is 12/20. A final review is immutable; the user receives the combined score and feedback. A second attempt is available only after an unsuccessful first result is reviewed, while the exam is open.

No answer key is sent to participants. Questions are returned only for an active attempt. The question bank is stored in a server module. Paid registration and ownership are checked on every participant write. Admin operations reuse existing Oculix Google identity plus passcode-session authorization. A deterministic attempt ID prevents concurrent duplicate starts. Submitted attempts reject further changes.

D1 table: `lab_exam_attempts`. Existing content records hold per-event exam settings and attendance eligibility; these do not alter payment or joining-link settings. Nothing is automatically opened or marked attended on deployment.

## Certificate scope
The certificate design preview has not been wired into a PDF issuer. Passing status is recorded; the user is told Oculix will share the certificate separately. This change does not claim automatic certificate download, QR verification, email or Zoom/Meet attendance synchronisation.

## Checks
`node checks/lab-exam-check.cjs` tests authentication, paid and attendance eligibility, event-time release, hidden answer key, concurrent starts, ownership, MCQ scoring, written review, immutable finalisation, late-submission handling and two-attempt limit. Type-check and production build before publishing.
