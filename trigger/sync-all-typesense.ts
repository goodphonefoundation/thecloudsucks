import { schedules, logger } from '@trigger.dev/sdk/v3';
import { syncCarriers } from './sync-carriers';
import { syncServices } from './sync-services';
import { syncHardware } from './sync-hardware';
import { syncPosts } from './sync-posts';
import { syncHelp } from './sync-help';
import { syncSelfhosted } from './sync-selfhosted';
import { syncOS } from './sync-os';
import type { SyncResult } from './lib/typesense';

export interface SyncAllPayload {
	collections?: string[];
}

export const syncAllTypesense = schedules.task({
	id: 'sync-all-typesense',
	// Schedule to run every hour (at the top of every hour)
	cron: '0 * * * *',
	run: async (payload: SyncAllPayload = {}) => {
		logger.info('🚀 Starting full Typesense sync for all collections...');
		
		const results: Record<string, SyncResult> = {};
		const startTime = Date.now();

		try {
			// Define all sync tasks
			const syncTasks = [
				{ name: 'carriers', task: syncCarriers },
				{ name: 'services', task: syncServices },
				{ name: 'hardware', task: syncHardware },
				{ name: 'posts', task: syncPosts },
				{ name: 'help', task: syncHelp },
				{ name: 'selfhosted', task: syncSelfhosted },
				{ name: 'os', task: syncOS },
			];

			// Filter tasks if specific collections are requested
			const tasksToRun = payload.collections 
				? syncTasks.filter(t => payload.collections!.includes(t.name))
				: syncTasks;

			logger.info(`📋 Running ${tasksToRun.length} sync tasks...`);

			// Run all sync tasks sequentially
			for (const { name, task } of tasksToRun) {
				try {
					logger.info(`\n🔄 Starting ${name} sync...`);
					const result = await task.triggerAndWait({});
					
					if (result.ok) {
						results[name] = result.output as SyncResult;
						logger.info(`✅ ${name} sync completed`);
					} else {
						logger.error(`❌ ${name} sync failed:`, result.error);
						results[name] = {
							success: false,
							collectionName: name,
							totalFetched: 0,
							totalIndexed: 0,
							totalFailed: 0,
							errors: [result.error?.message || 'Unknown error'],
						};
					}
				} catch (error) {
					const errorMsg = error instanceof Error ? error.message : 'Unknown error';
					logger.error(`❌ ${name} sync error:`, errorMsg);
					results[name] = {
						success: false,
						collectionName: name,
						totalFetched: 0,
						totalIndexed: 0,
						totalFailed: 0,
						errors: [errorMsg],
					};
				}
			}

			// Calculate summary
			const totalIndexed = Object.values(results).reduce((sum, r) => sum + r.totalIndexed, 0);
			const totalFailed = Object.values(results).reduce((sum, r) => sum + r.totalFailed, 0);
			const successfulSyncs = Object.values(results).filter(r => r.success).length;
			const failedSyncs = Object.values(results).filter(r => !r.success).length;
			const duration = ((Date.now() - startTime) / 1000).toFixed(2);

			// Log summary
			logger.info('\n\n📊 ===== SYNC SUMMARY =====');
			logger.info(`⏱️  Duration: ${duration}s`);
			logger.info(`✅ Successful syncs: ${successfulSyncs}/${tasksToRun.length}`);
			logger.info(`❌ Failed syncs: ${failedSyncs}/${tasksToRun.length}`);
			logger.info(`📤 Total documents indexed: ${totalIndexed}`);
			logger.info(`⚠️  Total documents failed: ${totalFailed}`);
			
			logger.info('\n📋 Details by collection:');
			for (const [name, result] of Object.entries(results)) {
				const status = result.success ? '✅' : '❌';
				logger.info(`  ${status} ${name}: ${result.totalIndexed}/${result.totalFetched} indexed`);
				if (result.errors.length > 0) {
					logger.error(`    Errors: ${result.errors.join(', ')}`);
				}
			}

			logger.info('\n✨ Full sync completed!');

			return {
				success: failedSyncs === 0,
				duration: parseFloat(duration),
				totalCollections: tasksToRun.length,
				successfulSyncs,
				failedSyncs,
				totalIndexed,
				totalFailed,
				results,
			};
		} catch (error) {
			logger.error('❌ Full sync failed:', error);
			throw error;
		}
	},
});
