import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { CALL_TRANSFER_SHEET_CONFIGURATION_KEY } from '@/common/constants/configuration-keys';
import { UserRole } from '@/common/constants/user-roles.enum';
import { connectToDatabase } from '@/common/database';
import { Configurations } from '@/common/models/configurations.schema';
import {
	hasRichTextContent,
	sanitizeRichTextHtml,
} from '@/common/utils/sanitize-rich-text-html';
import {
	updateCallTransferSheetInputSchema,
	type UpdateCallTransferSheetInput,
} from './call-transfer-sheet.input-schema';

export async function updateCallTransferSheet(
	input: UpdateCallTransferSheetInput,
) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');
	if (currentUser.role !== UserRole.ADMIN) {
		throw new Error(
			'Forbidden: Only admins can update the call transfer sheet',
		);
	}

	const validatedInput = updateCallTransferSheetInputSchema.parse(input);
	const value = sanitizeRichTextHtml(validatedInput.value);

	if (!hasRichTextContent(value)) {
		throw new Error('Call transfer sheet content is required');
	}

	const configuration = await Configurations.findOne({
		key: CALL_TRANSFER_SHEET_CONFIGURATION_KEY,
	});

	if (configuration) {
		configuration.value = value;
		configuration.deleted_at = undefined;
		configuration.deleted_by = undefined;
		configuration.updated_at = new Date();
		configuration.updated_by = new Types.ObjectId(currentUser.id);
		await configuration.save();

		return { value: configuration.value };
	}

	const createdConfiguration = await Configurations.create({
		key: CALL_TRANSFER_SHEET_CONFIGURATION_KEY,
		value,
		created_by: new Types.ObjectId(currentUser.id),
	});

	return { value: createdConfiguration.value };
}
