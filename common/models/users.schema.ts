import { Schema, model, models } from 'mongoose';
import { UserRole } from '../constants/user-roles.enum';

const UserSchema = new Schema(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true, trim: true },
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
		team_id: {
			type: Schema.Types.ObjectId,
			ref: 'teams',
			required: false,
		},
		created_by: {
			type: Schema.Types.ObjectId,
			ref: 'users',
			required: false,
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
