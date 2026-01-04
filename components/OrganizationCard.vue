<script setup lang="ts">
interface Organization {
	id: string;
	name: string;
	country?: string;
	ownership_type?: string;
	website_url?: string;
	vendor_information?: string;
	business_id?: string;
	business_description?: string;
	business_logo?: string;
	linkedin_profile?: string;
	linkedin_industry_category?: string;
	naics?: string;
	naics_description?: string;
	sic_code?: string;
	sic_code_description?: string;
	number_of_employees_range?: string;
	yearly_revenue_range?: string;
	ticker?: string;
	city_name?: string;
	region_name?: string;
	street?: string;
	zip_code?: string;
	locations_distribution?: any;
}

interface Props {
	organization: Organization;
	variant?: 'full' | 'compact';
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'compact',
});

// Helper to format ownership type
const formatOwnershipType = (type: string | undefined) => {
	if (!type) return null;
	const labels: Record<string, string> = {
		public: 'Public Company',
		private: 'Private Company',
		nonprofit: 'Non-Profit',
		coop: 'Cooperative',
		unknown: 'Unknown',
	};
	return labels[type] || type;
};
</script>

<template>
	<div v-if="organization" class="border rounded-lg p-6 dark:border-gray-700">
		<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Organization</h3>
		
		<!-- Organization Logo (if from Explorium) -->
		<div v-if="organization.business_logo" class="mb-4 flex justify-center">
			<img 
				:src="organization.business_logo" 
				:alt="organization.name"
				class="h-16 w-auto object-contain"
			/>
		</div>
		
		<dl class="space-y-3 text-sm">
			<!-- Name -->
			<div>
				<dt class="text-gray-500 dark:text-gray-400">Name</dt>
				<dd class="font-medium">
					<NuxtLink 
						v-if="organization.website_url" 
						:to="organization.website_url" 
						target="_blank"
						class="text-primary hover:underline"
					>
						{{ organization.name }}
					</NuxtLink>
					<span v-else>{{ organization.name }}</span>
				</dd>
			</div>
			
			<!-- Country -->
			<div v-if="organization.country">
				<dt class="text-gray-500 dark:text-gray-400">Country</dt>
				<dd class="font-medium">{{ organization.country }}</dd>
			</div>
			
			<!-- Ownership Type -->
			<div v-if="organization.ownership_type">
				<dt class="text-gray-500 dark:text-gray-400">Type</dt>
				<dd class="font-medium">{{ formatOwnershipType(organization.ownership_type) }}</dd>
			</div>
			
			<!-- Business Description (Explorium) -->
			<div v-if="variant === 'full' && organization.business_description">
				<dt class="text-gray-500 dark:text-gray-400">Description</dt>
				<dd class="text-gray-700 dark:text-gray-300 text-xs">{{ organization.business_description }}</dd>
			</div>
			
			<!-- Industry (Explorium) -->
			<div v-if="organization.linkedin_industry_category">
				<dt class="text-gray-500 dark:text-gray-400">Industry</dt>
				<dd class="font-medium text-xs">{{ organization.linkedin_industry_category }}</dd>
			</div>
			
			<!-- Employee Count (Explorium) -->
			<div v-if="organization.number_of_employees_range">
				<dt class="text-gray-500 dark:text-gray-400">Employees</dt>
				<dd class="font-medium">{{ organization.number_of_employees_range }}</dd>
			</div>
			
			<!-- Revenue (Explorium) -->
			<div v-if="organization.yearly_revenue_range">
				<dt class="text-gray-500 dark:text-gray-400">Revenue</dt>
				<dd class="font-medium">{{ organization.yearly_revenue_range }}</dd>
			</div>
			
			<!-- Location (Explorium) -->
			<div v-if="organization.city_name || organization.region_name">
				<dt class="text-gray-500 dark:text-gray-400">Location</dt>
				<dd class="font-medium text-xs">
					<span v-if="organization.city_name">{{ organization.city_name }}</span>
					<span v-if="organization.city_name && organization.region_name">, </span>
					<span v-if="organization.region_name">{{ organization.region_name }}</span>
				</dd>
			</div>
			
			<!-- NAICS Code (Explorium) -->
			<div v-if="variant === 'full' && organization.naics">
				<dt class="text-gray-500 dark:text-gray-400">NAICS</dt>
				<dd class="font-medium text-xs">
					{{ organization.naics }}
					<span v-if="organization.naics_description" class="text-gray-600 dark:text-gray-400">
						- {{ organization.naics_description }}
					</span>
				</dd>
			</div>
			
			<!-- Stock Ticker (Explorium) -->
			<div v-if="organization.ticker">
				<dt class="text-gray-500 dark:text-gray-400">Ticker</dt>
				<dd class="font-medium">{{ organization.ticker }}</dd>
			</div>
			
			<!-- LinkedIn Profile -->
			<div v-if="organization.linkedin_profile">
				<dt class="text-gray-500 dark:text-gray-400">LinkedIn</dt>
				<dd>
					<a 
						:href="organization.linkedin_profile" 
						target="_blank"
						class="text-primary hover:underline text-xs flex items-center gap-1"
					>
						View Profile
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
						</svg>
					</a>
				</dd>
			</div>
		</dl>
	</div>
</template>
