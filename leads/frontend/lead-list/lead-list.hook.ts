'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ListedLead } from '@/leads/backend/list-leads/list-leads.type';
import { getLeadsApi } from './lead-list.api';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { LoanType } from '@/common/constants/loan-type.enum';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getAgentsApi } from '@/agents/frontend/list-agents';
import type { AgentListItem } from '@/agents/backend/list-agents/list-agents.type';

export type DurationPreset =
	| 'Today'
	| 'Yesterday'
	| 'Last 7 Days'
	| 'Last 30 Days'
	| 'This Month'
	| 'Last Month'
	| 'All'
	| 'Custom Range';

export type LeadStatusFilter = LeadStatus | 'All Status';
export type PaymentStatusFilter = 'paid' | 'unpaid' | 'All Payment Status';

export function useLeadListHook() {
	const [leads, setLeads] = useState<ListedLead[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<LeadStatusFilter>('All Status');
	const [paymentStatus, setPaymentStatus] =
		useState<PaymentStatusFilter>('All Payment Status');
	const [duration, setDuration] = useState<DurationPreset>('All');
	const [campaign, setCampaign] = useState<string>('All Campaigns');
	const [agentId, setAgentId] = useState<string>('All Agents');
	const [customDateRange, setCustomDateRange] = useState<{
		start: Date;
		end?: Date;
	} | null>(null);

	const [isAdmin, setIsAdmin] = useState(false);
	const [agents, setAgents] = useState<AgentListItem[]>([]);

	useEffect(() => {
		const userInfo = getCurrentLoggedInUserInformation();
		if (userInfo?.currentUser?.role === UserRole.ADMIN) {
			setIsAdmin(true);
			const fetchAgents = async () => {
				const response = await getAgentsApi();
				if (response.success && response.data) {
					setAgents(response.data);
				}
			};
			fetchAgents();
		}
	}, []);

	const fetchLeads = useCallback(async () => {
		setIsLoading(true);
		let startDate: Date | undefined;
		let endDate: Date | undefined;

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		switch (duration) {
			case 'Today':
				startDate = today;
				break;
			case 'Yesterday':
				startDate = new Date(today);
				startDate.setDate(startDate.getDate() - 1);
				endDate = today;
				break;
			case 'Last 7 Days':
				startDate = new Date(today);
				startDate.setDate(startDate.getDate() - 7);
				break;
			case 'Last 30 Days':
				startDate = new Date(today);
				startDate.setDate(startDate.getDate() - 30);
				break;
			case 'This Month':
				startDate = new Date(now.getFullYear(), now.getMonth(), 1);
				break;
			case 'Last Month':
				startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				endDate = new Date(now.getFullYear(), now.getMonth(), 0);
				break;
			case 'Custom Range':
				if (customDateRange) {
					startDate = customDateRange.start;
					endDate = customDateRange.end;
				}
				break;
			default:
				startDate = undefined;
				endDate = undefined;
		}

		const response = await getLeadsApi({
			limit: 50,
			search: search || undefined,
			status: status === 'All Status' ? undefined : status,
			paymentStatus:
				paymentStatus === 'All Payment Status' ? undefined : paymentStatus,
			startDate,
			endDate,
			campaign: campaign === 'All Campaigns' ? undefined : campaign,
			agentId: agentId === 'All Agents' ? undefined : agentId,
		});

		if (!response.success || !response.data) {
			setErrorMessage(response.error || 'Failed to fetch leads');
			setLeads([]);
			setIsLoading(false);
			return;
		}

		setLeads(response.data);
		setErrorMessage('');
		setIsLoading(false);
	}, [
		search,
		status,
		paymentStatus,
		duration,
		customDateRange,
		campaign,
		agentId,
	]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchLeads();
		}, 300);
		return () => clearTimeout(timeoutId);
	}, [fetchLeads]);

	const resetFilters = () => {
		setSearch('');
		setStatus('All Status');
		setPaymentStatus('All Payment Status');
		setDuration('All');
		setCampaign('All Campaigns');
		setAgentId('All Agents');
		setCustomDateRange(null);
	};

	return {
		leads,
		isLoading,
		errorMessage,
		isAdmin,
		agents,
		filters: {
			search,
			setSearch,
			status,
			setStatus,
			paymentStatus,
			setPaymentStatus,
			duration,
			setDuration,
			campaign,
			setCampaign,
			agentId,
			setAgentId,
			customDateRange,
			setCustomDateRange,
		},
		resetFilters,
		refresh: fetchLeads,
	};
}
