import { Schema, model, models } from 'mongoose';
import { LeadStatus } from '../constants/lead-status.enum';
import { LoanType } from '../constants/loan-type.enum';

const LeadSchema = new Schema(
	{
		created_by: { type: Schema.Types.ObjectId, ref: 'users', required: true },
		status: {
			type: String,
			enum: Object.values(LeadStatus),
			default: LeadStatus.PENDING,
		},
		status_reason: {
			type: String,
			required: function () {
				return this.status === LeadStatus.NON_BILLABLE;
			},
		},
		customer_number: { type: String, required: true },
		customer_name: { type: String, required: true },
		campaign: { type: String, required: true },
		loan_officer_name: { type: String, required: false },
		loan_type: {
			type: String,
			enum: Object.values(LoanType),
			required: true,
		},
		loan_balance: { type: Number, required: false },
		home_value: { type: Number, required: false },
		paymentStatus: {
			type: String,
			enum: ['paid', 'unpaid'],
			default: 'unpaid',
		},
	},
	{
		timestamps: {
			updatedAt: 'updated_at',
			createdAt: 'created_at',
		},
	},
);

export const Leads = models.leads || model('leads', LeadSchema);
