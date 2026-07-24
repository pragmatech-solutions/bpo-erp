import { NextResponse } from 'next/server';
import { listLoanOfficers } from '@/loan-officers/backend/list-loan-officers';
import { getErrorStatus } from '@/common/backend/authorization.function';

export async function GET() {
	try {
		const loanOfficers = await listLoanOfficers();
		return NextResponse.json({ success: true, data: loanOfficers });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to list loan officers';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
