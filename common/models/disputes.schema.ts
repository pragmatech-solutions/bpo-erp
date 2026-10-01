import { Schema, model, models } from 'mongoose';
import { DisputeStatus } from '@/common/constants/dispute-status.enum';

const DisputeSchema = new Schema(
	{
		lead_id: { type: Schema.Types.ObjectId, ref: 'leads', required: true },
		status: {
			type: String,
			enum: Object.values(DisputeStatus),
			default: DisputeStatus.UNRESOLVED,
		},
		recording_link: { type: String, required: false },
		qa_notes: { type: String, required: false },
		loan_officer_notes: { type: String, required: false },
		decision_notes: { type: String, required: false },
		created_by: { type: Schema.Types.ObjectId, ref: 'users', required: true },
		deleted_at: { type: Date, required: false },
		deleted_by: { type: Schema.Types.ObjectId, ref: 'users', required: false },
		updated_by: { type: Schema.Types.ObjectId, ref: 'users', required: false },
	},
	{
		timestamps: {
			updatedAt: 'updated_at',
			createdAt: 'created_at',
		},
	},
);

DisputeSchema.index(
	{ lead_id: 1, status: 1 },
	{
		unique: true,
		partialFilterExpression: {
			status: DisputeStatus.UNRESOLVED,
			deleted_at: { $exists: false },
		},
	},
);
DisputeSchema.index({ created_at: -1 });
DisputeSchema.index({ created_by: 1, created_at: -1 });
DisputeSchema.index({ deleted_at: 1 });

export const Disputes = models.disputes || model('disputes', DisputeSchema);
