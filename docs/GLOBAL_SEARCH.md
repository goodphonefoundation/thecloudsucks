# Global Search Documentation

## Overview

The global search feature provides site-wide search functionality using Typesense, allowing users to search across carriers, services, and hardware from a single search interface accessible from the header.

## Features

- **Site-wide search**: Search across multiple collections (carriers, services, hardware)
- **Keyboard shortcuts**: Quick access with Cmd+K (Mac) or Ctrl+K (Windows/Linux)
- **Real-time results**: Search results appear as you type with 300ms debounce
- **Grouped results**: Results organized by collection type with icons
- **Faceted search**: Backend supports filtering by categories and attributes
- **Modal interface**: Clean modal overlay with escape key support

## Architecture

### Frontend Components

#### GlobalSearch.vue
Location: `components/navigation/GlobalSearch.vue`

The main search modal component that:
- Listens for keyboard shortcuts (Cmd+K / Ctrl+K)
- Provides search input with debounced API calls
- Groups and displays results by collection
- Handles result navigation

Key features:
- Uses `@vueuse/core` for keyboard shortcuts
- Debounced search (300ms) to reduce API calls
- Shows up to 5 results per collection
- Displays metadata (company, manufacturer, scores)

#### Header Integration
Location: `components/navigation/TheHeader.vue`

Search button added to header:
- Position: Top right, before dark mode toggle
- Icon: Magnifying glass (i-heroicons-magnifying-glass)
- Tooltip: "Search (Cmd+K)"
- Hidden on mobile, visible on desktop

### Backend API

#### Global Search Endpoint
Location: `server/api/search/global.ts`

Multi-collection search using Typesense's `multiSearch` API:
```typescript
GET /api/search/global?q=query&limit=5
```

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)
- `limit` (optional): Results per collection (default: 5)

**Response:**
```json
{
  "results": [...], // Flattened array of all results
  "total": 15,      // Total results across all collections
  "by_collection": {
    "carriers": { "hits": [...], "found": 5 },
    "services": { "hits": [...], "found": 7 },
    "hardware": { "hits": [...], "found": 3 }
  }
}
```

### Typesense Configuration

#### Collections

**Carriers**
- Fields: name, slug, short_description, parent_company, network_type, mvno_status, categories, scores
- Query fields: name, short_description, parent_company
- Sort: overall_score:desc

**Services**
- Fields: name, slug, short_description, service_status, business_model, categories, scores
- Query fields: name, short_description
- Sort: score_overall:desc

**Hardware**
- Fields: name, slug, short_description, manufacturer, hardware_type, repairability, scores
- Query fields: name, short_description, manufacturer
- Sort: overall_score:desc

#### Sync Scripts

Sync data from Directus to Typesense:

```bash
# Sync individual collections
pnpm sync:typesense:carriers
pnpm sync:typesense:services
pnpm sync:typesense:hardware

# Sync all collections
pnpm sync:typesense:all
```

Scripts location:
- `scripts/sync-typesense.ts` (carriers)
- `scripts/sync-typesense-services.ts` (services)
- `scripts/sync-typesense-hardware.ts` (hardware)

## Usage

### For Users

1. **Click search button**: Click the magnifying glass icon in header
2. **Keyboard shortcut**: Press Cmd+K (Mac) or Ctrl+K (Windows/Linux)
3. **Type to search**: Enter search query (minimum 2 characters)
4. **Navigate results**: Click on any result to navigate to detail page
5. **Close modal**: Press ESC or click outside modal

### For Developers

#### Adding New Collections

1. **Create Typesense schema** in `server/utils/typesense.ts`:
```typescript
export const appsSchema = {
  name: 'apps',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'string' },
    // ... other fields
  ],
  default_sorting_field: 'score',
};
```

2. **Add to global search API** in `server/api/search/global.ts`:
```typescript
{
  collection: 'apps',
  q: searchQuery,
  query_by: 'name,description',
  per_page: limit,
}
```

3. **Create sync script** at `scripts/sync-typesense-apps.ts`

4. **Add package.json script**:
```json
"sync:typesense:apps": "tsx scripts/sync-typesense-apps.ts"
```

5. **Update GlobalSearch.vue**:
   - Add icon in `getCollectionIcon()`
   - Add label in `getCollectionLabel()`
   - Add route in `getResultLink()`

#### Customizing Search

**Change results limit:**
```typescript
// In GlobalSearch.vue
const { data } = await useFetch('/api/search/global', {
  query: {
    q: searchQuery.value,
    limit: 10, // Change limit
  },
});
```

**Modify debounce delay:**
```typescript
// In GlobalSearch.vue
const debouncedSearch = useDebounceFn(async () => {
  // ... search logic
}, 500); // Change from 300ms to 500ms
```

## Environment Variables

Required for Typesense integration:

```env
# Server (required for sync scripts and API)
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=your_admin_key

# Client (required for frontend, search-only key)
NUXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=your_search_key
```

See [TYPESENSE_SETUP.md](./TYPESENSE_SETUP.md) for detailed setup instructions.

## Troubleshooting

### Search returns no results

1. **Check Typesense is running:**
```bash
curl http://localhost:8108/health
```

2. **Verify collections exist:**
```bash
curl http://localhost:8108/collections \
  -H "X-TYPESENSE-API-KEY: your_api_key"
```

3. **Re-sync data:**
```bash
pnpm sync:typesense:all
```

### Search is slow

- Reduce debounce delay if too slow
- Increase debounce delay if making too many requests
- Check Typesense server performance
- Consider reducing `limit` parameter

### Keyboard shortcut not working

- Check browser console for errors
- Verify `@vueuse/core` is installed
- Test in different browser
- Check for conflicting keyboard shortcuts

### Modal doesn't close

- Ensure ESC key handler is working
- Check for JavaScript errors
- Verify `v-model` binding in UModal
- Test click-outside functionality

## Future Enhancements

- [ ] Add autocomplete suggestions
- [ ] Include apps and OS collections
- [ ] Add recent searches
- [ ] Implement search history
- [ ] Add filters in modal (categories, tiers)
- [ ] Support advanced search operators
- [ ] Add keyboard navigation for results
- [ ] Highlight matching text in results
- [ ] Add search analytics
