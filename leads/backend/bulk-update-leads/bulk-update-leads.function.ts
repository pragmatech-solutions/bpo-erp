import { Types } from 'mongoose';
import { requireAdmin } from '@/common/backend/authorization.function';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import {
	bulkUpdateLeadsInputSchema,
	type BulkUpdateLeadsInput,
} from './bulk-update-leads.input-schema';

export type BulkUpdateLeadsResponse = {
	success: boolean;
	message: string;
	matchedCount: number;
	modifiedCount: number;
};

function getUniqueObjectIds(leadIds: string[]) {
	const uniqueLeadIds = Array.from(new Set(leadIds));

	if (uniqueLeadIds.some((id) => !Types.ObjectId.isValid(id))) {
		throw new Error('Lead not found');
	}

	return uniqueLeadIds.map((id) => new Types.ObjectId(id));
}

export async function bulkUpdateLeads(
	input: BulkUpdateLeadsInput,
): Promise<BulkUpdateLeadsResponse> {
	await connectToDatabase();
	const currentUser = await requireAdmin();
	const validatedInput = bulkUpdateLeadsInputSchema.parse(input);
	const leadObjectIds = getUniqueObjectIds(validatedInput.leadIds);
	const activeLeadFilter = {
		_id: { $in: leadObjectIds },
		deleted_at: { $exists: false },
	};

	const activeLeadCount = await Leads.countDocuments(activeLeadFilter);
	if (activeLeadCount !== leadObjectIds.length) {
		throw new Error('One or more leads not found');
	}

	if (validatedInput.action === 'mark_deleted') {
		const result = await Leads.updateMany(activeLeadFilter, {
			$set: {
				deleted_at: new Date(),
				deleted_by: new Types.ObjectId(currentUser.id),
			},
		});

		return {
			success: true,
			message: `${result.modifiedCount} lead(s) marked as deleted`,
			matchedCount: result.matchedCount,
			modifiedCount: result.modifiedCount,
		};
	}

	const nonBillableSelectionCount = await Leads.countDocuments({
		...activeLeadFilter,
		status: { $ne: LeadStatus.BILLABLE },
	});

	if (nonBillableSelectionCount > 0) {
		throw new Error('Only billable leads can be marked paid or unpaid');
	}

	const paymentStatus =
		validatedInput.action === 'mark_paid' ? 'paid' : 'unpaid';
	const result = await Leads.updateMany(activeLeadFilter, {
		$set: { payment_status: paymentStatus },
	});

	return {
		success: true,
		message: `${result.modifiedCount} lead(s) marked as ${paymentStatus}`,
		matchedCount: result.matchedCount,
		modifiedCount: result.modifiedCount,
	};
}
