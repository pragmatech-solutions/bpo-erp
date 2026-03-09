'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>
						Login with your Google account or email
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form>
						<div className="grid gap-6">
							<div className="flex flex-col gap-4">
								<Button variant="outline" className="w-full">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										className="mr-2 h-4 w-4"
									>
										<path
											d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.38-2.04 4.58-1.56 1.62-3.8 2.76-7.8 2.76-6.4 0-11.64-5.24-11.64-11.64S4.08 3.36 10.48 3.36c3.48 0 6.12 1.28 8.12 3.2l2.32-2.32C18.44 1.92 14.88 0 10.48 0 4.68 0 0 4.68 0 10.48s4.68 10.48 10.48 10.48c3.12 0 5.44-1 7.24-2.84 1.88-1.88 2.48-4.48 2.48-6.6 0-.64-.04-1.28-.12-1.88h-8.08z"
											fill="currentColor"
										/>
									</svg>
									Login with Google
								</Button>
							</div>
							<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
								<span className="relative z-10 bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
							<div className="grid gap-6">
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="burhan@example.com"
										required
									/>
								</div>
								<div className="grid gap-2">
									<div className="flex items-center">
										<Label htmlFor="password">Password</Label>
										<Link
											href="#"
											className="ml-auto text-sm underline-offset-4 hover:underline"
										>
											Forgot password?
										</Link>
									</div>
									<Input id="password" type="password" required />
								</div>
								<Button type="submit" className="w-full">
									Login
								</Button>
							</div>
							<div className="text-center text-sm">
								Don&apos;t have an account?{' '}
								<Link href="#" className="underline underline-offset-4">
									Sign up
								</Link>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
