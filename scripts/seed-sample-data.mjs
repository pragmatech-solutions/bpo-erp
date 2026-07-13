import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const SEED_PASSWORD = 'Password123!';
const SEED_EMAIL_DOMAIN = 'mavrix.local';
const TEAM_NAMES = ['Seed Team Alpha', 'Seed Team Beta'];
const CAMPAIGNS = [
	'MTG MAIN DE',
	'MTG MAIN CW',
	'LINIX MC',
	'LIMIC OM',
	'LINIX CW',
	'VICI',
	'DEBTS',
];
const LOAN_TYPES = ['Conventional', 'FHA', 'VA', 'VA eligible'];
const LEAD_STATUSES = ['pending', 'billable', 'non billable'];

function loadEnvFile() {
	const envPath = path.join(process.cwd(), '.env');
	if (!fs.existsSync(envPath)) {
		return;
	}

	const envFile = fs.readFileSync(envPath, 'utf8');
	for (const line of envFile.split(/\r?\n/)) {
		const trimmedLine = line.trim();
		if (!trimmedLine || trimmedLine.startsWith('#')) {
			continue;
		}

		const separatorIndex = trimmedLine.indexOf('=');
		if (separatorIndex === -1) {
			continue;
		}

		const key = trimmedLine.slice(0, separatorIndex).trim();
		const value = trimmedLine.slice(separatorIndex + 1).trim();
		if (!process.env[key]) {
			process.env[key] = value;
		}
	}
}

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		status: {
			type: String,
			default: 'inactive',
			enum: ['active', 'inactive', 'blocked'],
		},
		role: {
			type: String,
			enum: ['agent', 'team_lead', 'admin'],
			required: true,
		},
		team_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'teams',
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

const TeamSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true },
		team_lead: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: true,
		},
		status: { type: String, default: 'active' },
	},
	{
		timestamps: {
			updatedAt: 'updated_at',
			createdAt: 'created_at',
		},
	},
);

