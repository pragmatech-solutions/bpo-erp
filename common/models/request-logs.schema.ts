import { Schema, model, models } from 'mongoose';

const RequestLogSchema = new Schema(
	{
		attributes: { type: Schema.Types.Mixed }, // Handles dynamic metadata
	},
	{
		timestamps: {
			updatedAt: 'updated_at',
			createdAt: 'created_at',
		},
	},
);

export const RequestLogs =
	models.request_logs || model('request_logs', RequestLogSchema);
