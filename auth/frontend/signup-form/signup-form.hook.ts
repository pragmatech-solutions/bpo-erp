'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupApi } from './signup.api';
import { signupInputSchema } from '@/auth/backend/signup/signup.input-schema';
import { UserRole } from '@/common/constants/user-roles.enum';

type SignupError = string | Record<string, string[]>;

export function useSignupFormHook() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [role, setRole] = useState<UserRole.AGENT | UserRole.LOAN_OFFICER>(
		UserRole.AGENT,
	);
	const [password, setPassword] = useState('');
	const [agreed, setAgreed] = useState(false);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [error, setError] = useState<SignupError>('');
	const [isLoading, setIsLoading] = useState(false);

	function togglePasswordVisibility() {
		setIsPasswordVisible((s) => !s);
	}

	const errorMessage = useMemo(() => {
		if (typeof error === 'string') {
			return error;
		}

		return Object.values(error).flat().filter(Boolean).join(', ');
	}, [error]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError('');

		if (!agreed) {
			setError('You must agree to the Terms of Service and Privacy Policy');
			return;
		}

		setIsLoading(true);

		try {
			const payload = {
				name,
				email,
				password,
				role,
				phone_number: phoneNumber,
			};
			const validated = signupInputSchema.safeParse(payload);

			if (!validated.success) {
				const fieldErrors = validated.error.flatten().fieldErrors;
				setError(fieldErrors as Record<string, string[]>);
				setIsLoading(false);
				return;
			}

			const response = await signupApi(validated.data);

			if (response.success) {
				router.push('/login');
			} else {
				setError(response.error || 'Signup failed');
			}
		} catch {
			setError('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	}

	return {
		name,
		setName,
		email,
		setEmail,
		phoneNumber,
		setPhoneNumber,
		role,
		setRole,
		password,
		setPassword,
		agreed,
		setAgreed,
		isPasswordVisible,
		togglePasswordVisibility,
		errorMessage,
		isLoading,
		handleSubmit,
	};
}
