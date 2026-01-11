# Trigger.dev Tasks

This directory contains automated tasks powered by Trigger.dev.

## Available Tasks

### `fetch-social-services`

Automatically researches and adds privacy-focused social services to Directus using Perplexity AI.

**Quick Start:**

1. Sign up for a Trigger.dev account at [trigger.dev](https://trigger.dev)
2. Add your `TRIGGER_SECRET_KEY` to `.env`
3. Run the development server:
   ```bash
   pnpm trigger:dev
   ```
4. Trigger the task from the Trigger.dev dashboard

**Documentation:** See [../docs/trigger-social-services.md](../docs/trigger-social-services.md) for full details.

**Features:**
- ✅ AI-powered research via Perplexity
- ✅ Automatic duplicate detection
- ✅ Category management (creates new categories as needed)
- ✅ Draft status for manual review
- ✅ Detailed logging and error handling

## Project Structure

```
trigger/
├── fetch-social-services.ts    # Main task definition
└── lib/
    ├── perplexity.ts           # Perplexity API integration
    └── directus.ts             # Directus database operations
```

## npm Scripts

- `pnpm trigger:dev` - Run Trigger.dev in development mode
- `pnpm trigger:deploy` - Deploy tasks to Trigger.dev cloud

## Environment Variables Required

```env
PERPLEXITY_API_KEY="your_key"           # Already configured ✓
DIRECTUS_URL="your_url"                 # Already configured ✓
DIRECTUS_SERVER_TOKEN="your_token"      # Already configured ✓
TRIGGER_SECRET_KEY="your_trigger_key"   # Get from trigger.dev
```
