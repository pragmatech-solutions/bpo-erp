'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createDisputeApi } from '@/disputes/frontend/create-dispute.api';

type CreateDisputeDialogProps = {
	leadId: string;
	onClose: () => void;
	onCreated: (disputeId: string) => void;
};

export function CreateDisputeDialog({
	leadId,
	onClose,
	onCreated,
}: CreateDisputeDialogProps) {
	const [recordingLink, setRecordingLink] = useState('');
	const [qaNotes, setQaNotes] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!qaNotes.trim()) {
			setError('QA notes are required');
			return;
		}

		setIsSubmitting(true);
		setError('');
		const result = await createDisputeApi({
			leadId,
			recordingLink: recordingLink.trim() || undefined,
			qaNotes,
		});

		if (result.success && result.id) {
			onCreated(result.id);
			return;
		}

		setError(result.error || 'Failed to create dispute');
		setIsSubmitting(false);
	}

	// Rendered in a portal so the overlay is never sized or clipped by the lead card.
	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
			onClick={(event) => {
				event.stopPropagation();
				if (!isSubmitting) onClose();
			}}
		>
			<div
				className="w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)] sm:p-8"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-1">
						<h2 className="text-[18px] font-semibold text-[#0C1421] lg:text-[20px]">
							Create Dispute
						</h2>
						<p className="text-[14px] font-medium text-[#313957]">
							Fields marked with * are required
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						aria-label="Close"
						className="text-[#8897AD] hover:text-[#313957]"
					>
						<X className="size-5" />
					</button>
				</div>

				<div className="my-5 h-px w-full bg-[#D4D7E3]" />

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="disputeRecordingLink"
							className="text-[14px] font-medium text-[#313957]"
						>
							Recording Link
						</Label>
						<div className="relative">
							<Link2 className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
							<Input
								id="disputeRecordingLink"
								type="url"
								placeholder="https://example.com/recording"
								value={recordingLink}
								onChange={(event) => setRecordingLink(event.target.value)}
								className="h-[48px] rounded-[12px] border-[#D4D7E3] bg-white pl-12 text-[14px] text-[#313957] placeholder:text-[#8897AD] focus-visible:ring-blue-500"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label
							htmlFor="disputeQaNotes"
							className="text-[14px] font-medium text-[#313957]"
						>
							QA Notes *
						</Label>
						<textarea
							id="disputeQaNotes"
							placeholder="Explain why this lead is being disputed"
							value={qaNotes}
							onChange={(event) => setQaNotes(event.target.value)}
							className="min-h-[110px] w-full rounded-[12px] border border-[#D4D7E3] bg-white p-4 text-[14px] text-[#313957] placeholder:text-[#8897AD] focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

					{error ? (
						<p className="text-sm font-medium text-red-500">{error}</p>
					) : null}

					<div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
							className="h-[45px] rounded-[12px] border-[#D4D7E3] px-8 text-[16px] font-medium text-[#313957]"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-[45px] rounded-[12px] bg-[#2563EB] px-8 text-[16px] font-medium text-white hover:bg-blue-700"
						>
							{isSubmitting ? 'Creating...' : 'Create Dispute'}
						</Button>
					</div>
				</form>
			</div>
		</div>,
		document.body,
	);
}
