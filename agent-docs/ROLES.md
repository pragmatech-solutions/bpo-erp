## ROLES

Five types of users: admin, team_lead, agent, loan_officer, and quality_assurance. Defined in `common/constants/user-roles.enum.ts`.

### TEAMS

A team is a `teams` document (`name`, `status`) — it holds no reference to its members. Membership lives entirely on the user document via `team_id` plus `role`:

- **Team leads** — `role: team_lead` + `team_id`. A team may have **multiple team leads**; they are peers with identical scope over the team.
- **Team members** — `role: agent` or `role: loan_officer` + `team_id`. A team is mixed: it can hold agents and loan officers at the same time.
- Nobody else may hold a `team_id` (enforced in `users/backend/manage-users`).

The two member roles are measured on different fields, because loan officers never create leads — they are assigned them:

- An agent's leads are `leads.created_by === agentId`.
- A loan officer's leads are `leads.loan_officer_id === officerId`.
- A team's leads are the union of both (`common/backend/get-team-member-ids.function.ts`).

### AGENT ROLE

Basic features, an agent can only create leads, and then he can see their status only. He can only deal with his own leads. Nothing else.

### LOAN OFFICER ROLE

Handles the leads assigned to them. Loan officers do not create leads: they are picked from a dropdown by an agent/team lead/admin when a lead is created (optional on standard leads, required on call-transfer leads), and only officers who are `status: active` and `availability_status: active` are offered. They see `/leads/list` scoped to their own assigned leads and may set a lead to billable or non-billable with a reason. They cannot revert a lead to pending, mark it paid, or edit lead data. They have no dashboard. Being on a team does not widen what a loan officer can see.

### TEAM LEAD ROLE

Team lead is scoped to the team they lead via `team_id` on their user document.

- Sees a team dashboard (`teams/backend/get-team-dashboard`) with per-member lead analytics (pending/billable/non-billable counts) and campaign breakdowns for their own team only — covering both the agents and the loan officers on the team.
- Sees the leads created by their team's agents **and** the leads assigned to their team's loan officers. The member filter on `/leads/list` narrows to a single member; left unset it returns both sets.
- Can list and update the agents and loan officers on their own team (`users/backend/manage-users`), but can only change a member's `status` to `active` or `inactive` — cannot change role or team assignment, and cannot manage users outside their team.
- Does not have access to team management (create teams, assign leads), user role/team assignment, or campaign management — those are admin-only.

### QUALITY ASSURANCE (QA) ROLE

Review-focused role. Can view the lead list but is redirected away from the dashboard straight to `/leads/list`. No lead creation, team, user, or campaign management access.

### ADMIN ROLE

Admin can see all the leads, and update them with billable and non billable status. When he is making a lead non-billable, he must provide a reason for it. Admin also has exclusive access to: team management (create teams, assign team leads and agent/loan-officer members — `teams/backend/manage-teams`), user management (role, status, team assignment — `users/backend/manage-users`), and campaign management (create/enable/disable campaigns — `campaigns/backend/campaigns`). Reassigning a lead's loan officer after creation is admin-only.
