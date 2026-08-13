import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
	createAccessToken,
	REFRESH_TOKEN_COOKIE_NAME,
	verifySessionToken,
} from '@/auth/backend/login/create-session.function';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';

export async function POST() {
	const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE_NAME)?.value;

	if (!refreshToken) {
		return NextResponse.json(
			{ success: false, error: 'Refresh token missing' },
			{ status: 401 },
		);
	}

	const userId = await verifySessionToken(refreshToken, 'refresh');

	if (!userId) {
		return NextResponse.json(
			{ success: false, error: 'Refresh token invalid' },
			{ status: 401 },
		);
	}

	await connectToDatabase();
	const user = await Users.findById(userId).select('_id status').lean<{
		_id: unknown;
		status?: string;
	}>();

	if (!user || user.status !== 'active') {
		return NextResponse.json(
			{ success: false, error: 'User is not active' },
			{ status: 401 },
		);
	}

	const token = await createAccessToken(userId);

	return NextResponse.json({ success: true, token });
}
