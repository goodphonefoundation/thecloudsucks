# n8n Discourse Comment Sync Workflow

This document describes the n8n workflow to sync Discourse comments to Directus posts.

## Overview

Instead of using a Nuxt API endpoint, we use n8n to handle Discourse webhooks and update Directus directly.

## Workflow Setup

### 1. Create New Workflow in n8n

1. Go to your n8n instance
2. Click "Add Workflow"
3. Name it: "Discourse Comment Sync"

### 2. Add Webhook Trigger Node

**Node:** Webhook
- **HTTP Method:** POST
- **Path:** `discourse-comments` (or your preferred path)
- **Authentication:** None (or configure if desired)
- **Response Mode:** Immediately

This will generate a webhook URL like: `https://your-n8n-instance.com/webhook/discourse-comments`

### 3. Add Filter Node (Optional but Recommended)

**Node:** Filter
- **Condition:** `{{ $json.post.post_number }} > 1`

This filters out the initial post (post_number 1) and only processes actual comments.

### 4. Add HTTP Request Node - Get Full Topic

**Node:** HTTP Request
- **Method:** GET
- **URL:** `https://community.thecloud.sucks/t/{{ $json.topic.id }}.json`
- **Authentication:** Generic Credential Type
  - **Header Name:** `Api-Key`
  - **Value:** `YOUR_DISCOURSE_API_KEY`
- **Add Header:**
  - **Name:** `Api-Username`
  - **Value:** `system`

This fetches the complete topic data to get the latest comment.

### 5. Add Code Node - Extract Latest Comment

**Node:** Code
```javascript
const posts = $input.item.json.post_stream.posts;
const latestPost = posts.length > 1 ? posts[posts.length - 1] : null;

if (latestPost) {
  return {
    json: {
      topic_id: $('Webhook').item.json.topic.id,
      latest_comment: {
        id: latestPost.id,
        username: latestPost.username,
        avatar_template: latestPost.avatar_template,
        created_at: latestPost.created_at,
        cooked: latestPost.cooked,
        post_number: latestPost.post_number
      }
    }
  };
}

return { json: {} };
```

### 6. Add Directus Node - Find Post

**Node:** Directus
- **Operation:** Get Many
- **Collection:** posts
- **Filters:**
  - **Field:** `discourse_topic_id`
  - **Operator:** `_eq`
  - **Value:** `{{ $json.topic_id }}`
- **Limit:** 1

### 7. Add IF Node - Check if Post Found

**Node:** IF
- **Condition:** `{{ $json.length > 0 }}`

### 8. Add Directus Node - Update Post (True Branch)

**Node:** Directus
- **Operation:** Update
- **Collection:** posts
- **ID:** `{{ $('Directus').item.json[0].id }}`
- **Fields to Update:**
  - **discourse_latest_comment:** `{{ $('Code').item.json.latest_comment }}`

### 9. Activate Workflow

Click "Active" toggle to enable the workflow.

## Configure Discourse Webhook

1. Go to Discourse Admin → API → Webhooks
2. Create new webhook:
   - **Payload URL:** `https://your-n8n-instance.com/webhook/discourse-comments`
   - **Content Type:** `application/json`
   - **Events:** Post Event ☑
   - **Category:** 5 (Articles)
   - **Active:** ☑

## Testing

1. Post a comment on a Discourse topic that has a linked article
2. Check n8n executions to see if workflow ran
3. Check Directus to verify `discourse_latest_comment` was updated
4. Refresh the blog post page to see the comment appear

## Environment Variables Not Needed

Since n8n handles everything, you don't need these in your Nuxt app:
- ~~DISCOURSE_API_URL~~
- ~~DISCOURSE_API_KEY~~

These are configured directly in n8n nodes.

## Advantages of n8n Approach

1. **Visual workflow** - Easy to see and modify the logic
2. **Built-in retry** - n8n handles webhook failures and retries
3. **Logging** - All executions are logged in n8n
4. **No code deployment** - Change workflow without redeploying Nuxt app
5. **Monitoring** - n8n dashboard shows execution history

## Removing the Old Directus Flow

Since n8n now handles comment syncing, you can delete the old Directus flow that creates topics. Actually, keep it for topic creation, but it no longer needs to handle comment syncing.

## Troubleshooting

### Webhook not triggering
- Check Discourse webhook delivery logs
- Verify n8n webhook URL is publicly accessible
- Check n8n execution logs

### Post not updating
- Verify Directus credentials in n8n
- Check that `discourse_topic_id` field exists and has correct value
- Review n8n execution details for error messages

### Comment not displaying
- Clear browser cache
- Check that `discourse_latest_comment` field was updated in Directus
- Verify DiscourseComments component is receiving the data
