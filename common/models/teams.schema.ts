import { Schema, model, models } from 'mongoose';

const TeamSchema = new Schema(
	{
		name: { type: String, required: true, unique: true },
		status: { type: String, default: 'active' },
	},
	{
		timestamps: {
			updatedAt: 'updated_at',
			createdAt: 'created_at',
		},
	},
);

export const Teams = models.teams || model('teams', TeamSchema);
