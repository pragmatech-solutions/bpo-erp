'use client';

import { Edit2, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { CampaignListItem } from '@/campaigns/backend/campaigns/campaigns.type';
import { useCampaignManagementHook } from './campaign-management.hook';

function formatDate(value: string) {
	return new Intl.DateTimeFormat('en-US').format(new Date(value));
}

function CampaignToggle({
	row,
	isSaving,
	onToggle,
}: {
	row: CampaignListItem;
	isSaving: boolean;
	onToggle: (row: CampaignListItem, next: boolean) => void;
}) {
	return (
		<button
			type="button"
			disabled={isSaving}
			onClick={() => onToggle(row, !row.isActive)}
			className={`h-7 w-14 rounded-full p-1 transition-colors disabled:opacity-60 ${
				row.isActive ? 'bg-[#10B981]' : 'bg-[#F43F5E]'
			}`}
			aria-label={row.isActive ? 'Disable campaign' : 'Enable campaign'}
		>
			<span
				className={`block size-5 rounded-full bg-white transition-transform ${
					row.isActive ? 'translate-x-7' : 'translate-x-0'
				}`}
			/>
		</button>
	);
}

function CampaignActions({
	row,
	isSaving,
	onEdit,
	onDisable,
}: {
	row: CampaignListItem;
	isSaving: boolean;
	onEdit: (row: CampaignListItem) => void;
	onDisable: (row: CampaignListItem, next: boolean) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				type="button"
				onClick={() => onEdit(row)}
				disabled={isSaving}
				title="Edit campaign"
				className="size-8 rounded-[4px] text-[#2F61E8]"
			>
				<Edit2 className="size-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				type="button"
				onClick={() => onDisable(row, false)}
				disabled={isSaving || !row.isActive}
				title="Disable campaign"
				className="size-8 rounded-[4px] text-[#F43F5E]"
			>
				<Trash2 className="size-4" />
			</Button>
		</div>
	);
}

export function CampaignManagement() {
	const campaign = useCampaignManagementHook();
	const campaigns = campaign.campaigns ?? [];
	const from = campaign.total === 0 ? 0 : (campaign.page - 1) * campaign.limit + 1;
	const to = Math.min(campaign.total, campaign.page * campaign.limit);

	return (
		<div className="flex flex-col gap-4 lg:gap-6">
			<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#0C1421] lg:text-[40px]">
				<span className="lg:hidden">Campaign</span>
				<span className="hidden lg:inline">Campaign Management</span>
			</h1>

			<div className="rounded-[14px] bg-white p-4 shadow-sm lg:rounded-[20px] lg:p-8">
				<h2 className="mb-2 text-[18px] font-semibold text-[#0C1421]">
					{campaign.editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
				</h2>
				{campaign.editingCampaign && (
					<p className="mb-5 text-sm text-[#4547D3]">
						Editing: {campaign.editingCampaign.name}
					</p>
				)}
				{!campaign.editingCampaign && <div className="mb-5" />}
				<div className="grid gap-4 lg:grid-cols-[1fr_280px_190px] lg:items-end">
					<div>
						<label className="mb-2 block text-[15px] font-medium text-[#26395C]">
							Campaign Name
						</label>
						<Input
							value={campaign.name}
							onChange={(event) => campaign.setName(event.target.value)}
							placeholder="Enter campaign name"
							className="h-[48px] rounded-[12px] border-[#D4D7E3]"
						/>
					</div>
					<div>
						<label className="mb-2 block text-[15px] font-medium text-[#26395C]">
							Status
						</label>
						<Select
							value={campaign.isActive ? 'active' : 'disabled'}
							onValueChange={(value) => campaign.setIsActive(value === 'active')}
						>
							<SelectTrigger className="h-[48px] rounded-[12px] border-[#D4D7E3]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="disabled">Disabled</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Button
						onClick={campaign.saveCampaign}
						disabled={campaign.isSaving || !campaign.name.trim()}
						className="h-[48px] justify-self-end rounded-[12px] bg-[#2F61E8] px-8 text-[16px] lg:w-full"
					>
						{campaign.isSaving
							? 'Saving...'
							: campaign.editingCampaign
								? 'Save Campaign'
								: '+ Add Campaign'}
					</Button>
				</div>
				{campaign.editingCampaign && (
					<Button
						variant="ghost"
						className="mt-3 text-[#4547D3]"
						onClick={campaign.resetForm}
					>
						Cancel edit
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
				<Select value={campaign.status} onValueChange={campaign.setStatus}>
					<SelectTrigger className="hidden h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white lg:flex lg:w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="disabled">Disabled</SelectItem>
					</SelectContent>
				</Select>
				<div className="relative w-full lg:w-[344px]">
					<Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#8897AD] lg:left-4 lg:right-auto" />
					<Input
						value={campaign.search}
						onChange={(event) => campaign.setSearch(event.target.value)}
						placeholder="Search Campaign"
						className="h-[48px] rounded-[12px] border-[#D4D7E3] bg-white pr-12 text-[16px] lg:pl-12 lg:pr-4"
					/>
				</div>
			</div>

			{campaign.errorMessage && (
				<div className="rounded-[12px] bg-red-50 p-4 text-red-600">
					{campaign.errorMessage}
				</div>
			)}

			<div className="flex flex-col gap-2 lg:hidden">
				{campaign.isLoading ? (
					<div className="rounded-[12px] bg-white p-5 text-center text-[#313957]">
						Loading campaigns...
					</div>
				) : campaigns.length === 0 ? (
					<div className="rounded-[12px] bg-white p-5 text-center text-[#313957]">
						No campaigns found.
					</div>
				) : (
					campaigns.map((row) => (
						<div
							key={row.id}
							className="rounded-[12px] border border-[#D4D7E3] bg-white p-4 shadow-sm"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<h3 className="truncate text-[16px] font-semibold text-[#0C1421]">
										{row.name}
									</h3>
									<p className="mt-3 text-[14px] font-medium text-[#26395C]">
										{row.createdBy} - {formatDate(row.createdAt)}
									</p>
								</div>
								<CampaignToggle
									row={row}
									isSaving={campaign.isSaving}
									onToggle={campaign.updateCampaignStatus}
								/>
							</div>
							<div className="mt-3 flex justify-end">
								<CampaignActions
									row={row}
									isSaving={campaign.isSaving}
									onEdit={campaign.startEdit}
									onDisable={campaign.updateCampaignStatus}
								/>
							</div>
						</div>
					))
				)}
			</div>

			<div className="hidden overflow-hidden rounded-[20px] bg-white shadow-sm lg:block">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[780px] text-left">
						<thead className="bg-[#F1F5FB] text-[#0C1421]">
							<tr>
								<th className="px-6 py-5 font-semibold">Campaign Name</th>
								<th className="px-6 py-5 font-semibold">Status</th>
								<th className="px-6 py-5 font-semibold">Created By</th>
								<th className="px-6 py-5 font-semibold">Created On</th>
								<th className="px-6 py-5 font-semibold">Action</th>
							</tr>
						</thead>
						<tbody>
							{campaign.isLoading ? (
								<tr>
									<td className="px-6 py-10 text-center text-[#313957]" colSpan={5}>
										Loading campaigns...
									</td>
								</tr>
							) : campaigns.length === 0 ? (
								<tr>
									<td className="px-6 py-10 text-center text-[#313957]" colSpan={5}>
										No campaigns found.
									</td>
								</tr>
							) : (
								campaigns.map((row) => (
									<tr key={row.id} className="border-t border-[#D4D7E3]">
										<td className="px-6 py-5 font-medium">{row.name}</td>
										<td className="px-6 py-5">
											<CampaignToggle
												row={row}
												isSaving={campaign.isSaving}
												onToggle={campaign.updateCampaignStatus}
											/>
										</td>
										<td className="px-6 py-5">{row.createdBy}</td>
										<td className="px-6 py-5">{formatDate(row.createdAt)}</td>
										<td className="px-6 py-5">
											<CampaignActions
												row={row}
												isSaving={campaign.isSaving}
												onEdit={campaign.startEdit}
												onDisable={campaign.updateCampaignStatus}
											/>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				<div className="flex flex-col gap-3 border-t border-[#D4D7E3] px-6 py-4 text-[#8897AD] lg:flex-row lg:items-center lg:justify-between">
					<span>
						Showing {from} to {to} of {campaign.total} campaigns
					</span>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => campaign.setPage(Math.max(1, campaign.page - 1))}
							disabled={campaign.page === 1}
						>
							&lt;
						</Button>
						<span className="text-[#26395C]">
							{campaign.page} / {campaign.totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								campaign.setPage(Math.min(campaign.totalPages, campaign.page + 1))
							}
							disabled={campaign.page === campaign.totalPages}
						>
							&gt;
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
