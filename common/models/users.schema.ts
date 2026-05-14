import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		status: {
			type: String,
			default: 'inactive',
			enum: ['active', 'inactive', 'blocked'],
		},
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
