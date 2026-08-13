import Link from 'next/link';
import Image from 'next/image';
import { Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
	return (
		<div className="min-h-screen w-full bg-[#D4E8F8]">
			<div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-[38px] py-10 md:max-w-[440px] md:px-0">
				<Image
					src="/logo.png"
					alt="Logo"
					width={116}
					height={116}
					className="mb-9 md:mb-[30px] md:h-[97px] md:w-[97px]"
				/>

				<section className="w-full rounded-[20px] bg-white p-6 shadow-sm md:p-8">
					<div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#E5F0FF] text-[#2563EB]">
						<ShieldCheck className="size-6" />
					</div>
					<h1 className="font-[var(--font-poppins)] text-[28px] font-semibold leading-tight text-[#161750]">
						Forgot Password
					</h1>
					<p className="mt-3 text-[15px] leading-[160%] text-[#313957]">
						For security, password resets are handled by an Admin. Please contact your Admin and ask them to reset your account password.
					</p>

					<div className="mt-6 rounded-full border border-[#D4D7E3] bg-[#F7FBFF] px-4 py-3 text-[14px] text-[#26395C]">
						<span className="flex items-center gap-2">
							<Info className="size-4 shrink-0" />
							Admin will generate a temporary password for you.
						</span>
					</div>

					<Button
						asChild
						className="mt-8 h-[52px] w-full rounded-[12px] bg-[#2563EB] text-[16px] font-semibold text-white hover:bg-[#2563EB]/90"
					>
						<Link href="/login">Back to Login</Link>
					</Button>
				</section>
			</div>
		</div>
	);
}
