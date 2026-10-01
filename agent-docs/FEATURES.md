## FEATURES

## DONE WORK

1. Project setup with husky, prettier, commitlint, and branch-protection hooks
2. Authentication: sign-up and sign-in (JWT session via `jose`, bcrypt password hashing). Forgot-password / change-password are not yet implemented.
3. Authenticated app shell with responsive sidebar and header
4. Lead management: create, list (search/filter/date-range), edit, and admin billable/non-billable status updates with required reason
5. Lead metadata: campaign association, agent listing, payment status (paid/unpaid), optional loan officer name, required lead username
6. PWA support: manifest, icons, service worker (Serwist)
7. Team management: teams (admin-managed) holding both agents and loan officers, one or more team leads per team, team-scoped dashboard and member status management, team performance views
8. User management: admin-managed role/status/team assignment for all users
9. Campaign management: admin-managed create/enable/disable
10. Quality Assurance (QA) role and workflow
11. Disputes: QA or admin opens a dispute on a lead (required QA notes, optional recording link); the assigned loan officer can add notes while it is unresolved; admin/manager resolves it as billable or non-billable with required decision notes (updates the lead status). The lead card shows a "Dispute Unresolved" / "Dispute Resolved" pill.

## CURRENT WORK TO BE DONE

1. Forgot-password / change-password flows, frontend and backend
