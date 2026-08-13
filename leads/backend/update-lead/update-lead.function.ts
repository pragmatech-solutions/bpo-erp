import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import {
	ensureLeadContactNumberIsUnique,
	isDuplicateLeadContactNumberError,
} from '@/leads/backend/lead-contact-number';
import {
	updateLeadInputSchema,
	type UpdateLeadInput,
} from './update-lead.input-schema';

type LeadDocumentWithOfficer = {
	lead_type?: 'standard' | 'call_transfer';
	created_by?: Types.ObjectId;
	customer_name: string;
	username: string;
	customer_number: string;
	customer_number_normalized?: string;
	campaign: string;
	loan_type: string;
	loan_balance?: number;
	home_value?: number;
	loan_officer_id?: { toString(): string } | null;
	loan_officer_name?: string;
	loan_officer_phone_number?: string;
	call_transfer?: {
		first_name?: string;
		last_name?: string;
		origin_phone?: string;
		address?: string;
		city?: string;
		state?: string;
		zip?: string;
		email?: string;
		home_value?: number;
		mortgage_balance?: number;
		mortgage_rate_type?: string;
		property_type?: string;
		multiple_properties?: string;
		mortgage_rate?: number;
		cash_out_amount?: number;
		loan_type?: string;
		loan_purpose?: string;
		credit?: string;
	};
	status: LeadStatus;
	status_reason?: string;
	payment_status?: 'paid' | 'unpaid';
	deleted_at?: Date;
	save(): Promise<unknown>;
};

type LoanOfficerDocument = {
	_id: Types.ObjectId;
	name: string;
	phone_number?: string;
};

function hasAdminOnlyEditFields(input: UpdateLeadInput) {
	return Boolean(
		input.customerName !== undefined ||
			input.username !== undefined ||
			input.customerNumber !== undefined ||
			input.campaign !== undefined ||
			input.loanType !== undefined ||
			input.loanBalance !== undefined ||
			input.homeValue !== undefined ||
			input.loanOfficerId !== undefined ||
			input.callTransfer !== undefined,
	);
}

function setIfDefined<T>(value: T | undefined, setter: (value: T) => void) {
	if (value !== undefined) setter(value);
}

