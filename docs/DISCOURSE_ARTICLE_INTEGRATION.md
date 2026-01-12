# Discourse Article Integration

This document describes how to integrate Discourse forum discussions with your articles, automatically creating topics and displaying the latest comments.

## Overview

When an article is published in Directus, a Discourse topic is automatically created. Comments on that topic are synced back to the article page using webhooks.

## Architecture

```
Article Published (Directus)
    ↓
Directus Flow Triggers
    ↓
Create Discourse Topic via API
    ↓
Save topic_id to article
    ↓
User comments on Discourse
    ↓
Discourse sends webhook
    ↓
Nuxt API endpoint receives webhook
    ↓
Fetch latest comment
    ↓
Update article record
    ↓
Display on article page
```

## Setup Steps

### 1. Add Fields to Directus `posts` Collection

Add the following fields to your `posts` collection in Directus:

1. **discourse_topic_id**
   - Type: Integer
   - Interface: Input
   - Allow NULL: Yes
   - Note: "Discourse topic ID for this article"

2. **discourse_topic_url**
   - Type: String
   - Interface: Input
   - Allow NULL: Yes
   - Note: "Full URL to the Discourse topic"

3. **discourse_latest_comment**
   - Type: JSON
   - Interface: Code (JSON)
   - Allow NULL: Yes
   - Note: "Latest comment from Discourse"

### 2. Create Directus Flow for Topic Creation

Create a new flow in Directus:

**Flow Name:** Create Discourse Topic for Article

**Trigger:**
- Type: Event Hook
- Type: `items.create` and `items.update`
- Collections: `posts`

**Operations:**

#### Operation 1: Condition Check
- Type: Condition
- Rule:
```json
{
  "$and": [
    { "status": { "_eq": "published" } },
    { "discourse_topic_id": { "_null": true } }
  ]
}
```

#### Operation 2: Run Script - Create Discourse Topic
- Type: Run Script
- Code:
```javascript
module.exports = async function(data) {
  const axios = require('axios');
  const article = data.$trigger.payload;

  const discourseUrl = process.env.DISCOURSE_API_URL;
  const apiKey = process.env.DISCOURSE_API_KEY;
  const apiUsername = 'system'; // or your bot username

  // Create excerpt from article summary or content
  const excerpt = article.summary ||
    (article.content ? article.content.substring(0, 200) + '...' : '');

  // Create the topic
  const response = await axios.post(
    `${discourseUrl}/posts.json`,
    {
      title: article.title,
      raw: `${excerpt}\n\n[Read the full article here](${process.env.NUXT_PUBLIC_SITE_URL}/posts/${article.slug})`,
      category: 5, // Adjust to your category ID
      tags: ['article', 'blog']
    },
    {
      headers: {
        'Api-Key': apiKey,
        'Api-Username': apiUsername,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    topic_id: response.data.topic_id,
    topic_url: `${discourseUrl}/t/${response.data.topic_slug}/${response.data.topic_id}`
  };
};
```

#### Operation 3: Update Item - Save Topic Info
- Type: Update Data
- Collection: `posts`
- IDs: `{{$trigger.key}}`
- Payload:
```json
{
  "discourse_topic_id": "{{$last.topic_id}}",
  "discourse_topic_url": "{{$last.topic_url}}"
}
```

### 3. Configure Discourse Webhook

In your Discourse admin panel:

1. Go to **Admin** → **API** → **Webhooks**
2. Click **New Webhook**
3. Configure:
   - **Payload URL:** `https://yourdomain.com/api/webhooks/discourse`
   - **Content Type:** `application/json`
   - **Secret:** (optional, for verification)
   - **Events to trigger:**
     - ☑ Post Event
   - **Categories:** Select the category where articles are posted
4. Click **Create Webhook**

### 4. Update Article Display Components

Add the Discourse comments component to your article templates.

For blog posts (`components/post/PostBlog.vue`):
```vue
<template>
  <div>
    <!-- Existing article content -->

    <!-- Add at the bottom -->
    <PostDiscourseComments
      :topic-id="page.discourse_topic_id"
      :topic-url="page.discourse_topic_url"
      :latest-comment="page.discourse_latest_comment"
      :post-title="page.title"
    />
  </div>
</template>
```

### 5. Update Query in Article Page

Update `pages/posts/[slug].vue` to fetch the Discourse fields:

```javascript
fields: [
  'title',
  'summary',
  'slug',
  'content',
  'date_published',
  'image',
  'type',
  // Add these fields:
  'discourse_topic_id',
  'discourse_topic_url',
  'discourse_latest_comment',
  // ... other fields
],
```

## Testing

### Test Flow Manually

1. Create or edit an article in Directus
2. Set status to "Published"
3. Check Directus logs for the flow execution
4. Verify the topic was created in Discourse
5. Verify `discourse_topic_id` and `discourse_topic_url` were saved

### Test Webhook

1. Go to the Discourse topic
2. Post a comment
3. Check your webhook endpoint logs
4. Verify the article's `discourse_latest_comment` field was updated
5. Visit the article page and confirm the comment appears

## API Endpoints

### Webhook Endpoint
- **URL:** `/api/webhooks/discourse`
- **Method:** POST
- **Purpose:** Receive Discourse post notifications

**Expected Payload:**
```json
{
  "post": {
    "id": 123,
    "topic_id": 456,
    "username": "johndoe",
    "created_at": "2025-01-01T00:00:00Z",
    "cooked": "<p>Comment HTML</p>",
    "avatar_template": "/user_avatar/...",
    "post_number": 2
  },
  "topic": {
    "id": 456
  }
}
```

## Component Props

### DiscourseComments Component

```typescript
interface Props {
  topicId?: number;          // Discourse topic ID
  topicUrl?: string;         // Full URL to topic
  latestComment?: {          // Latest comment data
    id: number;
    username: string;
    avatar_template: string;
    created_at: string;
    cooked: string;
    post_number: number;
  };
  postTitle: string;         // Article title
}
```

## Troubleshooting

### Topic Not Created
- Check Directus flow logs
- Verify API credentials in `.env`
- Ensure Discourse API user has permission to create topics
- Check the category ID is correct

### Webhook Not Received
- Verify webhook URL is accessible from internet
- Check webhook secret matches (if using)
- Look at Discourse webhook delivery logs
- Check your server firewall settings

### Comments Not Updating
- Test the webhook endpoint directly with curl
- Check Directus connection in webhook handler
- Verify post has `discourse_topic_id` set
- Check server logs for errors

## Environment Variables

Required in `.env`:
```env
DISCOURSE_API_URL=https://community.brax.guide
DISCOURSE_API_KEY=your-api-key-here
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Security Considerations

1. **API Key Security:** Store API keys in environment variables, never commit to git
2. **Webhook Verification:** Consider adding webhook signature verification
3. **Rate Limiting:** Implement rate limiting on webhook endpoint
4. **Error Handling:** Ensure errors don't expose sensitive information

## Future Enhancements

- [ ] Display comment count badge
- [ ] Show multiple recent comments
- [ ] Add reaction counts
- [ ] Implement webhook signature verification
- [ ] Add rate limiting to webhook endpoint
- [ ] Cache Discourse data for performance
- [ ] Support for threaded comments
- [ ] Moderation features

## Support

For issues or questions:
- Check Discourse API documentation: https://docs.discourse.org
- Review Directus Flows documentation: https://docs.directus.io/app/flows
- Check server logs for detailed error messages
