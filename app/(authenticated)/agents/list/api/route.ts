import { NextResponse } from 'next/server';
import { listMembers } from '@/agents/backend/list-agents';

function getErrorStatus(message: string) {
	if (message === 'Unauthorized') return 401;
	if (message.includes('Forbidden')) return 403;
	return 500;
}

export async function GET() {
	try {
		const members = await listMembers();
		return NextResponse.json({ success: true, data: members });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to list agents';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
