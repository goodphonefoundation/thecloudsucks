import { directusServer, readSingleton } from '~/server/utils/directus-server';

export default defineNuxtPlugin(async (nuxtApp) => {
	try {
		// Fetch globals singleton from Directus
		const globals = await directusServer.request(
			readSingleton('globals', {
				fields: ['*'],
			})
		);

		// Add globals to app config so it's accessible via useAppConfig()
		nuxtApp.payload.config.globals = globals;
	} catch (error) {
		console.error('Failed to load globals:', error);
	}
});
