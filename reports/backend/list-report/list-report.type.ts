import type { ListLeadsInput } from '@/leads/backend/list-leads/list-leads.type';

export type ListReportInput = ListLeadsInput;

export type ReportRow = {
	user: {
		id: string;
		name: string;
	};
	totalLeads: number;
	nonBillable: number;
	billable: number;
};

export type ListReportResult = {
	rows: ReportRow[];
	total: number;
	page: number;
	limit: number;
};
