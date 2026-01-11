import Typesense from 'typesense';
import { logger } from '@trigger.dev/sdk/v3';

const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
const TYPESENSE_PORT = parseInt(process.env.TYPESENSE_PORT || '8108');
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || 'http';
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || '';

/**
 * Initialize and return a Typesense client
 */
export function getTypesenseClient(): Typesense.Client {
	return new Typesense.Client({
		nodes: [
			{
				host: TYPESENSE_HOST,
				port: TYPESENSE_PORT,
				protocol: TYPESENSE_PROTOCOL as 'http' | 'https',
			},
		],
		apiKey: TYPESENSE_API_KEY,
		connectionTimeoutSeconds: 10,
	});
}

export interface SyncResult {
	success: boolean;
	collectionName: string;
	totalFetched: number;
	totalIndexed: number;
	totalFailed: number;
	errors: string[];
}

/**
 * Generic function to sync a collection from Directus to Typesense
 */
export async function syncCollection<T>(
	collectionName: string,
	schema: any,
	documents: T[]
): Promise<SyncResult> {
	const client = getTypesenseClient();
	const errors: string[] = [];

	try {
		// Step 1: Delete existing collection
		logger.info(`📦 Setting up Typesense collection: ${collectionName}`);
		try {
			await client.collections(collectionName).delete();
			logger.info(`  ✓ Deleted existing collection`);
		} catch (error: any) {
			if (error.httpStatus !== 404) {
				logger.info(`  ℹ No existing collection to delete`);
			}
		}

		// Step 2: Create new collection
		await client.collections().create(schema);
		logger.info(`  ✓ Created new collection with schema`);

		// Step 3: Import documents
		if (documents.length === 0) {
			logger.warn(`⚠️ No documents to import for ${collectionName}`);
			return {
				success: true,
				collectionName,
				totalFetched: 0,
				totalIndexed: 0,
				totalFailed: 0,
				errors: [],
			};
		}

		logger.info(`📤 Importing ${documents.length} documents to Typesense...`);
		const result = await client
			.collections(collectionName)
			.documents()
			.import(documents, { action: 'create' });

		// Step 4: Check for errors
		const failed = result.filter((r: any) => !r.success);
		if (failed.length > 0) {
			failed.forEach((f: any) => {
				const errorMsg = `Failed to index document: ${f.error || JSON.stringify(f.document)}`;
				errors.push(errorMsg);
				logger.error(`  ⚠ ${errorMsg}`);
			});
		}

		const totalIndexed = documents.length - failed.length;
		logger.info(`  ✓ Indexed ${totalIndexed} documents successfully`);
		if (failed.length > 0) {
			logger.warn(`  ⚠ ${failed.length} documents failed to index`);
		}

		return {
			success: failed.length === 0,
			collectionName,
			totalFetched: documents.length,
			totalIndexed,
			totalFailed: failed.length,
			errors,
		};
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : 'Unknown error';
		logger.error(`❌ Error syncing ${collectionName}:`, errorMsg);
		errors.push(errorMsg);
		
		return {
			success: false,
			collectionName,
			totalFetched: documents.length,
			totalIndexed: 0,
			totalFailed: documents.length,
			errors,
		};
	}
}
