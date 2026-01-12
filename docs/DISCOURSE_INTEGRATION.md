# Discourse Integration for Cloud Project

This document describes the Discourse community forum integration that displays the top 10 latest posts in a carousel.

## What Was Created

### 1. Environment Configuration

Added to `.env`:

```env
DISCOURSE_API_URL="https://community.brax.guide"
DISCOURSE_API_KEY="020d14f29412d490811d7339e2f36f38ade8220fcb6498afb7eb7201b4b07cbd"
```

### 2. Directus Flow (Automated Data Sync)

Created a scheduled flow that automatically fetches Discourse posts every 30 minutes:

**Flow Name:** Fetch Discourse Posts
**URL:** https://directus.brax.guide/admin/settings/flows/6c14cf97-4259-48ae-b60a-19943d578b3c

**Operations:**

1. **Fetch Discourse Latest Posts** - Makes API request to Discourse `/latest.json` endpoint
2. **Transform Posts Data** - Processes response and extracts top 10 posts with relevant fields
3. **Update Globals with Posts** - Stores transformed posts in the `globals` collection

### 3. Database Schema

Added new field to `globals` collection:

- **Field Name:** `discourse_posts`
- **Type:** JSON
- **Interface:** Code input (JSON)
- **Purpose:** Stores the latest 10 posts from Discourse
- **Auto-updated:** Every 30 minutes by the Directus flow

### 4. Vue Component

Created `components/blocks/DiscoursePosts.vue`:

- Displays posts in a horizontal scrolling carousel
- Features navigation arrows and progress indicators
- Shows post metadata (views, replies, likes, date)
- Responsive design with mobile support
- Links directly to posts on Discourse forum
- Dark mode support

### 5. Demo Page & Home Page Integration

- **Home Page:** Automatically displays at the bottom of the home page (`/`)
- **Demo Page:** Also available at `http://localhost:3000/community`
- Component can be used anywhere in your app

## How It Works

1. **Automated Sync:** Every 30 minutes, Directus fetches the latest posts from your Discourse instance
2. **Data Storage:** Posts are stored in the `globals` collection's `discourse_posts` field
3. **Display:** The Vue component fetches the data from Directus and displays it in a carousel
4. **Real-time Links:** Each post card links to the actual post on the Discourse forum

## Features

- ✅ Top 10 latest community posts
- ✅ Horizontal carousel with smooth scrolling
- ✅ Post metadata display (views, replies, likes)
- ✅ Direct links to forum posts
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Automatic updates every 30 minutes
- ✅ Beautiful gradient background
- ✅ Navigation arrows and progress indicators

## Usage

### Using the Component in Pages

You can add the Discourse posts carousel to any page:

```vue
<template>
	<div>
		<BlocksDiscoursePosts />
	</div>
</template>
```

### With Custom Title and Headline

```vue
<template>
	<div>
		<BlocksDiscoursePosts
			:data="{
				title: 'Join Our Community',
				headline: 'See what people are discussing',
			}"
		/>
	</div>
</template>
```

## Testing the Flow Manually

You can manually trigger the flow in Directus to test it:

1. Go to: https://directus.brax.guide/admin/settings/flows/6c14cf97-4259-48ae-b60a-19943d578b3c
2. Click the "Test Flow" button in the top right
3. Check the `globals` collection to see the updated `discourse_posts` field

## Post Data Structure

Each post includes:

```typescript
{
	id: string; // Discourse topic ID
	title: string; // Topic title
	slug: string; // URL-friendly slug
	excerpt: string; // Post excerpt/preview
	created_at: string; // ISO date string
	views: number; // View count
	reply_count: number; // Number of replies
	like_count: number; // Number of likes
	url: string; // Direct link to post
	image_url: string | null; // Featured image (if any)
}
```

## Troubleshooting

### Posts Not Showing Up

1. Check that the Directus flow is active
2. Manually trigger the flow to test
3. Verify the API key is correct in `.env`
4. Check that the Discourse API is accessible

### Component Not Loading

1. Ensure the `discourse_posts` field exists in the `globals` collection
2. Check browser console for errors
3. Verify the Nuxt dev server is running

## API Rate Limits

The flow runs every 30 minutes to respect Discourse API rate limits. You can adjust the schedule in the flow settings if
needed.

## Security Note

The API key is stored in environment variables and only used server-side in the Directus flow. It's never exposed to the
client.
