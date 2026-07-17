export type CampaignListItem = {
	id: string;
	name: string;
	isActive: boolean;
	createdBy: string;
	createdAt: string;
};

export type CampaignListData = {
	campaigns: CampaignListItem[];
	total: number;
	page: number;
	limit: number;
};
