'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Filter, KeyRound, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/common/components/pagination';
import { PAGE_SIZE_OPTIONS } from '@/common/constants/pagination';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getUserRoleLabel } from '@/common/constants/user-role-label';
import type {
	ManagedUser,
	UserAccountStatus,
} from '@/users/backend/manage-users/manage-users.type';
import { useUserManagementHook } from './user-management.hook';

const teamLeadAccountStatuses: UserAccountStatus[] = [
	'active',
	'inactive',
	'blocked',
];
const adminAccountStatuses: UserAccountStatus[] = [
	'active',
	'inactive',
	'blocked',
];
const editableRoles: UserRole[] = [
	UserRole.ADMIN,
	UserRole.MANAGER,
	UserRole.TEAM_LEAD,
	UserRole.AGENT,
	UserRole.QUALITY_ASSURANCE,
	UserRole.LOAN_OFFICER,
];
const availabilityStatuses = [
	UserAvailabilityStatus.ACTIVE,
	UserAvailabilityStatus.INACTIVE,
];

function initials(name: string) {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat('en-US').format(new Date(value));
}

function statusLabel(status: UserAccountStatus) {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

function availabilityLabel(status: UserAvailabilityStatus) {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

const roleLabel = getUserRoleLabel;

function ReadOnlyField({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-[12px] font-semibold text-black">{label}</span>
			<div className="flex h-[40px] items-center justify-between rounded-[8px] border border-[#D4D7E3] bg-white px-3 text-[13px] text-[#0C1421]">
				<span className="truncate">{value}</span>
				<ChevronDown className="size-4 shrink-0 text-[#26395C] opacity-50" />
			</div>
		</div>
	);
}

function StatusSelect({
	user,
	management,
	className = '',
}: {
	user: ManagedUser;
	management: ManagementHook;
	className?: string;
}) {
	return (
		<Select
			value={user.status}
			onValueChange={(value) =>
				management.updateUser(user, {
					status: value as UserAccountStatus,
				})
			}
		>
			<SelectTrigger
				className={`h-[40px] rounded-[8px] border-[#D4D7E3] bg-white text-[13px] ${className}`}
				disabled={management.isSaving}
			>
				<span className="flex items-center gap-2 truncate">
					<StatusDot status={user.status} />
					{statusLabel(user.status)}
				</span>
			</SelectTrigger>
			<SelectContent>
				{teamLeadAccountStatuses.map((status) => (
					<SelectItem key={status} value={status}>
						{statusLabel(status)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function StatusDot({ status }: { status: UserAccountStatus }) {
	const color =
		status === 'active'
			? 'bg-[#10B981]'
			: status === 'blocked'
				? 'bg-[#F43F5E]'
				: 'bg-[#F59E0B]';

	return <span className={`size-2.5 rounded-full ${color}`} />;
}
function AvailabilitySelect({
	user,
	management,
	className = '',
}: {
	user: ManagedUser;
	management: ManagementHook;
	className?: string;
}) {
	return (
		<Select
			value={user.availabilityStatus}
			onValueChange={(value) =>
				management.updateUser(user, {
					availabilityStatus: value as UserAvailabilityStatus,
				})
			}
		>
			<SelectTrigger
				className={`h-[40px] rounded-[8px] border-[#D4D7E3] bg-white text-[13px] ${className}`}
				disabled={management.isSaving}
			>
				<span className="flex items-center gap-2 truncate">
					<span
						className={`size-2.5 rounded-full ${
							user.availabilityStatus === UserAvailabilityStatus.ACTIVE
								? 'bg-[#10B981]'
								: 'bg-[#94A3B8]'
						}`}
					/>
					{availabilityLabel(user.availabilityStatus)}
				</span>
			</SelectTrigger>
			<SelectContent>
				{availabilityStatuses.map((status) => (
					<SelectItem key={status} value={status}>
						{availabilityLabel(status)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
export function UserManagement() {
	const management = useUserManagementHook();
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	return (
		<div className="flex flex-col gap-4 lg:gap-6">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#313957] lg:text-[40px] lg:text-[#0C1421]">
					User Management
				</h1>
			</div>

			<div className="flex gap-2 lg:hidden">
				<div className="relative min-w-0 flex-1">
					<Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
					<Input
						value={management.search}
						onChange={(event) => management.setSearch(event.target.value)}
						placeholder="Search"
						className="h-[48px] rounded-[10px] border-[#D4D7E3] bg-white pl-12 text-[14px] focus-visible:ring-blue-500"
					/>
				</div>
				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={() => setShowMobileFilters((current) => !current)}
					className="size-[48px] shrink-0 rounded-[10px] border-[#D4D7E3] bg-white text-[#26395C]"
					aria-label="Toggle user filters"
				>
					<Filter className="size-5" />
				</Button>
			</div>

			<div
				className={`${
					showMobileFilters ? 'block' : 'hidden'
				} rounded-[14px] bg-white p-4 lg:block lg:rounded-[20px] lg:p-8`}
			>
				<div className="mb-4 hidden items-center gap-2 text-[#26395C] lg:flex">
					<Filter className="size-5" />
					<span>Filter</span>
				</div>
				<div className="grid gap-4 lg:grid-cols-3">
					{management.isAdmin && (
						<Select value={management.role} onValueChange={management.setRole}>
							<SelectTrigger className="h-[48px] rounded-[12px] border-[#D4D7E3]">
								<SelectValue placeholder="All Roles" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								{editableRoles.map((role) => (
									<SelectItem key={role} value={role}>
										{roleLabel(role)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					<Select
						value={management.status}
						onValueChange={management.setStatus}
					>
						<SelectTrigger className="h-[48px] rounded-[12px] border-[#D4D7E3]">
							<SelectValue placeholder="All Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							{(management.isAdmin
								? adminAccountStatuses
								: teamLeadAccountStatuses
							).map((status) => (
								<SelectItem key={status} value={status}>
									{statusLabel(status)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{management.isAdmin && (
						<Select
							value={management.teamId}
							onValueChange={management.setTeamId}
						>
							<SelectTrigger className="h-[48px] rounded-[12px] border-[#D4D7E3]">
								<SelectValue placeholder="All Team" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Team</SelectItem>
								{management.teams.map((team) => (
									<SelectItem key={team.id} value={team.id}>
										{team.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>
			</div>

			<div className="hidden flex-col gap-3 lg:flex lg:flex-row lg:justify-end">
				<div className="relative w-full lg:w-[390px]">
					<Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8897AD]" />
					<Input
						value={management.search}
						onChange={(event) => management.setSearch(event.target.value)}
						placeholder="Search user by name or email"
						className="h-[48px] rounded-[12px] border-[#D4D7E3] bg-white pl-12"
					/>
				</div>
			</div>

			{management.errorMessage && (
				<div className="rounded-[12px] bg-red-50 p-4 text-red-600">
					{management.errorMessage}
				</div>
			)}

			{management.resetPasswordResult && (
				<ResetPasswordNotice management={management} />
			)}

			<div className="flex flex-col gap-3 lg:hidden">
				{management.isLoading ? (
					<div className="rounded-[12px] bg-white p-5 text-center text-[#313957]">
						Loading users...
					</div>
				) : management.users.length === 0 ? (
					<div className="rounded-[12px] bg-white p-5 text-center text-[#313957]">
						No users found.
					</div>
				) : (
					management.users.map((user) => (
						<UserMobileCard key={user.id} user={user} management={management} />
					))
				)}
			</div>

			<div className="hidden overflow-hidden rounded-[20px] bg-white shadow-sm lg:block">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[1180px] text-left">
						<thead className="bg-[#F1F5FB]">
							<tr>
								<th className="px-6 py-5 font-semibold">User</th>
								<th className="px-6 py-5 font-semibold">Email</th>
								<th className="px-6 py-5 font-semibold">Role</th>
								<th className="px-6 py-5 font-semibold">Team</th>
								<th className="px-6 py-5 font-semibold">Status</th>
								<th className="px-6 py-5 font-semibold">Availability</th>
								<th className="px-6 py-5 font-semibold">Created On</th>
								{management.isAdmin && (
									<th className="px-6 py-5 font-semibold">Action</th>
								)}
							</tr>
						</thead>
						<tbody>
							{management.isLoading ? (
								<tr>
									<td
										className="px-6 py-10 text-center text-[#313957]"
										colSpan={management.isAdmin ? 8 : 7}
									>
										Loading users...
									</td>
								</tr>
							) : management.users.length === 0 ? (
								<tr>
									<td
										className="px-6 py-10 text-center text-[#313957]"
										colSpan={management.isAdmin ? 8 : 7}
									>
										No users found.
									</td>
								</tr>
							) : (
								management.users.map((user) => (
									<UserRow key={user.id} user={user} management={management} />
								))
							)}
						</tbody>
					</table>
				</div>
				<Pagination
					page={management.page}
					totalPages={management.totalPages}
					total={management.total}
					limit={management.limit}
					itemLabel="users"
					onPageChange={management.setPage}
					pageSizeOptions={PAGE_SIZE_OPTIONS}
					onPageSizeChange={management.setLimit}
				/>
			</div>

			<div className="lg:hidden">
				<Pagination
					page={management.page}
					totalPages={management.totalPages}
					total={management.total}
					limit={management.limit}
					itemLabel="users"
					onPageChange={management.setPage}
					pageSizeOptions={PAGE_SIZE_OPTIONS}
					onPageSizeChange={management.setLimit}
				/>
			</div>
		</div>
	);
}

type ManagementHook = ReturnType<typeof useUserManagementHook>;

function AdminRoleSelect({
	user,
	management,
	className,
}: {
	user: ManagedUser;
	management: ManagementHook;
	className: string;
}) {
	return (
		<Select
			value={user.role}
			onValueChange={(value) =>
				management.updateUser(user, { role: value as UserRole })
			}
		>
			<SelectTrigger className={className} disabled={management.isSaving}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{editableRoles.map((role) => (
					<SelectItem key={role} value={role}>
						{roleLabel(role)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function AdminTeamSelect({
	user,
	management,
	className,
}: {
	user: ManagedUser;
	management: ManagementHook;
	className: string;
}) {
	return (
		<Select
			value={user.team?.id || 'none'}
			onValueChange={(value) =>
				management.updateUser(user, { teamId: value === 'none' ? null : value })
			}
		>
			<SelectTrigger className={className} disabled={management.isSaving}>
				<SelectValue placeholder="No Team" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="none">No Team</SelectItem>
				{management.teams.map((team) => (
					<SelectItem key={team.id} value={team.id}>
						{team.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function AdminStatusSelect({
	user,
	management,
	className,
}: {
	user: ManagedUser;
	management: ManagementHook;
	className: string;
}) {
	return (
		<Select
			value={user.status}
			onValueChange={(value) =>
				management.updateUser(user, { status: value as UserAccountStatus })
			}
		>
			<SelectTrigger className={className} disabled={management.isSaving}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{adminAccountStatuses.map((status) => (
					<SelectItem key={status} value={status}>
						{statusLabel(status)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function AdminEditableFields({
	user,
	management,
}: {
	user: ManagedUser;
	management: ManagementHook;
}) {
	const className =
		'h-[40px] rounded-[8px] border-[#D4D7E3] bg-white text-[13px]';

	return (
		<>
			<div className="flex flex-col gap-2">
				<span className="text-[12px] font-semibold text-black">Role</span>
				<AdminRoleSelect
					user={user}
					management={management}
					className={className}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-[12px] font-semibold text-black">Team</span>
				<AdminTeamSelect
					user={user}
					management={management}
					className={className}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-[12px] font-semibold text-black">Status</span>
				<AdminStatusSelect
					user={user}
					management={management}
					className={className}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-[12px] font-semibold text-black">
					Availability
				</span>
				<AvailabilitySelect
					user={user}
					management={management}
					className={className}
				/>
			</div>
		</>
	);
}

function UserMobileCard({
	user,
	management,
}: {
	user: ManagedUser;
	management: ManagementHook;
}) {
	return (
		<div className="rounded-[12px] border border-[#D4D7E3] bg-white p-4 shadow-sm">
			<div className="mb-5 flex items-center gap-4">
				<span className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-[#C5BFF0] text-[18px] font-semibold text-[#0C1421]">
					{initials(user.name)}
				</span>
				<div className="min-w-0">
					<h2 className="truncate text-[16px] font-semibold text-[#0C1421]">
						{user.name}
					</h2>
					<p className="truncate text-[12px] font-medium text-black">
						{user.email || 'N/A'}
					</p>
				</div>
			</div>

			{management.isAdmin ? (
				<div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
					<AdminEditableFields user={user} management={management} />
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
					<ReadOnlyField label="Role" value={roleLabel(user.role)} />
					<ReadOnlyField label="Team" value={user.team?.name || 'No Team'} />
					<div className="flex flex-col gap-2">
						<span className="text-[12px] font-semibold text-black">Status</span>
						<StatusSelect
							user={user}
							management={management}
							className="w-full"
						/>
					</div>
					{management.canManageAvailability ? (
						<div className="flex flex-col gap-2">
							<span className="text-[12px] font-semibold text-black">
								Availability
							</span>
							<AvailabilitySelect
								user={user}
								management={management}
								className="w-full"
							/>
						</div>
					) : (
						<ReadOnlyField
							label="Availability"
							value={availabilityLabel(user.availabilityStatus)}
						/>
					)}
				</div>
			)}

			<div className="mt-4 flex items-center justify-between gap-3 text-[12px] font-semibold text-black">
				<span>Created On: {formatDate(user.createdAt)}</span>
				{management.isAdmin && (
					<AdminPasswordResetAction user={user} management={management} />
				)}
			</div>
		</div>
	);
}
function ResetPasswordNotice({ management }: { management: ManagementHook }) {
	const result = management.resetPasswordResult;
	if (!result) return null;

	const copyPassword = async () => {
		await navigator.clipboard.writeText(result.temporaryPassword);
	};

	return (
		<div className="rounded-[14px] border border-blue-100 bg-white p-4 shadow-sm">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<p className="text-[14px] font-semibold text-[#0C1421]">
						Temporary password generated for {result.user.name}
					</p>
					<p className="mt-1 text-[13px] text-[#313957]">
						Copy this password and share it with the user. It will not be shown
						again after this message is closed.
					</p>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<code className="rounded-[10px] bg-[#F1F5FB] px-4 py-3 text-[15px] font-semibold text-[#0C1421]">
						{result.temporaryPassword}
					</code>
					<Button
						type="button"
						variant="outline"
						onClick={copyPassword}
						className="h-[42px] rounded-[10px] border-[#D4D7E3]"
					>
						<Copy className="mr-2 size-4" />
						Copy
					</Button>
					<Button
						type="button"
						variant="ghost"
						onClick={() => management.setResetPasswordResult(null)}
						className="h-[42px] rounded-[10px]"
						aria-label="Close temporary password notice"
					>
						<X className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function AdminPasswordResetAction({
	user,
	management,
}: {
	user: ManagedUser;
	management: ManagementHook;
}) {
	return (
		<Button
			type="button"
			variant="outline"
			onClick={() => management.resetUserPassword(user)}
			disabled={management.isResettingPassword}
			className="h-[36px] rounded-[8px] border-[#D4D7E3] px-3 text-[12px] text-[#26395C]"
		>
			<KeyRound className="mr-2 size-4" />
			Reset
		</Button>
	);
}
function UserRow({
	user,
	management,
}: {
	user: ManagedUser;
	management: ManagementHook;
}) {
	if (management.isAdmin) {
		return (
			<tr className="border-t border-[#D4D7E3]">
				<td className="px-6 py-4">
					<div className="flex items-center gap-3">
						<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C5BFF0] text-xs">
							{initials(user.name)}
						</span>
						<span className="font-medium">{user.name}</span>
					</div>
				</td>
				<td className="px-6 py-4">{user.email || 'N/A'}</td>
				<td className="px-6 py-4">
					<AdminRoleSelect
						user={user}
						management={management}
						className="h-[40px] w-[170px] rounded-[8px] border-[#D4D7E3] bg-white text-[13px]"
					/>
				</td>
				<td className="px-6 py-4">
					<AdminTeamSelect
						user={user}
						management={management}
						className="h-[40px] w-[160px] rounded-[8px] border-[#D4D7E3] bg-white text-[13px]"
					/>
				</td>
				<td className="px-6 py-4">
					<AdminStatusSelect
						user={user}
						management={management}
						className="h-[40px] w-[135px] rounded-[8px] border-[#D4D7E3] bg-white text-[13px]"
					/>
				</td>
				<td className="px-6 py-4">
					<AvailabilitySelect
						user={user}
						management={management}
						className="w-[135px]"
					/>
				</td>
				<td className="px-6 py-4">{formatDate(user.createdAt)}</td>
				<td className="px-6 py-4">
					<AdminPasswordResetAction user={user} management={management} />
				</td>
			</tr>
		);
	}

	return (
		<tr className="border-t border-[#D4D7E3]">
			<td className="px-6 py-4">
				<div className="flex items-center gap-3">
					<span className="flex size-8 items-center justify-center rounded-full bg-[#C5BFF0] text-xs">
						{initials(user.name)}
					</span>
					<span className="font-medium">{user.name}</span>
				</div>
			</td>
			<td className="px-6 py-4">{user.email || 'N/A'}</td>
			<td className="px-6 py-4">{roleLabel(user.role)}</td>
			<td className="px-6 py-4">{user.team?.name || 'No Team'}</td>
			<td className="px-6 py-4">
				<StatusSelect
					user={user}
					management={management}
					className="w-[135px]"
				/>
			</td>
			<td className="px-6 py-4">
				{management.canManageAvailability ? (
					<AvailabilitySelect
						user={user}
						management={management}
						className="w-[135px]"
					/>
				) : (
					availabilityLabel(user.availabilityStatus)
				)}
			</td>
			<td className="px-6 py-4">{formatDate(user.createdAt)}</td>
		</tr>
	);
}
