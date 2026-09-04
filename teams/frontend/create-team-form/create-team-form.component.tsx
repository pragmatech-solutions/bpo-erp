'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getUserRoleLabel } from '@/common/constants/user-role-label';
import type { ManagedUser } from '@/users/backend/manage-users/manage-users.type';
import { apiClient } from '@/lib/api-client';
import { createTeamApi } from '@/teams/frontend/team-overview';

type UserListResponse = {
	users: ManagedUser[];
	total: number;
	page: number;
	limit: number;
};

async function getUnassignedUsers(role: UserRole) {
	const params = new URLSearchParams({
		role,
		limit: '50',
		withoutTeam: 'true',
	});

	return apiClient<UserListResponse>(`/users/api?${params.toString()}`);
}

function initials(name: string) {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

function SelectedUserChips({
	users,
	onRemove,
	showRole = false,
}: {
	users: ManagedUser[];
	onRemove: (id: string) => void;
	showRole?: boolean;
}) {
	if (users.length === 0) return null;

	return (
		<div className="mt-4 grid grid-cols-2 gap-3 lg:flex lg:flex-wrap">
			{users.map((user) => (
				<div
					key={user.id}
					className="flex min-w-0 items-center gap-2 rounded-[10px] border border-[#D4D7E3] px-3 py-2 text-[#26395C]"
				>
					<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C5BFF0] text-xs">
						{initials(user.name)}
					</span>
					<span className="min-w-0">
						<span className="block truncate">{user.name}</span>
						{showRole && (
							<span className="block truncate text-[11px] text-[#8897AD]">
								{getUserRoleLabel(user.role)}
							</span>
						)}
					</span>
					<button
						type="button"
						onClick={() => onRemove(user.id)}
						aria-label={`Remove ${user.name}`}
					>
						<X className="size-4 text-[#8897AD]" />
					</button>
				</div>
			))}
		</div>
	);
}

