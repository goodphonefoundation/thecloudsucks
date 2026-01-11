<script setup lang="ts">
interface ServiceSwitch {
	category: string;
	mainstream: {
		id: string;
		name: string;
		logo?: string;
	};
	privacyFocused: {
		id: string;
		name: string;
		logo?: string;
	};
}

const props = defineProps<{
	switches: ServiceSwitch[];
	showBranding?: boolean;
}>();

const { fileUrl } = useFiles();
</script>

<template>
	<div class="privacy-card bg-gray-900 text-white rounded-2xl p-8 max-w-3xl mx-auto font-mono">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="flex items-center justify-center gap-3 mb-2">
				<div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
					<svg class="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-green-400">PrivacyPack</h2>
			</div>
			<p class="text-gray-400 text-sm">YOUR PRIVACY WINS, IN ONE CARD</p>
		</div>

		<!-- Service Switches -->
		<div class="space-y-4">
			<div
				v-for="(switchItem, index) in switches"
				:key="index"
				class="flex items-center gap-4 bg-gray-800 rounded-lg p-4 border border-gray-700"
			>
				<!-- Category Label -->
				<div class="w-32 flex-shrink-0">
					<div class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ switchItem.category }}</div>
				</div>

				<!-- Mainstream Service -->
				<div class="flex items-center gap-3 flex-1">
					<div
						v-if="switchItem.mainstream.logo"
						class="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 flex-shrink-0"
					>
						<NuxtImg :src="fileUrl(switchItem.mainstream.logo)" :alt="switchItem.mainstream.name" class="max-w-full max-h-full object-contain" />
					</div>
					<div
						v-else
						class="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"
					>
						<span class="text-xs text-gray-400">{{ switchItem.mainstream.name.charAt(0) }}</span>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm text-gray-300 truncate">{{ switchItem.mainstream.name }}</div>
					</div>
				</div>

				<!-- Arrow -->
				<div class="flex-shrink-0">
					<svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</div>

				<!-- Privacy-Focused Service -->
				<div class="flex items-center gap-3 flex-1">
					<div
						v-if="switchItem.privacyFocused.logo"
						class="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 flex-shrink-0"
					>
						<NuxtImg :src="fileUrl(switchItem.privacyFocused.logo)" :alt="switchItem.privacyFocused.name" class="max-w-full max-h-full object-contain" />
					</div>
					<div
						v-else
						class="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-500"
					>
						<span class="text-xs text-green-400">{{ switchItem.privacyFocused.name.charAt(0) }}</span>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-semibold text-green-400 truncate">{{ switchItem.privacyFocused.name }}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div v-if="showBranding" class="mt-8 pt-6 border-t border-gray-800 text-center">
			<p class="text-xs text-gray-500">
				Created at
				<span class="text-green-400 font-semibold">thecloud.sucks</span>
			</p>
		</div>
	</div>
</template>

<style scoped>
.privacy-card {
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
</style>
