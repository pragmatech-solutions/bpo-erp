'use client';

import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getUserRoleLabel } from '@/common/constants/user-role-label';
import type { TeamPerformanceData } from '@/teams/backend/manage-teams/manage-teams.type';
import { getTeamPerformanceApi } from '@/teams/frontend/team-overview';
import { StatCards } from '@/teams/frontend/team-overview';

function initials(name: string) {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

export function TeamPerformance({ id }: { id: string }) {
	const [data, setData] = useState<TeamPerformanceData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		async function loadTeam() {
			try {
				setIsLoading(true);
				setErrorMessage('');
				setData(await getTeamPerformanceApi(id));
			} catch (error) {
				setErrorMessage(
					error instanceof Error ? error.message : 'Unable to load team',
				);
			} finally {
				setIsLoading(false);
			}
		}

		loadTeam();
	}, [id]);

	if (isLoading) {
		return <div className="text-[#313957]">Loading team performance...</div>;
	}

	if (errorMessage) {
		return (
			<div className="rounded-[12px] bg-red-50 p-4 text-red-600">
				{errorMessage}
			</div>
		);
	}

	if (!data) {
		return <div className="text-[#313957]">No team data found.</div>;
	}

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-[var(--font-poppins)] text-[28px] font-semibold text-[#0C1421] lg:text-[40px]">
					Team Performance
				</h1>
				<Link
					href="/teams"
					className="mt-3 inline-flex items-center gap-2 text-[16px] text-[#2563EB]"
				>
					<ArrowLeft className="size-4" />
					Back to Teams
				</Link>
			</div>

			<div className="flex max-w-[460px] items-center gap-6 rounded-[20px] bg-[#F7FBFF] p-6 shadow-sm">
				<div className="flex size-[82px] items-center justify-center rounded-full bg-[#E5F0FF]">
					<Users className="size-10 text-[#26395C]" />
				</div>
				<div>
					<h2 className="text-[28px] font-semibold text-[#0C1421]">
						{data.name}
					</h2>
					<p className="text-[17px] text-[#0C1421]">
						{data.teamLeads.length > 1 ? 'Team Leads' : 'Team Lead'}:{' '}
						{data.teamLeads.length === 0
							? 'Unassigned'
							: data.teamLeads.map((teamLead) => teamLead.name).join(', ')}
					</p>
					<p className="text-[17px] text-[#0C1421]">
						Total Members: {String(data.memberCount).padStart(2, '0')}
					</p>
					<p className="text-[15px] text-[#8897AD]">
						{data.agentCount} agents · {data.loanOfficerCount} loan officers
					</p>
				</div>
			</div>

			<StatCards stats={data.stats} />

			<div className="overflow-hidden rounded-[20px] bg-white shadow-sm">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[780px] text-left">
						<thead className="bg-[#F1F5FB]">
							<tr>
								<th className="px-6 py-5 font-semibold">Members</th>
								<th className="px-6 py-5 font-semibold">Role</th>
								<th className="px-6 py-5 font-semibold">Total Leads</th>
								<th className="px-6 py-5 font-semibold">Pending</th>
								<th className="px-6 py-5 font-semibold">Billable</th>
								<th className="px-6 py-5 font-semibold">Non-Billable</th>
							</tr>
						</thead>
						<tbody>
							{data.members.length === 0 ? (
								<tr>
									<td
										className="px-6 py-10 text-center text-[#313957]"
										colSpan={6}
									>
										No members found for this team.
									</td>
								</tr>
							) : (
								data.members.map((member) => (
									<tr key={member.id} className="border-t border-[#D4D7E3]">
										<td className="px-6 py-5">
											<div className="flex items-center gap-3">
												<span className="flex size-8 items-center justify-center rounded-full bg-[#C5BFF0] text-xs">
													{initials(member.name)}
												</span>
												<div>
													<div className="font-medium">{member.name}</div>
													<div className="text-sm text-[#8897AD]">
														{member.email || '—'}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-5">
											<div>{getUserRoleLabel(member.role)}</div>
											<div className="text-sm text-[#8897AD]">
												{member.role === UserRole.LOAN_OFFICER
													? 'Leads handled'
													: 'Leads created'}
											</div>
										</td>
										<td className="px-6 py-5">{member.stats.total}</td>
										<td className="px-6 py-5 text-[#F59E0B]">
											{member.stats.pending}
										</td>
										<td className="px-6 py-5 text-[#10B981]">
											{member.stats.billable}
										</td>
										<td className="px-6 py-5 text-[#F43F5E]">
											{member.stats.nonBillable}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
