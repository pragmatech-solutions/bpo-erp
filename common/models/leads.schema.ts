import { Schema, model, models } from 'mongoose';
import { LeadStatus } from '../constants/lead-status.enum';
import { LoanType } from '../constants/loan-type.enum';

const LeadSchema = new Schema(
	{
		created_by: { type: Schema.Types.ObjectId, ref: 'users', required: true },
		lead_type: {
			type: String,
			default: 'standard',
			enum: ['standard', 'call_transfer'],
		},
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
		customer_number_normalized: {
			type: String,
			required: false,
			index: { unique: true, sparse: true },
		},
		customer_name: { type: String, required: true },
		username: { type: String, required: true },
		campaign: { type: String, required: true },
		loan_officer_id: {
			type: Schema.Types.ObjectId,
			ref: 'users',
			required: false,
		},
		loan_officer_name: { type: String, required: false },
		loan_officer_phone_number: { type: String, required: false },
		loan_type: {
			type: String,
			enum: Object.values(LoanType),
			required: true,
		},
		loan_balance: { type: Number, required: false },
		home_value: { type: Number, required: false },
		payment_status: {
			type: String,
			enum: ['paid', 'unpaid'],
			default: 'unpaid',
		},
		deleted_at: { type: Date, required: false },
		deleted_by: {
			type: Schema.Types.ObjectId,
			ref: 'users',
			required: false,
		},
		call_transfer: {
			first_name: { type: String, required: false },
			last_name: { type: String, required: false },
			origin_phone: { type: String, required: false },
			address: { type: String, required: false },
			city: { type: String, required: false },
			state: { type: String, required: false },
			zip: { type: String, required: false },
			email: { type: String, required: false },
			home_value: { type: Number, required: false },
			mortgage_balance: { type: Number, required: false },
			mortgage_rate_type: { type: String, required: false },
			property_type: { type: String, required: false },
			multiple_properties: { type: String, required: false },
			mortgage_rate: { type: Number, required: false },
			cash_out_amount: { type: Number, required: false },
			loan_type: { type: String, required: false },
			loan_purpose: { type: String, required: false },
			credit: { type: String, required: false },
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


