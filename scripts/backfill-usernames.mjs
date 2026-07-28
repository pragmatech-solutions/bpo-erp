import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

function loadEnvFile() {
	const envPath = path.join(process.cwd(), '.env');
	if (!fs.existsSync(envPath)) return;

	const envFile = fs.readFileSync(envPath, 'utf8');
	for (const line of envFile.split(/\r?\n/)) {
		const trimmedLine = line.trim();
		if (!trimmedLine || trimmedLine.startsWith('#')) continue;

		const separatorIndex = trimmedLine.indexOf('=');
		if (separatorIndex === -1) continue;

		const key = trimmedLine.slice(0, separatorIndex).trim();
		const value = trimmedLine.slice(separatorIndex + 1).trim();
		if (!process.env[key]) process.env[key] = value;
	}
}

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		username: { type: String, required: false, trim: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		status: {
			type: String,
			default: 'inactive',
			enum: ['active', 'inactive', 'blocked'],
		},
		role: {
			type: String,
			enum: ['agent', 'team_lead', 'quality_assurance', 'admin'],
			required: true,
		},
		team_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'teams',
			required: false,
		},
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: false,
		},
	},
	{
		timestamps: {
			updatedAt: 'updated_at',
			createdAt: 'created_at',
		},
	},
);

const Users = mongoose.models.users || mongoose.model('users', UserSchema);

function usernameFromEmail(email) {
	return email.slice(0, email.indexOf('@'));
}

async function backfillUsernames() {
	loadEnvFile();

	if (!process.env.MONGODB_URI) {
		throw new Error('MONGODB_URI is missing. Add it to .env before running.');
	}

	await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

	const users = await Users.find({
		$or: [{ username: { $exists: false } }, { username: null }, { username: '' }],
	});

	if (users.length === 0) {
		console.log('No users are missing a username. Nothing to do.');
		return;
	}

	const takenUsernames = new Set(
		(await Users.find({ username: { $exists: true, $nin: [null, ''] } }).select(
			'username',
		)).map((user) => user.username),
	);

	let updatedCount = 0;
	let collisionCount = 0;

	for (const user of users) {
		const baseUsername = usernameFromEmail(user.email);
		let candidate = baseUsername;
		let suffix = 2;

		while (takenUsernames.has(candidate)) {
			candidate = `${baseUsername}-${suffix}`;
			suffix += 1;
			collisionCount += 1;
		}

		takenUsernames.add(candidate);
		user.username = candidate;
		await user.save();
		updatedCount += 1;
		console.log(`Set username "${candidate}" for ${user.email}`);
	}

	console.log(`Backfill complete. Updated ${updatedCount} user(s).`);
	if (collisionCount > 0) {
		console.log(`Resolved ${collisionCount} username collision(s) with numeric suffixes.`);
	}
}

backfillUsernames()
	.catch((error) => {
		console.error('Username backfill failed.');
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await mongoose.disconnect();
	});
