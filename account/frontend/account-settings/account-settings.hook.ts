'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
	getCurrentLoggedInUserInformation,
	saveCurrentLoggedInUserInformation,
} from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import {
	getAccountSettingsApi,
	updateAccountSettingsApi,
} from './account-settings.api';

export function useAccountSettingsHook() {
	const [name, setName] = useState('');
	const [savedName, setSavedName] = useState('');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [savedEmail, setSavedEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [savedPhoneNumber, setSavedPhoneNumber] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
	const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		async function loadAccount() {
			try {
				setIsLoading(true);
				setErrorMessage('');
				const account = await getAccountSettingsApi();

				if (!isMounted) return;

				setName(account.name);
				setSavedName(account.name);
				setUsername(account.username);
				setEmail(account.email || '');
				setSavedEmail(account.email || '');
				setPhoneNumber(account.phoneNumber || '');
				setSavedPhoneNumber(account.phoneNumber || '');
			} catch (error) {
				if (!isMounted) return;
				setErrorMessage(
					error instanceof Error ? error.message : 'Unable to load account',
				);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}

		loadAccount();

		return () => {
			isMounted = false;
		};
	}, []);

	function resetForm() {
		setName(savedName);
		setEmail(savedEmail);
		setPhoneNumber(savedPhoneNumber);
		setCurrentPassword('');
		setNewPassword('');
		setErrorMessage('');
		setSuccessMessage('');
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrorMessage('');
		setSuccessMessage('');

		try {
			setIsSaving(true);
			const account = await updateAccountSettingsApi({
				name,
				email,
				phoneNumber,
				currentPassword,
				newPassword,
			});

			setName(account.name);
			setSavedName(account.name);
			setEmail(account.email || '');
			setSavedEmail(account.email || '');
			setPhoneNumber(account.phoneNumber || '');
			setSavedPhoneNumber(account.phoneNumber || '');
			setCurrentPassword('');
			setNewPassword('');

			const currentUserInfo = getCurrentLoggedInUserInformation();
			const currentRole = currentUserInfo?.currentUser.role;
			if (currentRole) {
				saveCurrentLoggedInUserInformation(account.name, currentRole);
			}

			setSuccessMessage('Profile updated successfully.');
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to update profile',
			);
		} finally {
			setIsSaving(false);
		}
	}

	return {
		name,
		setName,
		username,
		email,
		setEmail,
		phoneNumber,
		setPhoneNumber,
		currentPassword,
		setCurrentPassword,
		newPassword,
		setNewPassword,
		isCurrentPasswordVisible,
		setIsCurrentPasswordVisible,
		isNewPasswordVisible,
		setIsNewPasswordVisible,
		isLoading,
		isSaving,
		errorMessage,
		successMessage,
		resetForm,
		handleSubmit,
	};
}
