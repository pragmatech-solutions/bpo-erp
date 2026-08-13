export function getTotalPages(total: number, limit: number) {
	return Math.max(1, Math.ceil(total / limit));
}

export function getPaginationRange(page: number, limit: number, total: number) {
	return {
		from: total === 0 ? 0 : (page - 1) * limit + 1,
		to: Math.min(total, page * limit),
	};
}
