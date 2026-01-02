# n8n Workflow: Create Discourse Posts

This workflow receives post data via webhook and creates posts in Discourse.

## Current Workflow

**ID:** CLtNxODTv9ysuzqC
**Name:** Discourse comment sync
**Webhook URL:** https://lunr.app.n8n.cloud/webhook/8d8030bf-a27e-428e-a7e1-b8f15de5629d

## Nodes to Add

### 1. Webhook Node (Already exists)
- **HTTP Method:** POST
- **Path:** `8d8030bf-a27e-428e-a7e1-b8f15de5629d`
- **Response Mode:** Immediately

### 2. HTTP Request Node - Create Discourse Post

**Node:** HTTP Request
- **Method:** POST
- **URL:** `https://community.thecloud.sucks/posts.json`
- **Authentication:** Generic Credential Type
  - **Header Name:** `Api-Key`
  - **Value:** `YOUR_DISCOURSE_API_KEY`
- **Add Header:**
  - **Name:** `Api-Username`
  - **Value:** `system`
- **Body Content Type:** JSON
- **Body Parameters:**
  ```json
  {
    "title": "={{ $json.title }}",
    "raw": "={{ $json.content }}\n\n[Read full article](={{ $json.url }})",
    "category": 5
  }
  ```

### 3. Code Node - Extract Response Data

**Node:** Code
```javascript
const response = $input.item.json;

return {
  json: {
    discourse_topic_id: response.topic_id,
    discourse_topic_url: `https://community.thecloud.sucks/t/${response.topic_slug}/${response.topic_id}`,
    post_id: $('Webhook').item.json.post_id
  }
};
```

### 4. Directus Node - Update Post (Optional)

**Node:** Directus
- **Operation:** Update
- **Collection:** posts
- **ID:** `={{ $json.post_id }}`
- **Fields to Update:**
  - **discourse_topic_id:** `={{ $json.discourse_topic_id }}`
  - **discourse_topic_url:** `={{ $json.discourse_topic_url }}`

## Expected Webhook Payload

```json
{
  "post_id": "46165ced-9763-488b-a444-1712426b2316",
  "title": "Top 10 Messaging Apps for Privacy in 2025",
  "content": "In an era where our digital conversations are increasingly monitored...",
  "url": "https://thecloud.sucks/posts/top-10-messaging-apps-for-privacy-in-2025",
  "category": 5
}
```

## Testing

Send test data:
```powershell
$body = @{
    post_id = "46165ced-9763-488b-a444-1712426b2316"
    title = "Test Post from n8n"
    content = "This is a test post created via n8n workflow"
    url = "https://thecloud.sucks/posts/test"
    category = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://lunr.app.n8n.cloud/webhook-test/8d8030bf-a27e-428e-a7e1-b8f15de5629d" -Method Post -Body $body -ContentType "application/json"
```

## Integration Points

### From Directus Flow
The existing Directus flow can call this n8n webhook instead of creating topics directly:
1. Directus flow triggers on post publish
2. Flow calls n8n webhook with post data
3. n8n creates Discourse topic
4. n8n updates Directus with topic ID and URL

### From Nuxt App
The Nuxt app can trigger this when needed for manual topic creation.

## Environment Variables Needed

Configure in n8n:
- **DISCOURSE_API_KEY** - Your Discourse API key
- **DISCOURSE_URL** - https://community.thecloud.sucks

## Advantages

1. **Centralized logic** - All Discourse interaction in n8n
2. **Reusable** - Can be called from Directus, Nuxt, or external sources
3. **Monitored** - All executions logged in n8n
4. **Error handling** - n8n built-in retry and error workflows
