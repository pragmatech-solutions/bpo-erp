import { NextResponse } from 'next/server';
import { listAgents } from '@/agents/backend/list-agents';

export async function GET() {
	try {
		const agents = await listAgents();
		return NextResponse.json({ success: true, data: agents });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to list agents';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: 500 },
		);
	}
}
