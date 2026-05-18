'use client';

import { useState, useCallback } from 'react';

export function useHeaderHook() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = useCallback(() => {
		setIsSidebarOpen((prev) => !prev);
	}, []);

	const closeSidebar = useCallback(() => {
		setIsSidebarOpen(false);
	}, []);

	return {
		isSidebarOpen,
		toggleSidebar,
		closeSidebar,
	};
}
