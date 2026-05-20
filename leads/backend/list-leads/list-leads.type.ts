export type ListLeadsInput = {
	limit?: number;
	startDate?: Date;
	endDate?: Date;
	status?: 'billable' | 'non billable' | 'pending';
	search?: string;
};

export type ListedLead = {
	id: string;
	customerName: string;
	customerNumber: string;
	loanType: string;
	status: 'billable' | 'non billable' | 'pending';
	statusReason?: string;
	updatedAt: string;
	created_by: {
		id: string;
		name: string;
	};
};
