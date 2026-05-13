'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useLoginFormHook } from './login-form.hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
	const {
		email,
		setEmail,
		password,
		setPassword,
		isPasswordVisible,
		togglePasswordVisibility,
		errorMessage,
		isLoading,
		handleSubmit,
	} = useLoginFormHook();

	return (
		<div className="min-h-screen w-full bg-[#D4E8F8]">
			<div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center px-[38px] pb-10 pt-[118px] md:max-w-[410px] md:justify-center md:px-0 md:pb-0 md:pt-0">
				<Image
					src="/next.svg"
					alt="Logo"
					width={116}
					height={116}
					className="mb-9 md:mb-[30px] md:h-[97px] md:w-[97px]"
				/>
				<section className="w-full">
					<div className="mb-4 flex items-center gap-2">
						<h1 className="font-[var(--font-poppins)] text-[30px] leading-[100%] font-semibold tracking-[0.01em] text-[#161750] md:text-[36px]">
							Welcome Back
						</h1>
						<span className="text-[30px] leading-[100%] md:text-[36px]">
							👋
						</span>
					</div>
					<p className="mb-4 text-[17px] leading-[160%] tracking-[0.01em] text-[#4B5169] md:mb-0 md:text-[19px] md:leading-[143%] md:tracking-[0.03em] md:text-[#313957]">
						Enter your credentials to access your dashboard
					</p>
					<form
						onSubmit={handleSubmit}
						className="mt-[17px] flex flex-col gap-[35px] md:mt-[40px] md:gap-10"
					>
						<div className="flex flex-col gap-4 md:gap-[23px]">
							<div className="flex flex-col gap-2 md:gap-[10px]">
								<Label htmlFor="email" className="text-[14px] text-[#0C1421]">
									Email
								</Label>
								<div className="relative">
									<Mail className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#8897AD]" />
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										placeholder="John@email.com"
										required
										className="h-[55px] rounded-[12px] border-[#D4D7E3] bg-[#F7FBFF] pl-[46px] text-[14px] placeholder:text-[#8897AD] md:text-[16px]"
									/>
								</div>
							</div>
							<div className="flex flex-col gap-2 md:gap-[10px]">
								<Label
									htmlFor="password"
									className="text-[14px] text-[#0C1421] md:text-[16px]"
								>
									Password
								</Label>
								<div className="relative">
									<Lock className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#8897AD]" />
									<Input
										id="password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										type={isPasswordVisible ? 'text' : 'password'}
										placeholder="At least 8 characters"
										required
										className="h-[55px] rounded-[12px] border-[#D4D7E3] bg-[#F7FBFF] pl-[46px] pr-12 text-[14px] placeholder:text-[#8897AD] md:text-[16px]"
									/>
									<Button
										type="button"
										variant="ghost"
										onClick={togglePasswordVisibility}
										className="absolute right-2 top-1/2 size-9 -translate-y-1/2 p-0 text-[#8897AD] hover:bg-transparent hover:text-[#8897AD]"
									>
										{isPasswordVisible ? (
											<EyeOff className="size-5" />
										) : (
											<Eye className="size-5" />
										)}
									</Button>
								</div>
								<Link
									href="#"
									className="text-right text-[14px] text-[#1E4AE9] md:text-[16px]"
								>
									Forgot Password?
								</Link>
							</div>
						</div>
						<div className="flex flex-col items-center gap-[35px]">
							{errorMessage ? (
								<p className="text-sm text-red-500">{errorMessage}</p>
							) : null}
							<Button
								type="submit"
								className="h-[55px] w-full rounded-[12px] bg-[#2563EB] text-[20px] font-medium text-white hover:bg-[#2563EB] md:h-[54px]"
							>
								{isLoading ? 'Signing in...' : 'Sign in'}
							</Button>
							<p className="text-[14px] text-[#313957] md:text-[16px]">
								Don&apos;t you have an account?{' '}
								<Link href="#" className="text-[#1E4AE9]">
									Sign up
								</Link>
							</p>
						</div>
					</form>
				</section>
			</div>
		</div>
	);
}
