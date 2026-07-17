import { Types } from 'mongoose';
import {
	requireAdmin,
	requireAuthenticatedUser,
} from '@/common/backend/authorization.function';
import { connectToDatabase } from '@/common/database';
import { Campaigns } from '@/common/models/campaigns.schema';
import {
	createCampaignInputSchema,
	listCampaignsInputSchema,
	updateCampaignInputSchema,
	type CreateCampaignInput,
	type ListCampaignsInput,
	type UpdateCampaignInput,
} from './campaigns.input-schema';
import type { CampaignListData, CampaignListItem } from './campaigns.type';

type CampaignDocument = {
	_id: Types.ObjectId;
	name: string;
	is_active: boolean;
	created_at: Date;
	created_by?: { name?: string } | null;
};

function mapCampaign(campaign: CampaignDocument): CampaignListItem {
	return {
		id: campaign._id.toString(),
		name: campaign.name,
		isActive: campaign.is_active,
		createdBy: campaign.created_by?.name || 'Unknown',
		createdAt: campaign.created_at.toISOString(),
	};
}

export async function listCampaigns(
	input: ListCampaignsInput = {},
): Promise<CampaignListData> {
	await connectToDatabase();
	await requireAdmin();

	const validatedInput = listCampaignsInputSchema.parse(input);
	const filter: Record<string, unknown> = {};

	if (validatedInput.status === 'active') filter.is_active = true;
	if (validatedInput.status === 'disabled') filter.is_active = false;
	if (validatedInput.search) {
		filter.name = { $regex: new RegExp(validatedInput.search, 'i') };
	}

	const skip = (validatedInput.page - 1) * validatedInput.limit;
	const [campaigns, total] = await Promise.all([
		Campaigns.find(filter)
			.populate('created_by', 'name')
			.sort({ created_at: -1 })
			.skip(skip)
			.limit(validatedInput.limit)
			.lean<CampaignDocument[]>(),
		Campaigns.countDocuments(filter),
	]);

	return {
		campaigns: campaigns.map(mapCampaign),
		total,
		page: validatedInput.page,
		limit: validatedInput.limit,
	};
}

export async function listActiveCampaignNames(): Promise<string[]> {
	await connectToDatabase();
	await requireAuthenticatedUser();

	const campaigns = await Campaigns.find({ is_active: true })
		.select('name')
		.sort({ name: 1 })
		.lean<Array<{ name: string }>>();

	return campaigns.map((campaign) => campaign.name);
}
export async function createCampaign(input: CreateCampaignInput) {
	await connectToDatabase();
	const currentUser = await requireAdmin();
	const validatedInput = createCampaignInputSchema.parse(input);
	const existingCampaign = await Campaigns.findOne({
		name: validatedInput.name,
	}).lean();

	if (existingCampaign) {
		throw new Error('Campaign already exists');
	}

	const campaign = await Campaigns.create({
		name: validatedInput.name,
		is_active: validatedInput.isActive,
		created_by: currentUser.id,
	});

	return {
		id: campaign._id.toString(),
		name: campaign.name,
		isActive: campaign.is_active,
	};
}

export async function updateCampaign(input: UpdateCampaignInput) {
	await connectToDatabase();
	await requireAdmin();
	const validatedInput = updateCampaignInputSchema.parse(input);

	if (!Types.ObjectId.isValid(validatedInput.id)) {
		throw new Error('Campaign not found');
	}

	if (validatedInput.name) {
		const duplicateCampaign = await Campaigns.findOne({
			_id: { $ne: validatedInput.id },
			name: validatedInput.name,
		}).lean();

		if (duplicateCampaign) {
			throw new Error('Campaign already exists');
		}
	}

	const updateData: Record<string, unknown> = {};
	if (validatedInput.name !== undefined) updateData.name = validatedInput.name;
	if (validatedInput.isActive !== undefined) {
		updateData.is_active = validatedInput.isActive;
	}

	const campaign = await Campaigns.findByIdAndUpdate(
		validatedInput.id,
		updateData,
		{ new: true },
	).lean<CampaignDocument>();

	if (!campaign) {
		throw new Error('Campaign not found');
	}

	return mapCampaign(campaign);
}


