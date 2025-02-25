export const getCorsConfig = (origin: string[] | string) => {
	return {
		origin: origin,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		credentials: true,
	};
};
