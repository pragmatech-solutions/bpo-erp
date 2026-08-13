import { Types } from 'mongoose';
import { Leads } from '@/common/models/leads.schema';

export function normalizeLeadContactNumber(contactNumber: string) {
	return contactNumber.replace(/\D/g, '');
}

export function isDuplicateLeadContactNumberError(error: unknown) {
	return Boolean(
		error &&
			typeof error === 'object' &&
			'code' in error &&
			error.code === 11000 &&
			'keyPattern' in error &&
			error.keyPattern &&
			typeof error.keyPattern === 'object' &&
			'customer_number_normalized' in error.keyPattern,
	);
}

export async function ensureLeadContactNumberIsUnique(
	contactNumber: string,
	excludedLeadId?: string,
) {
	const normalizedNumber = normalizeLeadContactNumber(contactNumber);

	if (!normalizedNumber) {
		throw new Error('Invalid contact number');
	}

	const excludedLeadFilter = excludedLeadId
		? { _id: { $ne: new Types.ObjectId(excludedLeadId) } }
		: {};

	const existingNormalizedLead = await Leads.findOne({
		...excludedLeadFilter,
		$or: [
			{ customer_number_normalized: normalizedNumber },
			{ customer_number: contactNumber },
		],
	})
		.select('_id')
		.lean();

	if (existingNormalizedLead) {
		throw new Error('Lead with this contact number already exists');
	}

	const legacyLeads = await Leads.find({
		...excludedLeadFilter,
		customer_number_normalized: { $exists: false },
	})
		.select('_id customer_number')
		.lean<Array<{ _id: Types.ObjectId; customer_number: string }>>();

	const matchingLegacyLead = legacyLeads.find(
		(lead) => normalizeLeadContactNumber(lead.customer_number) === normalizedNumber,
	);

	if (matchingLegacyLead) {
		throw new Error('Lead with this contact number already exists');
	}

	return normalizedNumber;
}
