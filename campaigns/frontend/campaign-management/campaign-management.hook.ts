'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/common/constants/pagination';
import type { CampaignListItem } from '@/campaigns/backend/campaigns/campaigns.type';
import {
	createCampaignApi,
	getCampaignsApi,
	updateCampaignApi,
	type CampaignStatusFilter,
} from './campaign-management.api';

export function useCampaignManagementHook() {
	const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<CampaignStatusFilter>('all');
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [name, setName] = useState('');
	const [isActive, setIsActive] = useState(true);
	const [editingCampaign, setEditingCampaign] =
		useState<CampaignListItem | null>(null);
	const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(total / limit)),
		[total, limit],
	);

	const loadCampaigns = useCallback(async () => {
		try {
			setIsLoading(true);
			setErrorMessage('');
			const data = await getCampaignsApi({ search, status, page, limit });
			setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
			setTotal(typeof data.total === 'number' ? data.total : 0);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to load campaigns',
			);
		} finally {
			setIsLoading(false);
		}
	}, [limit, page, search, status]);

	useEffect(() => {
		loadCampaigns();
	}, [loadCampaigns]);

	const resetForm = () => {
		setName('');
		setIsActive(true);
		setEditingCampaign(null);
		setErrorMessage('');
	};

	const saveCampaign = async () => {
		try {
			setIsSaving(true);
			setErrorMessage('');
			if (editingCampaign) {
				await updateCampaignApi(editingCampaign.id, { name, isActive });
			} else {
				await createCampaignApi({ name, isActive });
			}
			resetForm();
			await loadCampaigns();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to save campaign',
			);
		} finally {
			setIsSaving(false);
		}
	};

	const startEdit = (campaign: CampaignListItem) => {
		setErrorMessage('');
		setEditingCampaign(campaign);
		setName(campaign.name);
		setIsActive(campaign.isActive);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const updateCampaignStatus = async (
		campaign: CampaignListItem,
		next: boolean,
	) => {
		if (isSaving) return;

		if (!next) {
			const confirmed = window.confirm(
				'Disable this campaign? Existing leads will keep their campaign value.',
			);
			if (!confirmed) return;
		}

		try {
			setIsSaving(true);
			setErrorMessage('');
			await updateCampaignApi(campaign.id, { isActive: next });
			if (editingCampaign?.id === campaign.id) {
				setEditingCampaign({ ...editingCampaign, isActive: next });
				setIsActive(next);
			}
			await loadCampaigns();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to update campaign',
			);
		} finally {
			setIsSaving(false);
		}
	};

	return {
		campaigns,
		search,
		setSearch: (value: string) => {
			setSearch(value);
			setPage(1);
		},
		status,
		setStatus: (value: CampaignStatusFilter) => {
			setStatus(value);
			setPage(1);
		},
		page,
		setPage,
		total,
		limit,
		setLimit: (value: number) => {
			setLimit(value);
			setPage(1);
		},
		totalPages,
		isLoading,
		isSaving,
		errorMessage,
		name,
		setName,
		isActive,
		setIsActive,
		editingCampaign,
		saveCampaign,
		resetForm,
		startEdit,
		updateCampaignStatus,
		refresh: loadCampaigns,
	};
}
