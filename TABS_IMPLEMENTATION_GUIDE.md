# Tabs Implementation Guide

## Collections to Create in Directus Admin

You need to manually create these 6 collections in Directus:

### 1. mobile_app_sources
```
Fields:
- id (UUID, primary key, auto)
- status (string, dropdown: published/draft/archived)
- sort (integer)
- title (string, required)
- url (string, required)
- publisher (string)
- date_published (date)
- type (string, dropdown: official/academic/regulator/ngo/media/community)
- quote (text, multiline)
- notes (text, multiline)
- mobile_app (UUID, M2O relation to mobile_apps collection)
```

### 2. mobile_app_change_log
```
Fields:
- id (UUID, primary key)
- status (string, dropdown: published/draft/archived)
- title (string, required)
- date (date, required)
- description (text, markdown)
- impact (string, dropdown: positive/negative/neutral)
- source_url (string)
- mobile_app (UUID, M2O relation to mobile_apps)
```

### 3-6. Repeat for Hardware and Selfhosted
- hardware_sources (with hardware_item relation)
- hardware_change_log (with hardware_item relation)
- selfhosted_sources (with selfhosted_alternative relation)
- selfhosted_change_log (with selfhosted_alternative relation)

## Code Changes Required

The implementation is too large to show in full here, but the pattern is:

1. Add data fetching queries (after main data fetch)
2. Add tab state (`const activeTab = ref('overview')`)
3. Add tab navigation UI
4. Wrap existing content in Overview tab
5. Add Sources, Change Log, and Alternatives tab content

See `pages/services/[slug].vue` lines 31-100 for data fetching examples
See `pages/services/[slug].vue` lines 186 for tab state
See `pages/services/[slug].vue` lines 316-373 for tab navigation
See `pages/services/[slug].vue` lines 691-862 for tab content

Apply the same pattern to:
- `pages/apps/[slug].vue`
- `pages/hardware/[slug].vue`  
- `pages/self-hosting/[slug].vue`

## Key Differences Per Collection

### Mobile Apps
- Collection: `mobile_apps`
- Sources collection: `mobile_app_sources`
- Changelog collection: `mobile_app_change_log`
- Alternatives query: filter by `categories` field

### Hardware
- Collection: `hardware_items`
- Sources collection: `hardware_sources`
- Changelog collection: `hardware_change_log`
- Alternatives query: filter by `hardware_type` field

### Selfhosted
- Collection: `selfhosted_alternatives`
- Sources collection: `selfhosted_sources`
- Changelog collection: `selfhosted_change_log`
- Alternatives query: filter by `category` field
