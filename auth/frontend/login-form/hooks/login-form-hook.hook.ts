'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '@/auth/frontend/login-form/functions/login.api';

type LoginError = string | Record<string, string[]>;

export function useLoginFormHook() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [error, setError] = useState<LoginError>('');
	const [isLoading, setIsLoading] = useState(false);

	function togglePasswordVisibility() {
		setIsPasswordVisible((state) => !state);
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
		setIsLoading(true);

		try {
			const response = await loginApi({ email, password });

			if (!response.success) {
				setError(response.error || response.message || 'Unable to login');
				return;
			}

			router.push('/');
			router.refresh();
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}

	return {
		email,
		setEmail,
		password,
		setPassword,
		isPasswordVisible,
		togglePasswordVisibility,
		errorMessage,
		isLoading,
		handleSubmit,
	};
}