export async function updateLead(input: UpdateLeadInput) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');

	if (
		currentUser.role !== UserRole.ADMIN &&
		currentUser.role !== UserRole.QUALITY_ASSURANCE &&
		currentUser.role !== UserRole.LOAN_OFFICER
	) {
		throw new Error(
			'Forbidden: Only admins, QA, or loan officers can update leads',
		);
	}

	const validatedInput = updateLeadInputSchema.parse(input);
	const lead = await Leads.findById(validatedInput.id);
	if (!lead) throw new Error('Lead not found');

	const editableLead = lead as LeadDocumentWithOfficer;

	if (editableLead.deleted_at && currentUser.role !== UserRole.ADMIN) {
		throw new Error('Lead not found');
	}

	if (
		currentUser.role !== UserRole.ADMIN &&
		hasAdminOnlyEditFields(validatedInput)
	) {
		throw new Error('Forbidden: Only admins can edit lead information');
	}

	if (currentUser.role === UserRole.LOAN_OFFICER) {
		if (editableLead.loan_officer_id?.toString() !== currentUser.id) {
			throw new Error('Lead not found');
		}
		if (validatedInput.paymentStatus !== undefined) {
			throw new Error('Forbidden: Loan officers cannot update payment status');
		}
	}

	if (
		currentUser.role === UserRole.QUALITY_ASSURANCE ||
		currentUser.role === UserRole.LOAN_OFFICER
	) {
		if (validatedInput.status === LeadStatus.PENDING) {
			throw new Error(
				'Forbidden: Reviewer roles can only mark leads billable or non-billable',
			);
		}
		if (validatedInput.paymentStatus === 'paid') {
			throw new Error('Forbidden: Only admins can mark leads as paid');
		}
	}

	if (currentUser.role === UserRole.ADMIN) {
		setIfDefined(validatedInput.customerName, (value) => {
			editableLead.customer_name = value;
		});
		setIfDefined(validatedInput.username, (value) => {
			editableLead.username = value;
		});

		const requestedCustomerNumber =
			validatedInput.customerNumber ??
			(editableLead.lead_type === 'call_transfer'
				? validatedInput.callTransfer?.originPhone
				: undefined);

		if (requestedCustomerNumber !== undefined) {
			const normalizedCustomerNumber = await ensureLeadContactNumberIsUnique(
				requestedCustomerNumber,
				validatedInput.id,
			);
			editableLead.customer_number = requestedCustomerNumber;
			editableLead.customer_number_normalized = normalizedCustomerNumber;
		}

		setIfDefined(validatedInput.campaign, (value) => {
			editableLead.campaign = value;
		});
		setIfDefined(validatedInput.loanType, (value) => {
			editableLead.loan_type = value;
		});
		setIfDefined(validatedInput.loanBalance, (value) => {
			editableLead.loan_balance = value;
		});
		setIfDefined(validatedInput.homeValue, (value) => {
			editableLead.home_value = value;
		});

		if (validatedInput.loanOfficerId !== undefined) {
			if (!validatedInput.loanOfficerId) {
				if (editableLead.lead_type === 'call_transfer') {
					throw new Error('Loan officer is required for call transfer leads');
				}

				editableLead.loan_officer_id = undefined;
				editableLead.loan_officer_name = undefined;
				editableLead.loan_officer_phone_number = undefined;
			} else {
				if (!Types.ObjectId.isValid(validatedInput.loanOfficerId)) {
					throw new Error('Invalid loan officer selected');
				}

				const loanOfficer = await Users.findOne({
					_id: validatedInput.loanOfficerId,
					role: UserRole.LOAN_OFFICER,
					status: 'active',
					availability_status: UserAvailabilityStatus.ACTIVE,
				})
					.select('_id name phone_number')
					.lean<LoanOfficerDocument>();

				if (!loanOfficer) {
					throw new Error('Selected loan officer is not available');
				}

				editableLead.loan_officer_id = loanOfficer._id;
				editableLead.loan_officer_name = loanOfficer.name;
				editableLead.loan_officer_phone_number = loanOfficer.phone_number;
			}
		}

		if (validatedInput.callTransfer) {
			if (editableLead.lead_type !== 'call_transfer') {
				throw new Error('Lead is not a call transfer lead');
			}

			editableLead.call_transfer = editableLead.call_transfer || {};
			const callTransfer = editableLead.call_transfer;
			const inputCallTransfer = validatedInput.callTransfer;

			setIfDefined(inputCallTransfer.firstName, (value) => {
				callTransfer.first_name = value;
			});
			setIfDefined(inputCallTransfer.lastName, (value) => {
				callTransfer.last_name = value;
			});
			if (requestedCustomerNumber !== undefined) {
				callTransfer.origin_phone = requestedCustomerNumber;
			}
			setIfDefined(inputCallTransfer.address, (value) => {
				callTransfer.address = value;
			});
			setIfDefined(inputCallTransfer.city, (value) => {
				callTransfer.city = value;
			});
			setIfDefined(inputCallTransfer.state, (value) => {
				callTransfer.state = value;
			});
			setIfDefined(inputCallTransfer.zip, (value) => {
				callTransfer.zip = value;
			});
			setIfDefined(inputCallTransfer.email, (value) => {
				callTransfer.email = value || undefined;
			});
			setIfDefined(inputCallTransfer.homeValue, (value) => {
				callTransfer.home_value = value;
			});
			setIfDefined(inputCallTransfer.mortgageBalance, (value) => {
				callTransfer.mortgage_balance = value;
			});
			setIfDefined(inputCallTransfer.mortgageRateType, (value) => {
				callTransfer.mortgage_rate_type = value;
			});
			setIfDefined(inputCallTransfer.propertyType, (value) => {
				callTransfer.property_type = value;
			});
			setIfDefined(inputCallTransfer.multipleProperties, (value) => {
				callTransfer.multiple_properties = value;
			});
			setIfDefined(inputCallTransfer.mortgageRate, (value) => {
				callTransfer.mortgage_rate = value;
			});
			setIfDefined(inputCallTransfer.cashOutAmount, (value) => {
				callTransfer.cash_out_amount = value;
			});
			setIfDefined(inputCallTransfer.loanType, (value) => {
				callTransfer.loan_type = value;
			});
			setIfDefined(inputCallTransfer.loanPurpose, (value) => {
				callTransfer.loan_purpose = value;
			});
			setIfDefined(inputCallTransfer.credit, (value) => {
				callTransfer.credit = value;
			});
		}
	}

	editableLead.status = validatedInput.status;
	editableLead.status_reason =
		validatedInput.status === LeadStatus.NON_BILLABLE
			? validatedInput.statusReason
			: undefined;

	if (currentUser.role === UserRole.ADMIN) {
		if (validatedInput.paymentStatus !== undefined) {
			editableLead.payment_status = validatedInput.paymentStatus;
		}
	} else if (
		currentUser.role === UserRole.QUALITY_ASSURANCE &&
		validatedInput.status === LeadStatus.BILLABLE
	) {
		editableLead.payment_status = 'unpaid';
	}

	try {
		await editableLead.save();
	} catch (error) {
		if (isDuplicateLeadContactNumberError(error)) {
			throw new Error('Lead with this contact number already exists');
		}
		throw error;
	}

	return { success: true, message: 'Lead updated successfully' };
}
