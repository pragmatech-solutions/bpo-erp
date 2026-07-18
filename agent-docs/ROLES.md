## ROLES

Four types of users: admin, team_lead, agent, and quality_assurance. Defined in `common/constants/user-roles.enum.ts`.

### AGENT ROLE

Basic features, an agent can only create leads, and then he can see their status only. He can only deal with his own leads. Nothing else.

### TEAM LEAD ROLE

Team lead is implemented and scoped to the team they lead via `team_id` on their user document.

- Sees a team dashboard (`teams/backend/get-team-dashboard`) with per-agent lead analytics (pending/billable/non-billable counts) and campaign breakdowns for their own team only.
- Can list and update the agents on their own team (`users/backend/manage-users`), but can only change an agent's `status` to `active` or `inactive` — cannot change role or team assignment, and cannot manage agents outside their team.
- Does not have access to team management (create teams, assign leads), user role/team assignment, or campaign management — those are admin-only.

### QUALITY ASSURANCE (QA) ROLE

Review-focused role. Can view the lead list but is redirected away from the dashboard straight to `/leads/list`. No lead creation, team, user, or campaign management access.

### ADMIN ROLE

Admin can see all the leads, and update them with billable and non billable status. When he is making a lead non-billable, he must provide a reason for it. Admin also has exclusive access to: team management (create teams, assign a team lead and agent members — `teams/backend/manage-teams`), user management (role, status, team assignment — `users/backend/manage-users`), and campaign management (create/enable/disable campaigns — `campaigns/backend/campaigns`).
