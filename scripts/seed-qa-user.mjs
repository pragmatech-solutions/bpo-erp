import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const QA_USER = {
	name: 'Seed QA',
	username: 'qa.seed',
	email: 'qa.seed@mavrix.local',
	password: 'Password123!',
	status: 'active',
	role: 'quality_assurance',
};

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
		username: { type: String, required: true, unique: true, trim: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		status: {
			type: String,
			default: 'inactive',
			enum: ['active', 'inactive', 'blocked'],
		},
		role: {
			type: String,
			enum: ['agent', 'team_lead', 'manager', 'quality_assurance', 'admin'],
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

async function seedQaUser() {
	loadEnvFile();

	if (!process.env.MONGODB_URI) {
		throw new Error('MONGODB_URI is missing. Add it to .env before seeding.');
	}

	await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

	const hashedPassword = await bcrypt.hash(QA_USER.password, 12);
	const existingUser = await Users.findOne({ email: QA_USER.email });

	if (existingUser) {
		existingUser.name = QA_USER.name;
		existingUser.username = QA_USER.username;
		existingUser.password = hashedPassword;
		existingUser.status = QA_USER.status;
		existingUser.role = QA_USER.role;
		existingUser.team_id = undefined;
		await existingUser.save();
		console.log('QA user already existed, updated credentials and role.');
	} else {
		await Users.create({
			name: QA_USER.name,
			username: QA_USER.username,
			email: QA_USER.email,
			password: hashedPassword,
			status: QA_USER.status,
			role: QA_USER.role,
		});
		console.log('QA user created successfully.');
	}

	console.log('Email:', QA_USER.email);
	console.log('Password:', QA_USER.password);
}

seedQaUser()
	.catch((error) => {
		console.error('QA seed failed.');
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await mongoose.disconnect();
	});
