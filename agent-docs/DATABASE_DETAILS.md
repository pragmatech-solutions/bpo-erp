All the schemas are in /common/models folder. And they are supposed to be there. All new schemas are also supposed to be put there
Any database changes require explicit change by user.
Database variables are snake_case_variables. No other case is valid for database variable name.
Discuss database changes before changing or creating old/new schemas. Explicit user permission is required for this.

## Teams

The `teams` schema holds only `name` and `status`. It deliberately has **no** `team_lead` field — leadership and membership are recorded in one place only, on the user document (`role` + `team_id`). This allows a team to have several team leads and to mix agents with loan officers. See `agent-docs/ROLES.md` for the full model.
