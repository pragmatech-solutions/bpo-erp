export type AgentListItem = {
	id: string;
	name: string;
	status?: 'active' | 'inactive' | 'blocked';
};
