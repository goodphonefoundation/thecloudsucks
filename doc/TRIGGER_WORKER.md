# Trigger.dev Production Worker Setup

This document explains how to run the Trigger.dev production worker in Docker for your local Trigger.dev instance.

## Prerequisites

- Docker Desktop installed and running
- Local Trigger.dev instance running at `http://localhost:8030`
- Environment variables configured

## Setup

### 1. Configure Environment Variables

Copy the example file and add your actual values:

```powershell
Copy-Item .env.worker.example .env.worker
```

Then edit `.env.worker` with your actual values:

```env
# Trigger.dev Configuration
TRIGGER_API_URL=http://localhost:8030
TRIGGER_SECRET_KEY=your_trigger_secret_key

# Perplexity AI Configuration
PERPLEXITY_API_KEY=your_perplexity_api_key

# Directus Configuration
DIRECTUS_URL=https://directus.thecloud.sucks
DIRECTUS_SERVER_TOKEN=your_directus_token

# Typesense Configuration
TYPESENSE_HOST=search.thecloud.sucks
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your_typesense_api_key
```

**Important:** Replace `your_*` placeholders with your real API keys.
**Note:** The `.env.worker` file is in `.gitignore` and will not be committed.

### 2. Build the Worker Image

```powershell
docker-compose -f docker-compose.trigger-worker.yml build
```

This will:
- Install all dependencies
- Copy your trigger tasks
- Build the deployment
- Create a production-ready worker image

### 3. Start the Worker

```powershell
docker-compose -f docker-compose.trigger-worker.yml up -d
```

The worker will:
- Connect to your local Trigger.dev instance at `http://localhost:8030`
- Start listening for tasks in the production environment
- Execute tasks with the configured environment variables

### 4. View Worker Logs

```powershell
docker-compose -f docker-compose.trigger-worker.yml logs -f
```

### 5. Stop the Worker

```powershell
docker-compose -f docker-compose.trigger-worker.yml down
```

## Testing

Once the worker is running, trigger a task from the Trigger.dev dashboard or use the test script:

```powershell
npx tsx test-trigger.ts
```

You should see:
- The task appear in the Trigger.dev dashboard
- The worker pick up and execute the task
- Logs showing the Perplexity API call and Directus operations

## Troubleshooting

### Worker not connecting to Trigger.dev

- Ensure `host.docker.internal` resolves correctly on your system
- On Linux, you may need to use `172.17.0.1` instead
- Check that your local Trigger.dev is accessible at port 8030

### Environment variables not working

- Verify your `.env` file has actual values (not placeholders)
- Check the environment variables are set in Trigger.dev dashboard
- Restart the worker after updating environment variables

### Tasks not executing

- Check worker logs: `docker-compose -f docker-compose.trigger-worker.yml logs`
- Verify the deployment version matches what's in the dashboard
- Ensure the worker is connected (check Trigger.dev dashboard)

## Architecture

```
┌─────────────────────┐
│  Trigger.dev        │
│  (localhost:8030)   │
└──────────┬──────────┘
           │
           │ WebSocket/HTTP
           │
┌──────────▼──────────┐
│  Docker Worker      │
│  - Polls for tasks  │
│  - Executes tasks   │
│  - Reports results  │
└─────────────────────┘
```

## Development vs Production

- **Development**: Run `npx trigger.dev dev --profile local` - creates a temporary worker
- **Production**: Run this Docker worker - persistent, restarts automatically

For local development, use the dev command. For persistent/production-like execution, use this Docker worker.
