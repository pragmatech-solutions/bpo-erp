import { Schema, model, models } from 'mongoose';

const CampaignSchema = new Schema(
	{
		name: { type: String, required: true, unique: true },
		is_active: { type: Boolean, default: true },
		created_by: { type: Schema.Types.ObjectId, ref: 'users', required: true },
	},
	{
		timestamps: {
			updatedAt: 'updated_at',
			createdAt: 'created_at',
		},
	},
);

export const Campaigns =
	models.campaigns || model('campaigns', CampaignSchema);
