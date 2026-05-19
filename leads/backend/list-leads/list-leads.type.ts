export type ListLeadsInput = {
	limit?: number;
	startDate?: Date;
	endDate?: Date;
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