const LeadSchema = new mongoose.Schema(
	{
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: true,
		},
		status: {
			type: String,
			enum: LEAD_STATUSES,
			default: 'pending',
		},
		status_reason: { type: String, required: false },
		customer_number: { type: String, required: true },
		customer_name: { type: String, required: true },
		username: { type: String, required: true },
		campaign: { type: String, required: true },
		loan_officer_name: { type: String, required: false },
		loan_type: { type: String, enum: LOAN_TYPES, required: true },
		loan_balance: { type: Number, required: false },
		home_value: { type: Number, required: false },
		payment_status: {
			type: String,
			enum: ['paid', 'unpaid'],
			default: 'unpaid',
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
const Teams = mongoose.models.teams || mongoose.model('teams', TeamSchema);
const Leads = mongoose.models.leads || mongoose.model('leads', LeadSchema);

function getSeedEmail(localPart) {
	return `${localPart}.seed@${SEED_EMAIL_DOMAIN}`;
}

function getLeadStatus(agentIndex, leadIndex) {
	return LEAD_STATUSES[(agentIndex + leadIndex) % LEAD_STATUSES.length];
}

function getLeadPaymentStatus(leadIndex) {
	return leadIndex % 2 === 0 ? 'paid' : 'unpaid';
}

function buildLead(agent, teamIndex, agentIndex, leadIndex) {
	const status = getLeadStatus(agentIndex, leadIndex);
	const leadNumber = teamIndex * 50 + agentIndex * 5 + leadIndex + 1;
	const lead = {
		created_by: agent._id,
		status,
		customer_number: `+1 555 ${String(1000000 + leadNumber).slice(1)}`,
		customer_name: `Seed Customer ${leadNumber}`,
		username: `seed.customer.${leadNumber}`,
		campaign: CAMPAIGNS[leadNumber % CAMPAIGNS.length],
		loan_officer_name: `Seed Officer ${(leadNumber % 8) + 1}`,
		loan_type: LOAN_TYPES[leadNumber % LOAN_TYPES.length],
		loan_balance: 90000 + leadNumber * 1200,
		home_value: 180000 + leadNumber * 2500,
		payment_status: status === 'billable' ? getLeadPaymentStatus(leadIndex) : 'unpaid',
	};

	if (status === 'non billable') {
		lead.status_reason = 'Seed sample: insufficient credit history';
	}

	return lead;
}

async function clearPreviousSeedData() {
	const seedUsers = await Users.find({
		email: { $regex: `\\.seed@${SEED_EMAIL_DOMAIN.replace('.', '\\.')}$` },
	}).select('_id');
	const seedUserIds = seedUsers.map((user) => user._id);

	if (seedUserIds.length > 0) {
		await Leads.deleteMany({ created_by: { $in: seedUserIds } });
	}

	await Users.deleteMany({
		email: { $regex: `\\.seed@${SEED_EMAIL_DOMAIN.replace('.', '\\.')}$` },
	});
	await Teams.deleteMany({ name: { $in: TEAM_NAMES } });
}

async function seed() {
	loadEnvFile();

	if (!process.env.MONGODB_URI) {
		throw new Error('MONGODB_URI is missing. Add it to .env before seeding.');
	}

	await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
	await clearPreviousSeedData();

	const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 12);
	const admin = await Users.create({
		name: 'Seed Admin',
		email: getSeedEmail('admin'),
		password: hashedPassword,
		status: 'active',
		role: 'admin',
	});

	const createdTeams = [];
	const createdTeamLeads = [];
	const createdAgents = [];
	const createdLeads = [];

	for (let teamIndex = 0; teamIndex < TEAM_NAMES.length; teamIndex += 1) {
		const teamId = new mongoose.Types.ObjectId();
		const teamLeadId = new mongoose.Types.ObjectId();
		const teamNumber = teamIndex + 1;

		const teamLead = await Users.create({
			_id: teamLeadId,
			name: `Seed Team Lead ${teamNumber}`,
			email: getSeedEmail(`teamlead${teamNumber}`),
			password: hashedPassword,
			status: 'active',
			role: 'team_lead',
			team_id: teamId,
		});

		const team = await Teams.create({
			_id: teamId,
			name: TEAM_NAMES[teamIndex],
			team_lead: teamLeadId,
			status: 'active',
		});

		createdTeams.push(team);
		createdTeamLeads.push(teamLead);

		const teamAgents = [];
		for (let agentIndex = 0; agentIndex < 10; agentIndex += 1) {
			const agentNumber = agentIndex + 1;
			teamAgents.push({
				name: `Seed Agent ${teamNumber}-${String(agentNumber).padStart(2, '0')}`,
				email: getSeedEmail(`team${teamNumber}.agent${String(agentNumber).padStart(2, '0')}`),
				password: hashedPassword,
				status: 'active',
				role: 'agent',
				team_id: teamId,
			});
		}

		const agents = await Users.insertMany(teamAgents);
		createdAgents.push(...agents);

		const teamLeads = agents.flatMap((agent, agentIndex) =>
			Array.from({ length: 5 }, (_, leadIndex) =>
				buildLead(agent, teamIndex, agentIndex, leadIndex),
			),
		);
		const leads = await Leads.insertMany(teamLeads);
		createdLeads.push(...leads);
	}

	console.log('Sample seed completed successfully.');
	console.log('Password for every seeded user:', SEED_PASSWORD);
	console.log('Admin:', admin.email);
	console.log('Team Leads:', createdTeamLeads.map((user) => user.email).join(', '));
	console.log('Teams created:', createdTeams.length);
	console.log('Agents created:', createdAgents.length);
	console.log('Leads created:', createdLeads.length);
}

seed()
	.catch((error) => {
		console.error('Sample seed failed.');
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await mongoose.disconnect();
	});


