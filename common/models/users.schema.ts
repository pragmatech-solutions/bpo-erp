import { Schema, model, models } from 'mongoose';
import { UserRole } from '../constants/user-roles.enum';

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
			enum: Object.values(UserRole),
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
