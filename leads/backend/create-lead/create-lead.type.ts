import { LoanType } from '@/common/constants/loan-type.enum';

export interface LeadResponse {
	_id: string;
	customer_name: string;
	username: string;
	customer_number: string;
	loan_type: LoanType;
	loan_balance?: number;
	home_value?: number;
	status: string;
	created_by: string;
	payment_status?: 'paid' | 'unpaid';
	created_at: Date;
	updated_at: Date;
}

export interface CreateLeadInput {
	customer_name: string;
	username: string;
	customer_number: string;
	loan_type: LoanType;
	loan_balance?: number;
	home_value?: number;
	status?: string;
}

export interface CreateLeadResponse {
	success: boolean;
	message: string;
	data?: LeadResponse;
	error?: string;
}
