import { Schema, model, models } from 'mongoose';

const LeadSchema = new Schema(
	{
		created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		status: {
			type: String,
			enum: ['billable', 'non billable'],
			required: true,
		},
		status_reason: {
			type: String,
			required: function () {
				return this.status === 'non billable';
			},
		},
		customer_number: { type: String, required: true },
		customer_name: { type: String, required: true },
		loan_type: { type: String, required: true },
	},
	{
		timestamps: {
			updatedAt: 'updated_at',
			createdAt: 'created_at',
		},
	},
);

export const Leads = models.leads || model('leads', LeadSchema);
