# Typesense Search Setup

This guide explains how to set up Typesense search for the carriers collection.

## Prerequisites

- Docker installed (for local development)
- OR Typesense Cloud account (for production)

## Option 1: Local Development with Docker

### 1. Start Typesense Server

```bash
docker run -p 8108:8108 -v/tmp/typesense-data:/data typesense/typesense:27.1 \
  --data-dir /data --api-key=xyz --enable-cors
```

Replace `xyz` with a secure API key of your choice.

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Typesense Configuration
TYPESENSE_HOST="localhost"
TYPESENSE_PORT="8108"
TYPESENSE_PROTOCOL="http"
TYPESENSE_API_KEY="xyz"
NUXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY="xyz"
```

For production, create a search-only API key with read permissions.

### 3. Sync Data to Typesense

```bash
# Install dependencies if needed
pnpm install

# Run the sync script
pnpm tsx scripts/sync-typesense.ts
```

This script will:
- Create the `carriers` collection in Typesense
- Fetch all published carriers from Directus
- Index them in Typesense

### 4. Test the Search API

```bash
# Search for "verizon"
curl "http://localhost:3000/api/search/carriers?q=verizon"

# Filter by MVNO
curl "http://localhost:3000/api/search/carriers?q=*&mvno_only=true"

# Filter by eSIM support
curl "http://localhost:3000/api/search/carriers?q=*&esim_support=true"

# Combine filters
curl "http://localhost:3000/api/search/carriers?q=mobile&mvno_only=true&esim_support=true"
```

## Option 2: Typesense Cloud

### 1. Sign Up

Visit [https://cloud.typesense.org/](https://cloud.typesense.org/) and create an account.

### 2. Create a Cluster

- Choose a plan (free tier available)
- Select a region close to your users
- Note your cluster hostname and API keys

### 3. Configure Environment Variables

```env
TYPESENSE_HOST="your-cluster.a1.typesense.net"
TYPESENSE_PORT="443"
TYPESENSE_PROTOCOL="https"
TYPESENSE_API_KEY="your-admin-api-key"
NUXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY="your-search-only-key"
```

### 4. Sync Data

Run the sync script as described in Option 1, step 3.

## Search Features

The Typesense search implementation supports:

### Text Search
- Searches across: carrier name, short description, parent company
- Typo-tolerant (handles misspellings)
- Fast full-text search

### Filters
- **Category**: Filter by carrier category
- **MVNO Only**: Show only MVNOs
- **eSIM Support**: Carriers with eSIM
- **5G Available**: Carriers with 5G networks
- **Prepaid Anonymous**: Carriers offering anonymous prepaid
- **No Contract**: Carriers without contract requirements

### Sorting
- Default: By overall score (descending)
- Customizable via `sort_by` parameter

## API Endpoints

### `/api/search/carriers`

**Query Parameters:**
- `q` - Search query (default: `*` for all)
- `page` - Page number (default: `1`)
- `per_page` - Results per page (default: `20`)
- `category` - Filter by category name
- `mvno_only` - Filter MVNOs (true/false)
- `esim_support` - Filter eSIM support (true/false)
- `five_g` - Filter 5G availability (true/false)
- `prepaid_anonymous` - Filter anonymous prepaid (true/false)
- `no_contract` - Filter no contract (true/false)
- `sort_by` - Sort field and direction (e.g., `name:asc`)

**Response:**
```json
{
  "hits": [...],
  "found": 10,
  "page": 1,
  "total_pages": 1
}
```

## Keeping Data in Sync

### Manual Sync

Run the sync script whenever data changes:

```bash
pnpm tsx scripts/sync-typesense.ts
```

### Automatic Sync (Future Enhancement)

Consider setting up a Directus Flow or Hook to automatically sync changes:

1. Create a Directus Flow triggered on carriers collection events (create/update/delete)
2. Call a webhook that triggers the sync script
3. Or use Directus Extensions to directly update Typesense

## Troubleshooting

### Connection Refused

If you see `ECONNREFUSED` errors:
- Check that Typesense is running (`docker ps`)
- Verify `TYPESENSE_HOST` and `TYPESENSE_PORT` in `.env`
- Ensure firewall allows connections to port 8108

### Collection Not Found

If you see 404 errors:
- Run the sync script to create the collection
- Check Typesense logs for errors

### Empty Results

- Verify carriers are synced: `curl http://localhost:8108/collections/carriers/documents -H "X-TYPESENSE-API-KEY: xyz"`
- Check that carriers have `status: published` in Directus

## Performance Considerations

- Typesense is extremely fast (sub-millisecond searches)
- Index size is small (~1KB per carrier)
- No impact on Directus performance
- Consider using Typesense Cloud CDN for global distribution

## Next Steps

- [ ] Set up Typesense server (Docker or Cloud)
- [ ] Configure environment variables
- [ ] Run initial sync
- [ ] Test search API
- [ ] Update CarriersShowcase to use Typesense (optional)
- [ ] Set up automatic sync (optional)
