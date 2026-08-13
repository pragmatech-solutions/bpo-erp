'use client';

import type { LucideIcon } from 'lucide-react';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAvailabilityToggleHook } from '@/common/components/availability-toggle/availability-toggle.hook';
import { cn } from '@/lib/utils';
import { useAccountSettingsHook } from './account-settings.hook';

function ProfileInput({
	id,
	label,
	icon: Icon,
	className,
	children,
}: {
	id: string;
	label: string;
	icon: LucideIcon;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<Label htmlFor={id} className="text-[14px] font-medium text-[#26395C]">
				{label}
			</Label>
			<div className="relative">
				<Icon className="pointer-events-none absolute left-5 top-1/2 size-[18px] -translate-y-1/2 text-[#26395C]" />
				{children}
			</div>
		</div>
	);
}

function PasswordInput({
	id,
	label,
	value,
	onChange,
	isVisible,
	onToggleVisibility,
	placeholder,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	isVisible: boolean;
	onToggleVisibility: () => void;
	placeholder: string;
}) {
	return (
		<ProfileInput id={id} label={label} icon={Lock} className="lg:col-span-2">
			<Input
				id={id}
				type={isVisible ? 'text' : 'password'}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				required
				className="h-[52px] rounded-[10px] border-[#D4D7E3] bg-white pl-14 pr-12 text-[15px] placeholder:text-[#8897AD]"
			/>
			<Button
				type="button"
				variant="ghost"
				onClick={onToggleVisibility}
				className="absolute right-3 top-1/2 size-9 -translate-y-1/2 p-0 text-[#8897AD] hover:bg-transparent hover:text-[#26395C]"
				aria-label={`Toggle ${label.toLowerCase()} visibility`}
			>
				{isVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
			</Button>
		</ProfileInput>
	);
}

function AvailabilityStatusCard() {
	const availability = useAvailabilityToggleHook();

	return (
		<section className="rounded-[16px] bg-white p-6 shadow-sm lg:rounded-[20px] lg:px-8">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="text-[18px] font-semibold text-[#0C1421]">
						Active/Inactive Status
					</h2>
					<p className="mt-4 text-[14px] font-medium text-[#0C1421]">
						Active/ Inactive
					</p>
				</div>
				<button
					type="button"
					onClick={availability.toggleAvailability}
					disabled={availability.isLoading || availability.isUpdating}
					aria-pressed={availability.isActive}
					className={cn(
						'relative h-[26px] w-[52px] shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
						availability.isActive ? 'bg-[#10B981]' : 'bg-[#CBD5E1]',
					)}
				>
					<span
						className={cn(
							'absolute top-[3px] size-5 rounded-full bg-white shadow transition-transform',
							availability.isActive ? 'translate-x-[29px]' : 'translate-x-[3px]' ,
						)}
					/>
				</button>
			</div>
			{availability.errorMessage && (
				<p className="mt-3 text-[13px] text-red-500">
					{availability.errorMessage}
				</p>
			)}
		</section>
	);
}

export function AccountSettings() {
	const account = useAccountSettingsHook();

	return (
		<div className="mx-auto flex w-full max-w-[960px] flex-col gap-5 pb-8 lg:max-w-none lg:gap-6">
			<h1 className="font-[var(--font-poppins)] text-[28px] font-semibold text-[#0C1421] lg:text-[32px]">
				Edit Profile
			</h1>

			<section className="overflow-hidden rounded-[20px] bg-white shadow-sm">
				<div className="border-b border-[#D4D7E3] px-6 py-5 lg:px-8">
					<h2 className="text-[18px] font-semibold text-[#0C1421]">
						Edit Your Profile
					</h2>
					<p className="mt-1 text-[16px] text-[#26395C]">
						Update your account credential below.
					</p>
				</div>

				{account.isLoading ? (
					<div className="p-8 text-[#313957]">Loading profile...</div>
				) : (
					<form onSubmit={account.handleSubmit}>
						<div className="grid gap-5 px-6 py-6 lg:grid-cols-2 lg:px-8">
							<ProfileInput id="profileName" label="Full Name" icon={User}>
								<Input
									id="profileName"
									value={account.name}
									onChange={(event) => account.setName(event.target.value)}
									placeholder="e.g. Ahmad Malik"
									required
									className="h-[52px] rounded-[10px] border-[#D4D7E3] bg-white pl-14 text-[15px] placeholder:text-[#8897AD]"
								/>
							</ProfileInput>

							<ProfileInput id="profilePhone" label="Number" icon={Phone}>
								<Input
									id="profilePhone"
									type="tel"
									value={account.phoneNumber}
									onChange={(event) => account.setPhoneNumber(event.target.value)}
									placeholder="e.g. +1 123 456 7890"
									className="h-[52px] rounded-[10px] border-[#D4D7E3] bg-white pl-14 text-[15px] placeholder:text-[#8897AD]"
								/>
							</ProfileInput>

							<ProfileInput
								id="profileEmail"
								label="Email Address"
								icon={Mail}
								className="lg:col-span-2"
							>
								<Input
									id="profileEmail"
									type="email"
									value={account.email}
									onChange={(event) => account.setEmail(event.target.value)}
									placeholder="e.g. ahmadmalik@gmail.com"
									className="h-[52px] rounded-[10px] border-[#D4D7E3] bg-white pl-14 text-[15px] placeholder:text-[#8897AD]"
								/>
							</ProfileInput>
						</div>

						<div className="border-t border-[#D4D7E3] px-6 py-5 lg:px-8">
							<h2 className="text-[18px] font-semibold text-[#0C1421]">
								Change Password
							</h2>
							<div className="mt-4 grid gap-5 lg:grid-cols-2">
								<PasswordInput
									id="profileCurrentPassword"
									label="Old Password"
									value={account.currentPassword}
									onChange={account.setCurrentPassword}
									isVisible={account.isCurrentPasswordVisible}
									onToggleVisibility={() =>
										account.setIsCurrentPasswordVisible(
											!account.isCurrentPasswordVisible,
										)
									}
									placeholder="********"
								/>

								<PasswordInput
									id="profileNewPassword"
									label="New Password"
									value={account.newPassword}
									onChange={account.setNewPassword}
									isVisible={account.isNewPasswordVisible}
									onToggleVisibility={() =>
										account.setIsNewPasswordVisible(!account.isNewPasswordVisible)
									}
									placeholder="********"
								/>
							</div>
							<p className="mt-3 text-[13px] text-[#8897AD]">
								New password must contain uppercase, number, and special character.
							</p>
						</div>

						{account.errorMessage && (
							<div className="mx-6 rounded-[12px] bg-red-50 p-4 text-sm text-red-600 lg:mx-8">
								{account.errorMessage}
							</div>
						)}

						{account.successMessage && (
							<div className="mx-6 rounded-[12px] bg-emerald-50 p-4 text-sm text-emerald-700 lg:mx-8">
								{account.successMessage}
							</div>
						)}

						<div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:justify-end lg:px-8">
							<Button
								type="button"
								variant="outline"
								onClick={account.resetForm}
								className="h-[52px] rounded-[10px] border-[#D4D7E3] text-[16px] font-medium text-[#26395C] sm:w-[180px]"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={account.isSaving}
								className="h-[52px] rounded-[10px] bg-[#2563EB] text-[16px] font-semibold text-white hover:bg-[#2563EB]/90 sm:w-[180px]"
							>
								{account.isSaving ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</form>
				)}
			</section>

			<AvailabilityStatusCard />
		</div>
	);
}

