'use client';

import {
	ArrowLeft,
	Bold,
	Heading2,
	Heading3,
	Italic,
	List,
	ListOrdered,
	RotateCcw,
	RotateCw,
	Underline,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DEFAULT_CALL_TRANSFER_SHEET_CONTENT } from '@/common/constants/call-transfer-sheet-content';
import { sanitizeRichTextHtml } from '@/common/utils/sanitize-rich-text-html';
import {
	getCallTransferSheetApi,
	updateCallTransferSheetApi,
} from '@/configurations/frontend/call-transfer-sheet';

type EditorCommand =
	| 'bold'
	| 'italic'
	| 'underline'
	| 'insertUnorderedList'
	| 'insertOrderedList'
	| 'undo'
	| 'redo';

const TOOLBAR_ACTIONS: Array<{
	label: string;
	command: EditorCommand | 'heading2' | 'heading3';
	icon: typeof Bold;
}> = [
	{ label: 'Bold', command: 'bold', icon: Bold },
	{ label: 'Italic', command: 'italic', icon: Italic },
	{ label: 'Underline', command: 'underline', icon: Underline },
	{ label: 'Heading 2', command: 'heading2', icon: Heading2 },
	{ label: 'Heading 3', command: 'heading3', icon: Heading3 },
	{ label: 'Bulleted list', command: 'insertUnorderedList', icon: List },
	{ label: 'Numbered list', command: 'insertOrderedList', icon: ListOrdered },
	{ label: 'Undo', command: 'undo', icon: RotateCcw },
	{ label: 'Redo', command: 'redo', icon: RotateCw },
];

export function CallTransferSheetEditor() {
	const editorRef = useRef<HTMLDivElement>(null);
	const [content, setContent] = useState(DEFAULT_CALL_TRANSFER_SHEET_CONTENT);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		async function loadCallTransferSheet() {
			try {
				const response = await getCallTransferSheetApi();
				if (isMounted && response.success && response.data) {
					setContent(response.data.value);
				}
			} catch (error) {
				if (isMounted) {
					setErrorMessage(
						error instanceof Error
							? error.message
							: 'Unable to load the call transfer sheet',
					);
				}
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}

		loadCallTransferSheet();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (editorRef.current && editorRef.current.innerHTML !== content) {
			editorRef.current.innerHTML = content;
		}
	}, [content]);

	function syncContent() {
		const editor = editorRef.current;
		if (!editor) return;

		const sanitizedContent = sanitizeRichTextHtml(editor.innerHTML);
		if (editor.innerHTML !== sanitizedContent) {
			editor.innerHTML = sanitizedContent;
		}
		setContent(sanitizedContent);
	}

	function runCommand(command: EditorCommand | 'heading2' | 'heading3') {
		const editor = editorRef.current;
		if (!editor) return;

		editor.focus();
		if (command === 'heading2' || command === 'heading3') {
			document.execCommand(
				'formatBlock',
				false,
				command === 'heading2' ? 'h2' : 'h3',
			);
		} else {
			document.execCommand(command, false);
		}
		syncContent();
	}

	function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
		event.preventDefault();
		document.execCommand(
			'insertText',
			false,
			event.clipboardData.getData('text/plain'),
		);
		window.setTimeout(syncContent, 0);
	}

	async function saveContent() {
		setErrorMessage('');
		setSuccessMessage('');
		setIsSaving(true);

		try {
			const response = await updateCallTransferSheetApi(content);
			if (!response.success || !response.data) {
				throw new Error(
					response.error || 'Unable to update the call transfer sheet',
				);
			}

			setContent(response.data.value);
			setSuccessMessage('Call transfer sheet updated successfully.');
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Unable to update the call transfer sheet',
			);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="flex flex-col gap-6 py-6 lg:py-10">
			<div className="flex flex-col gap-2">
				<Link
					href="/portal-settings"
					className="inline-flex w-fit items-center gap-2 text-[14px] font-medium text-[#2563EB]"
				>
					<ArrowLeft className="size-4" /> Back to Portal Settings
				</Link>
				<h1 className="font-[var(--font-poppins)] text-[28px] font-semibold text-[#0C1421] lg:text-[32px]">
					Update Call Transfer Sheet
				</h1>
			</div>

			<section className="rounded-[12px] border border-[#D4D7E3] bg-white shadow-sm">
				<div className="flex flex-wrap gap-2 border-b border-[#D4D7E3] p-3">
					{TOOLBAR_ACTIONS.map((action) => {
						const Icon = action.icon;
						return (
							<Button
								key={action.command}
								type="button"
								variant="outline"
								size="icon"
								title={action.label}
								aria-label={action.label}
								onMouseDown={(event) => event.preventDefault()}
								onClick={() => runCommand(action.command)}
							>
								<Icon className="size-4" />
							</Button>
						);
					})}
				</div>

				{isLoading ? (
					<div className="min-h-[360px] p-6 text-[15px] text-[#6B7A99]">
						Loading call transfer sheet...
					</div>
				) : (
					<div
						ref={editorRef}
						contentEditable
						suppressContentEditableWarning
						role="textbox"
						aria-multiline="true"
						onInput={syncContent}
						onPaste={handlePaste}
						className="min-h-[360px] p-6 text-[15px] leading-6 text-[#0C1421] outline-none [&_h2]:mb-4 [&_h2]:mt-1 [&_h2]:text-[22px] [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:my-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
					/>
				)}
			</section>

			{errorMessage ? (
				<p className="text-sm font-medium text-red-600">{errorMessage}</p>
			) : null}
			{successMessage ? (
				<p className="text-sm font-medium text-emerald-700">{successMessage}</p>
			) : null}

			<div className="flex justify-end">
				<Button
					type="button"
					onClick={saveContent}
					disabled={isLoading || isSaving}
					className="h-11 bg-[#2563EB] px-6 text-white hover:bg-blue-700"
				>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		</div>
	);
}
