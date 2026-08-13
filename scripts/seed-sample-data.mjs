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
const USER_AVAILABILITY_STATUSES = ['active', 'inactive'];
const CALL_TRANSFER_LOAN_TYPES = ['Conventional', 'Veteran', 'FHA', 'Streamline'];
const CALL_TRANSFER_LOAN_PURPOSES = [
	'Rate and Term',
	'Cash Out',
	'Debt Consolidation',
	'Home Improvement',
];
const CALL_TRANSFER_CREDIT_RATINGS = ['Excellent', 'Good', 'Fair', 'Poor'];

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
		username: { type: String, required: true, unique: true, trim: true },
		email: { type: String, unique: true, sparse: true, trim: true },
		password: { type: String, required: true },
		phone_number: { type: String, required: false },
		status: {
			type: String,
			default: 'inactive',
			enum: ['active', 'inactive', 'blocked'],
		},
		availability_status: {
			type: String,
			default: 'inactive',
			enum: USER_AVAILABILITY_STATUSES,
		},
		role: {
			type: String,
			enum: ['agent', 'team_lead', 'admin', 'quality_assurance', 'loan_officer'],
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
		lead_type: {
			type: String,
			default: 'standard',
			enum: ['standard', 'call_transfer'],
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
		loan_officer_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: false,
		},
		loan_officer_name: { type: String, required: false },
		loan_officer_phone_number: { type: String, required: false },
		loan_type: { type: String, enum: LOAN_TYPES, required: true },
		loan_balance: { type: Number, required: false },
		home_value: { type: Number, required: false },
		payment_status: {
			type: String,
			enum: ['paid', 'unpaid'],
			default: 'unpaid',
		},
		call_transfer: {
			first_name: { type: String, required: false },
			last_name: { type: String, required: false },
			origin_phone: { type: String, required: false },
			address: { type: String, required: false },
			city: { type: String, required: false },
			state: { type: String, required: false },
			zip: { type: String, required: false },
			email: { type: String, required: false },
			home_value: { type: Number, required: false },
			mortgage_balance: { type: Number, required: false },
			mortgage_rate_type: { type: String, required: false },
			property_type: { type: String, required: false },
			multiple_properties: { type: String, required: false },
			mortgage_rate: { type: Number, required: false },
			cash_out_amount: { type: Number, required: false },
			loan_type: { type: String, required: false },
			loan_purpose: { type: String, required: false },
			credit: { type: String, required: false },
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

function getSeedUsername(localPart) {
	return `${localPart}.seed`;
}

function buildSeedUser({ localPart, ...fields }) {
	return {
		...fields,
		username: fields.username || getSeedUsername(localPart),
		email: fields.email ?? getSeedEmail(localPart),
		availability_status: fields.availability_status || 'inactive',
	};
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
		lead_type: 'standard',
		status,
		customer_number: `+1 555 ${String(1000000 + leadNumber).slice(1)}`,
		customer_name: `Seed Customer ${leadNumber}`,
		username: `seed.customer.${leadNumber}`,
		campaign: CAMPAIGNS[leadNumber % CAMPAIGNS.length],
		loan_type: LOAN_TYPES[leadNumber % LOAN_TYPES.length],
		loan_balance: 90000 + leadNumber * 1200,
		home_value: 180000 + leadNumber * 2500,
		payment_status:
			status === 'billable' ? getLeadPaymentStatus(leadIndex) : 'unpaid',
	};

	if (status === 'non billable') {
		lead.status_reason = 'Seed sample: insufficient credit history';
	}

	return lead;
}

function mapCallTransferLoanType(loanType) {
	if (loanType === 'Veteran') return 'VA';
	if (loanType === 'Streamline') return 'VA eligible';
	return loanType;
}

function buildCallTransferLead({ agent, loanOfficer, leadIndex }) {
	const leadNumber = leadIndex + 1;
	const homeValue = 260000 + leadIndex * 25000;
	const loanBalance = 150000 + leadIndex * 15000;
	const loanType =
		CALL_TRANSFER_LOAN_TYPES[leadIndex % CALL_TRANSFER_LOAN_TYPES.length];
	const firstName = `Transfer${leadNumber}`;
	const lastName = 'Customer';

	return {
		created_by: agent._id,
		lead_type: 'call_transfer',
		status: 'pending',
		customer_number: `+1 777 000 00${leadNumber}`,
		customer_name: `${firstName} ${lastName}`,
		username: `transfer.customer.${leadNumber}`,
		campaign: 'Call Transfer',
		loan_officer_id: loanOfficer._id,
		loan_officer_name: loanOfficer.name,
		loan_officer_phone_number: loanOfficer.phone_number,
		loan_type: mapCallTransferLoanType(loanType),
		loan_balance: loanBalance,
		home_value: homeValue,
		payment_status: 'unpaid',
		call_transfer: {
			first_name: firstName,
			last_name: lastName,
			origin_phone: `+1 777 000 00${leadNumber}`,
			address: `${100 + leadIndex} Seed Transfer Ave`,
			city: 'Austin',
			state: 'TX',
			zip: `7330${leadIndex}`,
			email: `transfer${leadNumber}.seed@${SEED_EMAIL_DOMAIN}`,
			home_value: homeValue,
			mortgage_balance: loanBalance,
			mortgage_rate_type: leadIndex % 2 === 0 ? 'Fixed' : 'Adjustable',
			property_type: leadIndex % 2 === 0 ? 'Single Family' : 'Townhome',
			multiple_properties: leadIndex % 2 === 0 ? 'No' : 'Yes',
			mortgage_rate: 5.25 + leadIndex * 0.25,
			cash_out_amount: 20000 + leadIndex * 5000,
			loan_type: loanType,
			loan_purpose:
				CALL_TRANSFER_LOAN_PURPOSES[
					leadIndex % CALL_TRANSFER_LOAN_PURPOSES.length
				],
			credit:
				CALL_TRANSFER_CREDIT_RATINGS[
					leadIndex % CALL_TRANSFER_CREDIT_RATINGS.length
				],
		},
	};
}

async function clearPreviousSeedData() {
	const seedUsers = await Users.find({
		$or: [
			{ email: { $regex: `\\.seed@${SEED_EMAIL_DOMAIN.replace('.', '\\.')}$` } },
			{ username: { $regex: '\\.seed$' } },
		],
	}).select('_id');
	const seedUserIds = seedUsers.map((user) => user._id);

	if (seedUserIds.length > 0) {
		await Leads.deleteMany({ created_by: { $in: seedUserIds } });
		await Leads.deleteMany({ loan_officer_id: { $in: seedUserIds } });
	}

	await Users.deleteMany({
		$or: [
			{ email: { $regex: `\\.seed@${SEED_EMAIL_DOMAIN.replace('.', '\\.')}$` } },
			{ username: { $regex: '\\.seed$' } },
		],
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
	const admin = await Users.create(
		buildSeedUser({
			localPart: 'admin',
			name: 'Seed Admin',
			password: hashedPassword,
			status: 'active',
			role: 'admin',
		}),
	);

	const createdTeams = [];
	const createdTeamLeads = [];
	const createdAgents = [];
	const createdLeads = [];
	const createdLoanOfficers = [];

	const teamObjectIds = TEAM_NAMES.map(() => new mongoose.Types.ObjectId());

	// Teams are mixed: every loan officer is spread across the seeded teams so
	// team dashboards exercise both agent-created and officer-assigned leads.
	const loanOfficerUsers = Array.from({ length: 4 }, (_, index) => {
		const officerNumber = index + 1;
		return buildSeedUser({
			localPart: `loanofficer${officerNumber}`,
			name: `Seed Loan Officer ${officerNumber}`,
			password: hashedPassword,
			phone_number: `+1 888 555 010${officerNumber}`,
			status: 'active',
			availability_status: 'active',
			role: 'loan_officer',
			team_id: teamObjectIds[index % teamObjectIds.length],
		});
	});
	const loanOfficers = await Users.insertMany(loanOfficerUsers);
	createdLoanOfficers.push(...loanOfficers);

	for (let teamIndex = 0; teamIndex < TEAM_NAMES.length; teamIndex += 1) {
		const teamId = teamObjectIds[teamIndex];
		const teamNumber = teamIndex + 1;

		// The first team gets two leads to cover the multiple-leads-per-team case.
		const teamLeadCount = teamIndex === 0 ? 2 : 1;
		const teamLeadUsers = Array.from({ length: teamLeadCount }, (_, leadIndex) =>
			buildSeedUser({
				localPart:
					leadIndex === 0
						? `teamlead${teamNumber}`
						: `teamlead${teamNumber}.${leadIndex + 1}`,
				name:
					leadIndex === 0
						? `Seed Team Lead ${teamNumber}`
						: `Seed Team Lead ${teamNumber}-${leadIndex + 1}`,
				password: hashedPassword,
				status: 'active',
				role: 'team_lead',
				team_id: teamId,
			}),
		);
		const teamLeadDocuments = await Users.insertMany(teamLeadUsers);

		const team = await Teams.create({
			_id: teamId,
			name: TEAM_NAMES[teamIndex],
			status: 'active',
		});

		createdTeams.push(team);
		createdTeamLeads.push(...teamLeadDocuments);

		const teamAgents = [];
		for (let agentIndex = 0; agentIndex < 10; agentIndex += 1) {
			const agentNumber = agentIndex + 1;
			const agentLocalPart = `team${teamNumber}.agent${String(agentNumber).padStart(2, '0')}`;
			teamAgents.push(
				buildSeedUser({
					localPart: agentLocalPart,
					name: `Seed Agent ${teamNumber}-${String(agentNumber).padStart(2, '0')}`,
					password: hashedPassword,
					status: 'active',
					role: 'agent',
					team_id: teamId,
				}),
			);
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

	const callTransferLeads = Array.from({ length: 4 }, (_, leadIndex) =>
		buildCallTransferLead({
			agent: createdAgents[leadIndex],
			loanOfficer: createdLoanOfficers[leadIndex],
			leadIndex,
		}),
	);
	const createdCallTransferLeads = await Leads.insertMany(callTransferLeads);
	createdLeads.push(...createdCallTransferLeads);

	console.log('Sample seed completed successfully.');
	console.log('Password for every seeded user:', SEED_PASSWORD);
	console.log('Admin:', admin.email, '| Username:', admin.username);
	console.log(
		'Team Leads:',
		createdTeamLeads
			.map((user) => `${user.email} (${user.username})`)
			.join(', '),
	);
	console.log(
		'Loan Officers:',
		createdLoanOfficers
			.map((user) => `${user.email} (${user.username})`)
			.join(', '),
	);
	console.log('Teams created:', createdTeams.length);
	console.log('Agents created:', createdAgents.length);
	console.log('Loan officers created:', createdLoanOfficers.length);
	console.log('Call transfer leads created:', createdCallTransferLeads.length);
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
