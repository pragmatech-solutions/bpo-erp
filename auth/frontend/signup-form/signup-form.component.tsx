'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useSignupFormHook } from './signup-form.hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignupForm() {
	const {
		name,
		setName,
		email,
		setEmail,
		password,
		setPassword,
		agreed,
		setAgreed,
		isPasswordVisible,
		togglePasswordVisibility,
		errorMessage,
		isLoading,
		handleSubmit,
	} = useSignupFormHook();

	return (
		<div className="min-h-screen w-full bg-[#D4E8F8]">
			<div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center px-[38px] pb-10 pt-[118px] md:max-w-[410px] md:justify-center md:px-0 md:pb-0 md:pt-0">
				<Image
					src="/logo.png"
					alt="Logo"
					width={116}
					height={116}
					className="mb-9 md:mb-[30px] md:h-[97px] md:w-[97px]"
				/>

				<section className="w-full">
					<div className="mb-4 flex flex-col items-start gap-2">
						<h1 className="font-[var(--font-poppins)] text-[30px] leading-[100%] font-semibold tracking-[0.01em] text-[#161750] md:text-[36px]">
							Create your account
						</h1>
						<p className="text-[17px] leading-[160%] tracking-[0.01em] text-[#4B5169] md:text-[19px] md:text-[#313957]">
							Fill in the detail below to get started
						</p>
					</div>

					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4 md:gap-0"
					>
						<div className="flex flex-col gap-[16px] md:gap-0">
							{/* Full Name */}
							<div className="flex flex-col gap-2 md:mb-[25px]">
								<Label
									htmlFor="name"
									className="text-[14px] text-[#0C1421] md:text-[16px]"
								>
									Full Name
								</Label>
								<div className="relative">
									<User className="pointer-events-none absolute left-7 top-1/2 size-[18px] -translate-y-1/2 text-[#8897AD]" />
									<Input
										id="name"
										type="text"
										value={name}
										onChange={(event) => setName(event.target.value)}
										placeholder="John Doe"
										required
										className="h-[55px] rounded-[12px] border-[#D4D7E3] bg-[#F7FBFF] pl-[58px] text-[14px] placeholder:text-[#8897AD] md:text-[16px]"
									/>
								</div>
							</div>

							{/* Email */}
							<div className="flex flex-col gap-2 md:mb-[25px]">
								<Label
									htmlFor="email"
									className="text-[14px] text-[#0C1421] md:text-[16px]"
								>
									Email
								</Label>
								<div className="relative">
									<Mail className="pointer-events-none absolute left-7 top-1/2 size-[18px] -translate-y-1/2 text-[#8897AD]" />
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										placeholder="Johndoe@email.com"
										required
										className="h-[55px] rounded-[12px] border-[#D4D7E3] bg-[#F7FBFF] pl-[58px] text-[14px] placeholder:text-[#8897AD] md:text-[16px]"
									/>
								</div>
							</div>

							{/* Password */}
							<div className="flex flex-col gap-2 md:mb-[13px]">
								<Label
									htmlFor="password"
									className="text-[14px] text-[#0C1421] md:text-[16px]"
								>
									Password
								</Label>
								<div className="relative">
									<Lock className="pointer-events-none absolute left-7 top-1/2 size-[18px] -translate-y-1/2 text-[#8897AD]" />
									<Input
										id="password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										type={isPasswordVisible ? 'text' : 'password'}
										placeholder="At least 8 characters"
										required
										className="h-[55px] rounded-[12px] border-[#D4D7E3] bg-[#F7FBFF] pl-[58px] pr-12 text-[14px] placeholder:text-[#8897AD] md:text-[16px]"
									/>
									<Button
										type="button"
										variant="ghost"
										onClick={togglePasswordVisibility}
										className="absolute right-5 top-1/2 size-6 -translate-y-1/2 p-0 text-[#8897AD] hover:bg-transparent hover:text-[#8897AD]"
									>
										{isPasswordVisible ? (
											<EyeOff className="size-6" />
										) : (
											<Eye className="size-6" />
										)}
									</Button>
								</div>
							</div>
						</div>

						<p className="mb-[16px] text-[14px] text-[#8897AD] md:mb-[22px]">
							Must contain uppercase, number, and special character
						</p>

						<div className="mb-[40px] flex items-center gap-3">
							<input
								type="checkbox"
								id="terms"
								checked={agreed}
								onChange={(e) => setAgreed(e.target.checked)}
								className="size-[18px] rounded-none border-[1.5px] border-[#0C1421] accent-[#2563EB]"
							/>
							<Label
								htmlFor="terms"
								className="text-[14px] font-normal text-[#0C1421]"
							>
								I agree to the{' '}
								<Link href="#" className="underline">
									Terms of Service
								</Link>{' '}
								and{' '}
								<Link href="#" className="underline">
									Privacy Policy
								</Link>
							</Label>
						</div>

						<div className="flex flex-col items-center gap-[35px] md:gap-[40px]">
							{errorMessage ? (
								<p className="text-sm text-red-500">{errorMessage}</p>
							) : null}
							<Button
								type="submit"
								disabled={isLoading}
								className="h-[55px] w-full rounded-[12px] bg-[#2563EB] text-[20px] font-medium text-white hover:bg-[#2563EB]/90 active:scale-[0.98] transition-transform"
							>
								{isLoading ? 'Creating Account...' : 'Create Account'}
							</Button>
							<p className="text-[14px] text-[#313957] md:text-[16px]">
								Already have an account?{' '}
								<Link href="/login" className="text-[#1E4AE9] font-medium">
									Sign in
								</Link>
							</p>
						</div>
					</form>
				</section>
			</div>
		</div>
	);
}
