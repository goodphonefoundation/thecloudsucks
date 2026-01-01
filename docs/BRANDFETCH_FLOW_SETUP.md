# Brandfetch Flow Setup for All Categories

This document describes how to set up automated brand asset fetching from Brandfetch for all 4 showcase categories: Services, Apps, Hardware, and Operating Systems.

## Overview

The Brandfetch flow automatically fetches brand assets (logos and symbols in light/dark variants) when a new item is created or when the `website_url` field is updated.

## Prerequisites

1. **Brandfetch API Key**: Required environment variable
   ```
   BRANDFETCH_API_KEY=your_api_key_here
   ```

2. **Directus Flows**: Must be configured in Directus admin panel

## Field Structure

### Current State (Inconsistent)

| Collection | Logo Light | Logo Dark | Symbol Light | Symbol Dark |
|------------|------------|-----------|--------------|-------------|
| Services   | `brand_logo_light` | `brand_logo_dark` | `brand_symbol_light` | `brand_symbol_dark` |
| Apps       | `brand_logo_light` | `brand_logo_dark` | `brand_symbol_light` | `brand_symbol_dark` |
| Hardware   | `brand_logo_light` | `brand_logo_dark` | `brand_symbol_light` | `brand_symbol_dark` |
| OS         | `logo_light` | `logo_dark` | ❌ Missing | ❌ Missing |

### Required Changes

**Operating Systems collection** needs to be updated to match the standard:
- Rename `logo_light` → `brand_logo_light`
- Rename `logo_dark` → `brand_logo_dark`
- Add `brand_symbol_light` field
- Add `brand_symbol_dark` field

## Flow Configuration

### Flow 1: Fetch Brand Assets for Services

**Trigger**: `items.create` and `items.update` on `services` collection
**Filter**: When `website_url` is not null

**Operations**:
1. **Extract Domain** from `website_url`
2. **Call Brandfetch API**: `GET https://api.brandfetch.io/v2/brands/{domain}`
3. **Download Logo (Light)**: If theme `light` logo exists
4. **Download Logo (Dark)**: If theme `dark` logo exists
5. **Download Symbol (Light)**: If theme `light` icon exists
6. **Download Symbol (Dark)**: If theme `dark` icon exists
7. **Update Item**: Set the file IDs for all brand assets

### Flow 2: Fetch Brand Assets for Apps

**Trigger**: `items.create` and `items.update` on `apps` collection
**Filter**: When `website_url` is not null

Same operations as Services flow, but targeting `apps` collection.

### Flow 3: Fetch Brand Assets for Hardware

**Trigger**: `items.create` and `items.update` on `hardware` collection
**Filter**: When `website_url` is not null

Same operations as Services flow, but targeting `hardware` collection.

### Flow 4: Fetch Brand Assets for Operating Systems

**Trigger**: `items.create` and `items.update` on `operating_systems` collection
**Filter**: When `website_url` is not null

Same operations as Services flow, but targeting `operating_systems` collection (after field structure is updated).

## Implementation Steps

### Step 1: Fix Operating Systems Fields

Run this SQL migration or use Directus Studio to update the schema:

```sql
-- Rename existing fields
ALTER TABLE operating_systems RENAME COLUMN logo_light TO brand_logo_light;
ALTER TABLE operating_systems RENAME COLUMN logo_dark TO brand_logo_dark;

-- Add new symbol fields
ALTER TABLE operating_systems ADD COLUMN brand_symbol_light uuid REFERENCES directus_files(id);
ALTER TABLE operating_systems ADD COLUMN brand_symbol_dark uuid REFERENCES directus_files(id);
```

### Step 2: Create Brandfetch Flow Template

The flow needs these operations in sequence:

1. **Run Script: Extract Domain**
   ```javascript
   module.exports = async function(data) {
     const url = data.$trigger.payload.website_url;
     if (!url) return null;
     
     try {
       const domain = new URL(url).hostname.replace('www.', '');
       return { domain };
     } catch (e) {
       return null;
     }
   };
   ```

2. **Request URL: Get Brand Data**
   - URL: `https://api.brandfetch.io/v2/brands/{{$last.domain}}`
   - Method: GET
   - Headers: `Authorization: Bearer {{$env.BRANDFETCH_API_KEY}}`

3. **Condition: Check if brand data exists**
   - Rule: `{{$last.logos}} is not empty`

4. **Loop Through Logos**
   - For each logo format (SVG/PNG)
   - For each theme (light/dark)
   - For each type (logo/icon)

5. **Import from URL** (for each asset)
   - URL: `{{$last.formats[0].src}}`
   - Collection: `directus_files`
   - Store result

6. **Update Item** (final operation)
   - Collection: `services` (or `apps`, `hardware`, `operating_systems`)
   - Keys: `{{$trigger.payload.id}}`
   - Data:
     ```json
     {
       "brand_logo_light": "{{logo_light_file_id}}",
       "brand_logo_dark": "{{logo_dark_file_id}}",
       "brand_symbol_light": "{{symbol_light_file_id}}",
       "brand_symbol_dark": "{{symbol_dark_file_id}}"
     }
     ```

### Step 3: Create Flows in Directus

For each of the 4 collections:

1. Go to **Settings** → **Flows**
2. Click **Create Flow**
3. Name: `Fetch Brand Assets - [Collection Name]`
4. Trigger: **Event Hook**
5. Type: `items.create`, `items.update`
6. Collections: `[collection_name]`
7. Add the operations listed above

### Step 4: Test the Flow

1. Create a new item in any collection with a `website_url`
2. Check if brand assets are automatically populated
3. Verify all 4 variants are fetched (logo light/dark, symbol light/dark)

## Brandfetch API Reference

### Endpoint
```
GET https://api.brandfetch.io/v2/brands/{domain}
```

### Response Structure
```json
{
  "name": "Brand Name",
  "domain": "example.com",
  "logos": [
    {
      "type": "logo",
      "theme": "light",
      "formats": [
        {
          "format": "svg",
          "src": "https://..."
        },
        {
          "format": "png",
          "width": 200,
          "height": 200,
          "src": "https://..."
        }
      ]
    },
    {
      "type": "icon",
      "theme": "dark",
      "formats": [...]
    }
  ]
}
```

## Fallback Strategy

If Brandfetch doesn't have assets for a domain:
1. Try alternative domains (with/without www, .com/.org variations)
2. Manual upload option always available
3. Show clear message in Directus when auto-fetch fails

## Maintenance

- **Rate Limits**: Brandfetch free tier has rate limits
- **Caching**: Consider caching responses to avoid repeated API calls
- **Monitoring**: Set up logging for failed fetches
- **Updates**: Re-run flow manually when brands update their assets

## Notes

- The `icon` field in Services (line 13 of `types/services/index.ts`) appears to be deprecated in favor of the branding fields
- Consider removing the `icon` field once all services have migrated to the new branding system
