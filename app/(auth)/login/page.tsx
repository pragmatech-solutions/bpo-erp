import { LoginForm } from '@/auth/frontend/login-form/components/login-form.component';

export default function LoginPage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24">
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
		</main>
	);
}
