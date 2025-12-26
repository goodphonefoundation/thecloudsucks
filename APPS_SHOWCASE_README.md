# Apps Showcase Block - Implementation Guide

## Overview
The Apps Showcase block has been successfully implemented in your Nuxt 3 application. It displays apps from your Directus CMS with filtering, styling options, and beautiful animations.

## Files Created/Modified

### Type Definitions
1. **`types/apps/index.ts`** - Core app and category interfaces
2. **`types/blocks/block-apps-showcase.ts`** - Block-specific interface
3. **`types/blocks/block.ts`** - Updated to include new block type
4. **`types/index.ts`** - Updated to export apps types

### Components
5. **`components/blocks/AppsShowcase.vue`** - Main Vue component
6. **`components/PageBuilder.vue`** - Updated to register new block

## Features

### Display Modes
- **Grid**: 3-column responsive grid layout
- **List**: Single column list view
- **Featured**: 2-column featured layout

### App Cards Include
- App icon (if available)
- App name
- Short description
- Feature badges (Open Source, E2E Encrypted, No Tracking)
- Links to website and source code
- Hover effects and animations
- Dark mode support

### Filtering
- Can filter apps by category
- Only shows published apps
- Alphabetically sorted by name

## Usage

### In Directus Admin
1. Go to the Services page or any page where you want to add apps
2. Add a "Block Apps Showcase" block
3. Fill in:
   - **Headline**: Rich text heading (e.g., "Secure Messaging Apps")
   - **Content**: Description text
   - **Display Style**: Choose grid, list, or featured
   - **Filter by Category**: Optional - select a category to filter apps

### API Query
The component fetches apps with these fields:
```typescript
fields: [
  'id', 'name', 'slug', 'short_description',
  'website_url', 'repo_url', 'icon',
  'is_open_source', 'end_to_end_encryption', 'default_tracking'
]
```

### Current Implementation
✅ Block added to Services page (`/services`)
✅ Filtered by "Messaging" category
✅ Shows Signal, Telegram, and Session apps
✅ Grid layout with animations

## Customization

### Styling
The component uses Tailwind CSS and Nuxt UI components. You can customize:
- Card styles in the template
- Badge colors and styles
- Button colors and variants
- Animation timing and effects

### Badge Logic
Current badges display for:
- `is_open_source === true` → "Open Source" (green)
- `end_to_end_encryption === 'yes'` → "E2E Encrypted" (blue)
- `default_tracking === 'none'` → "No Tracking" (purple)

### Adding More Fields
To display additional app data:
1. Add fields to the query in `AppsShowcase.vue`
2. Update the template to display the new data
3. Optionally update `types/apps/index.ts` if adding new fields

## Testing

### View the Results
- **Admin Panel**: https://directus.thecloud.sucks/admin/content/pages/ac35a4c6-ca73-48c4-9c02-37a50d4bc736
- **Frontend**: Visit `/services` on your Nuxt site

### Troubleshooting
If apps don't appear:
1. Check that apps are published in Directus
2. Verify the category filter is correct
3. Check browser console for API errors
4. Ensure Directus API is accessible

## Next Steps

### Potential Enhancements
- Add app detail pages (`/apps/:slug`)
- Implement search/filter UI on frontend
- Add comparison features
- Include ratings or reviews
- Add "Featured" flag to apps
- Create dedicated apps directory page

### Additional Categories
You can create more categories:
- Cloud & Sync
- Documents & Collaboration
- Identity & Authentication
- Browsing & Search
- etc.

## Technical Details

### Dependencies
- Nuxt 3
- @directus/sdk
- @nuxt/ui (for buttons)
- @vueuse/motion (for animations)
- Tailwind CSS (for styling)

### Performance
- Uses `useAsyncData` for server-side rendering
- Data is cached and reused
- Images are lazy-loaded with NuxtImg
- Animations trigger on viewport visibility

## Support
For questions or issues, check:
- Directus documentation: https://docs.directus.io
- Nuxt documentation: https://nuxt.com
- Your project's existing block components for patterns
