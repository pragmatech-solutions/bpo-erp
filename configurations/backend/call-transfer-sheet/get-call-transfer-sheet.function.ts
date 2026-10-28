import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { DEFAULT_CALL_TRANSFER_SHEET_CONTENT } from '@/common/constants/call-transfer-sheet-content';
import { CALL_TRANSFER_SHEET_CONFIGURATION_KEY } from '@/common/constants/configuration-keys';
import { connectToDatabase } from '@/common/database';
import { Configurations } from '@/common/models/configurations.schema';
import { sanitizeRichTextHtml } from '@/common/utils/sanitize-rich-text-html';

type CallTransferSheetConfiguration = {
	value: string;
};

export async function getCallTransferSheet() {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');

	const configuration = await Configurations.findOne({
		key: CALL_TRANSFER_SHEET_CONFIGURATION_KEY,
		deleted_at: { $exists: false },
	})
		.select('value')
		.lean<CallTransferSheetConfiguration>();

	return {
		value: sanitizeRichTextHtml(
			configuration?.value || DEFAULT_CALL_TRANSFER_SHEET_CONTENT,
		),
	};
}