export function CreateTeamForm() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [selectedTeamLeadId, setSelectedTeamLeadId] = useState('');
	const [teamLeadIds, setTeamLeadIds] = useState<string[]>([]);
	const [selectedManagerId, setSelectedManagerId] = useState('');
	const [managerIds, setManagerIds] = useState<string[]>([]);
	const [selectedMemberId, setSelectedMemberId] = useState('');
	const [teamLeadOptions, setTeamLeadOptions] = useState<ManagedUser[]>([]);
	const [managerOptions, setManagerOptions] = useState<ManagedUser[]>([]);
	const [memberOptions, setMemberOptions] = useState<ManagedUser[]>([]);
	const [memberIds, setMemberIds] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		async function loadOptions() {
			try {
				setIsLoading(true);
				setErrorMessage('');
				const [teamLeads, managers, agents, loanOfficers] = await Promise.all([
					getUnassignedUsers(UserRole.TEAM_LEAD),
					getUnassignedUsers(UserRole.MANAGER),
					getUnassignedUsers(UserRole.AGENT),
					getUnassignedUsers(UserRole.LOAN_OFFICER),
				]);
				setTeamLeadOptions(teamLeads.users);
				setManagerOptions(managers.users);
				// A team holds both agents and loan officers; each keeps its own role.
				setMemberOptions(
					[...agents.users, ...loanOfficers.users].sort((first, second) =>
						first.name.localeCompare(second.name),
					),
				);
			} catch (error) {
				setErrorMessage(
					error instanceof Error ? error.message : 'Unable to load users',
				);
			} finally {
				setIsLoading(false);
			}
		}

		loadOptions();
	}, []);

	const selectedMembers = useMemo(
		() => memberOptions.filter((member) => memberIds.includes(member.id)),
		[memberIds, memberOptions],
	);

	const selectedManagers = useMemo(
		() => managerOptions.filter((manager) => managerIds.includes(manager.id)),
		[managerIds, managerOptions],
	);

	const availableMembers = useMemo(
		() => memberOptions.filter((member) => !memberIds.includes(member.id)),
		[memberIds, memberOptions],
	);

	const availableManagers = useMemo(
		() => managerOptions.filter((manager) => !managerIds.includes(manager.id)),
		[managerIds, managerOptions],
	);

	const selectedTeamLeads = useMemo(
		() =>
			teamLeadOptions.filter((teamLead) => teamLeadIds.includes(teamLead.id)),
		[teamLeadIds, teamLeadOptions],
	);

	const availableTeamLeads = useMemo(
		() =>
			teamLeadOptions.filter((teamLead) => !teamLeadIds.includes(teamLead.id)),
		[teamLeadIds, teamLeadOptions],
	);

	const addMember = (id: string) => {
		setMemberIds((current) =>
			current.includes(id) ? current : [...current, id],
		);
		setSelectedMemberId('');
	};

	const removeMember = (id: string) => {
		const confirmed = window.confirm(
			'Remove this user from the selected team members?',
		);
		if (!confirmed) return;
		setMemberIds((current) => current.filter((memberId) => memberId !== id));
	};

	const addTeamLead = (id: string) => {
		setTeamLeadIds((current) =>
			current.includes(id) ? current : [...current, id],
		);
		setSelectedTeamLeadId('');
	};

	const removeTeamLead = (id: string) => {
		const confirmed = window.confirm(
			'Remove this user from the selected team leads?',
		);
		if (!confirmed) return;
		setTeamLeadIds((current) =>
			current.filter((teamLeadId) => teamLeadId !== id),
		);
	};

	const addManager = (id: string) => {
		setManagerIds((current) =>
			current.includes(id) ? current : [...current, id],
		);
		setSelectedManagerId('');
	};

	const removeManager = (id: string) => {
		const confirmed = window.confirm(
			'Remove this user from the selected managers?',
		);
		if (!confirmed) return;
		setManagerIds((current) => current.filter((managerId) => managerId !== id));
	};

	const submit = async () => {
		try {
			setIsSaving(true);
			setErrorMessage('');
			const team = await createTeamApi({
				name,
				teamLeadIds,
				managerIds,
				memberIds,
			});
			router.push(`/teams/${team.id}`);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to create team',
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-4 lg:gap-6">
			<div>
				<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#313957] lg:text-[40px] lg:text-[#0C1421]">
					Create Team
				</h1>
				<Link
					href="/teams"
					className="mt-2 inline-flex items-center gap-2 text-[14px] text-[#2563EB] lg:mt-3 lg:text-[16px]"
				>
					<ArrowLeft className="size-4" />
					Back to Teams
				</Link>
			</div>

			<div className="rounded-[22px] bg-white shadow-sm lg:rounded-[20px]">
				<div className="border-b border-[#D4D7E3] p-5 lg:p-6 lg:px-8">
					<h2 className="text-[18px] font-semibold text-[#0C1421] lg:text-[22px]">
						Team Information
					</h2>
					<p className="text-[14px] text-[#313957] lg:text-[16px]">
						All fields marked with * are required
					</p>
				</div>
				<div className="flex flex-col gap-5 p-5 lg:gap-6 lg:p-8">
					{isLoading ? (
						<div className="text-[#313957]">Loading users...</div>
					) : (
						<>
							{errorMessage && (
								<div className="rounded-[12px] bg-red-50 p-4 text-red-600">
									{errorMessage}
								</div>
							)}
							<div className="max-w-[520px]">
								<label className="mb-2 block text-[15px] font-medium text-[#26395C]">
									Team Name *
								</label>
								<div className="relative">
									<Users className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
									<Input
										value={name}
										onChange={(event) => setName(event.target.value)}
										placeholder="e.g. Sales Team"
										className="h-[56px] rounded-[12px] border-[#D4D7E3] pl-14"
									/>
								</div>
							</div>

							<div>
								<label className="mb-2 block text-[15px] font-medium text-[#26395C]">
									Team Leads *
								</label>
								<Select
									value={selectedTeamLeadId}
									onValueChange={(value) => addTeamLead(value)}
								>
									<SelectTrigger className="h-[56px] rounded-[12px] border-[#D4D7E3]">
										<SelectValue placeholder="Select Team Leads" />
									</SelectTrigger>
									<SelectContent>
										{availableTeamLeads.length === 0 ? (
											<SelectItem value="none" disabled>
												No unassigned team leads available
											</SelectItem>
										) : (
											availableTeamLeads.map((userOption) => (
												<SelectItem key={userOption.id} value={userOption.id}>
													{userOption.name}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								<SelectedUserChips
									users={selectedTeamLeads}
									onRemove={removeTeamLead}
								/>
							</div>

							<div>
								<label className="mb-2 block text-[15px] font-medium text-[#26395C]">
									Managers
								</label>
								<Select
									value={selectedManagerId}
									onValueChange={(value) => addManager(value)}
								>
									<SelectTrigger className="h-[56px] rounded-[12px] border-[#D4D7E3]">
										<SelectValue placeholder="Select Managers" />
									</SelectTrigger>
									<SelectContent>
										{availableManagers.length === 0 ? (
											<SelectItem value="none" disabled>
												No unassigned managers available
											</SelectItem>
										) : (
											availableManagers.map((userOption) => (
												<SelectItem key={userOption.id} value={userOption.id}>
													{userOption.name}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								<SelectedUserChips
									users={selectedManagers}
									onRemove={removeManager}
								/>
							</div>

							<div>
								<label className="mb-2 block text-[15px] font-medium text-[#26395C]">
									Team Members
								</label>
								<Select
									value={selectedMemberId}
									onValueChange={(value) => addMember(value)}
								>
									<SelectTrigger className="h-[56px] rounded-[12px] border-[#D4D7E3]">
										<SelectValue placeholder="Select Members" />
									</SelectTrigger>
									<SelectContent>
										{availableMembers.length === 0 ? (
											<SelectItem value="none" disabled>
												No unassigned agents or loan officers available
											</SelectItem>
										) : (
											availableMembers.map((userOption) => (
												<SelectItem key={userOption.id} value={userOption.id}>
													{userOption.name} -{' '}
													{getUserRoleLabel(userOption.role)}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								<SelectedUserChips
									users={selectedMembers}
									onRemove={removeMember}
									showRole
								/>
							</div>

							<div className="grid grid-cols-2 gap-3 pt-4 lg:flex lg:justify-end">
								<Button
									asChild
									variant="outline"
									className="h-[48px] rounded-[12px] px-6 lg:h-[56px] lg:px-10"
								>
									<Link href="/teams">Cancel</Link>
								</Button>
								<Button
									onClick={submit}
									disabled={
										isSaving || !name.trim() || teamLeadIds.length === 0
									}
									className="h-[48px] rounded-[12px] bg-[#2F61E8] px-6 text-[16px] lg:h-[56px] lg:px-10 lg:text-[18px]"
								>
									{isSaving ? 'Creating...' : 'Create Team'}
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
