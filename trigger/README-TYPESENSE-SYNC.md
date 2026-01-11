# Typesense Sync with Trigger.dev

This directory contains Trigger.dev tasks for syncing data from Directus to Typesense search collections.

## Overview

All Typesense sync scripts have been migrated to Trigger.dev for:
- **Automated scheduling** - Run syncs on a schedule
- **Built-in monitoring** - View logs and execution history in Trigger.dev dashboard
- **Error recovery** - Automatic retries and error handling
- **Orchestration** - Run all syncs together or individually

## Available Tasks

### Individual Collection Syncs
- `sync-carriers` - Syncs mobile carriers
- `sync-services` - Syncs online services
- `sync-hardware` - Syncs hardware items
- `sync-posts` - Syncs blog posts and articles
- `sync-help` - Syncs help articles
- `sync-selfhosted` - Syncs self-hosted alternatives
- `sync-os` - Syncs operating systems

### Master Sync Task
- `sync-all-typesense` - Orchestrates all 7 sync tasks

## Running Tasks

### Local Development

Run individual sync tasks:
```bash
pnpm trigger:sync:carriers
pnpm trigger:sync:services
pnpm trigger:sync:hardware
pnpm trigger:sync:posts
pnpm trigger:sync:help
pnpm trigger:sync:selfhosted
pnpm trigger:sync:os
```

Run all syncs:
```bash
pnpm trigger:sync:all
```

### Via Trigger.dev Dashboard

1. Start the Trigger.dev dev server:
   ```bash
   pnpm trigger:dev
   ```

2. Open the Trigger.dev dashboard (URL shown in terminal)

3. Click on any task to trigger it manually

### Scheduled Execution

To run syncs on a schedule (e.g., daily):

1. Go to the Trigger.dev dashboard
2. Navigate to your task (e.g., `sync-all-typesense`)
3. Click "Schedule"
4. Configure the schedule (e.g., `0 2 * * *` for daily at 2 AM)

## Environment Variables

Ensure these environment variables are set in your Trigger.dev environment:

**Directus:**
- `DIRECTUS_URL` - Your Directus instance URL
- `DIRECTUS_SERVER_TOKEN` - Directus API token

**Typesense:**
- `TYPESENSE_HOST` - Typesense server host
- `TYPESENSE_PORT` - Typesense server port (default: 8108)
- `TYPESENSE_PROTOCOL` - Protocol (http or https)
- `TYPESENSE_API_KEY` - Typesense API key

## Deployment

Deploy tasks to production:
```bash
pnpm trigger:deploy
```

After deployment, configure environment variables in the Trigger.dev dashboard under Settings → Environment Variables.

## Monitoring

View sync execution logs:
1. Go to the Trigger.dev dashboard
2. Click "Runs" in the sidebar
3. Select a run to view detailed logs

## Fallback to Manual Scripts

The original manual sync scripts are still available in `scripts/` directory:
```bash
pnpm sync:typesense:carriers
pnpm sync:typesense:services
# ... etc
```

Use these if you need to run syncs without Trigger.dev.

## Architecture

### Shared Library
`trigger/lib/typesense.ts` contains:
- Typesense client initialization
- Generic sync collection function
- Error handling and logging

### Individual Task Files
Each task (`trigger/sync-*.ts`):
- Fetches data from Directus
- Transforms data to match Typesense schema
- Uses shared library to sync to Typesense
- Returns detailed sync results

### Master Orchestration
`trigger/sync-all-typesense.ts`:
- Triggers all 7 sync tasks
- Aggregates results
- Provides comprehensive summary

## Troubleshooting

### Task fails with authentication error
- Check that `DIRECTUS_SERVER_TOKEN` is set correctly
- Verify the token has read permissions for all collections

### Typesense connection timeout
- Check `TYPESENSE_HOST`, `TYPESENSE_PORT`, and `TYPESENSE_PROTOCOL`
- Ensure Typesense server is accessible from Trigger.dev environment

### Documents fail to import
- Check the task logs for specific error messages
- Verify data format matches Typesense schema
- Ensure required fields are not null/empty

## Next Steps

1. Test each sync task individually in development
2. Verify data in Typesense after sync
3. Deploy to production
4. Set up scheduled syncs in Trigger.dev dashboard
5. Monitor initial runs for any issues
