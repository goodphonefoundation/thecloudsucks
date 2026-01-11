export default defineNuxtPlugin(() => {
	useSchemaOrg([
		defineWebSite({
			name: 'Agency OS',
		}),
	]);
});
