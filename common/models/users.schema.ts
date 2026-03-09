import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		status: { type: String, default: 'active' },
		role: {
			type: String,
			enum: ['agent', 'team_lead', 'admin'],
			required: true,
		},
	},
	{
		timestamps: {
			updatedAt: 'updated_at',
			createdAt: 'created_at',
		},
	},
);

export const Users = models.users || model('users', UserSchema);
