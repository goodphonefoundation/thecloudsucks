# n8n Workflow: Google Play App Enrichment

## Overview
This n8n workflow automatically fetches app metadata from Google Play Store and F-Droid, then creates or updates records in the Directus `mobile_apps` collection.

## Workflow Details
- **Workflow ID**: `cLAs4Dd3WFapb7Jx`
- **Name**: Google Play App Enrichment
- **Status**: Inactive (must be activated in n8n UI)
- **Nodes**: 13 (2 triggers, 1 merge, 10 processing nodes)
- **Trigger Types**: Form (UI) and Webhook (API)

## Access Methods

### Option 1: Web Form (Recommended for Manual Use)
Once the workflow is activated, access the form at:
```
https://n8n.thecloud.sucks/form/google-play-import
```

The form provides a simple interface where you can:
- Paste a Google Play Store URL
- Submit and see immediate feedback
- View success message with app name

### Option 2: Webhook API (For Automation)
Programmatic access via webhook:
```
POST https://n8n.thecloud.sucks/webhook/google-play-import
```

#### Request Payload
```json
{
  "google_play_url": "https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms"
}
```

#### Response
```json
{
  "success": true,
  "app_id": "a8596bf1-18c6-4a60-ba4c-653dc830979e",
  "app_name": "Signal",
  "action": "created",
  "message": "App data successfully imported",
  "formSubmittedText": "Success! App data has been created for: Signal"
}
```

## Workflow Logic

### 1a. Form Trigger (Option 1)
- Provides web-based form interface
- Path: `/form/google-play-import`
- Single field: "Google Play URL" (required)
- Title: "Add App from Google Play"
- Description: "Paste a Google Play Store URL to automatically fetch and enrich app data."
- Response mode: Show result when workflow finishes

### 1b. Webhook Trigger (Option 2)
- Receives POST requests with Google Play URL
- Path: `/webhook/google-play-import`
- Method: POST
- Accepts JSON payload with `google_play_url` field

### 2. Merge Inputs
- Combines data from either trigger (Form or Webhook)
- Mode: Append
- Ensures consistent data flow regardless of input method

### 3. Extract Package ID
- Handles input from both form (field: "Google Play URL") and webhook (field: "google_play_url")
- Validates URL format
- Extracts package ID (e.g., `org.thoughtcrime.securesms`)
- Throws error if URL is invalid

### 4. Check If App Exists
- Queries Directus `mobile_apps` collection
- Filters by `playstore_package_id`
- Returns existing app record if found

### 5. App Already Exists? (Conditional)
- Checks if app record exists in Directus
- Both branches (true/false) proceed to fetch fresh data
- Determines whether to CREATE or UPDATE later

### 6. Fetch SerpAPI Data
- Calls SerpAPI Google Play Product API
- Parameters:
  - `engine`: google_play_product
  - `product_id`: extracted package ID
  - `api_key`: (configured)
  - `hl`: en (language)
  - `gl`: us (country)

### 7. Transform SerpAPI Response
- Extracts app metadata from SerpAPI response
- Maps to Directus field structure
- Parses extensions for installs, file size, etc.

### 8. Fetch F-Droid Data
- Attempts to fetch app from F-Droid API
- Continues on failure (app may not be on F-Droid)
- URL: `https://f-droid.org/api/v1/packages/{packageId}`

### 9. Transform F-Droid Response
- Checks if F-Droid request succeeded
- Sets `fdroid_available` flag
- Stores F-Droid package data if available
- Marks app as open source if on F-Droid

### 10. Prepare Directus Payload
- Generates slug from app name (for new records)
- Builds payload with all enriched data
- For new records: includes basic app info
- For updates: includes only enrichment fields
- Sets metadata fields:
  - `external_data_fetched`: true
  - `external_data_fetch_date`: current timestamp

### 11. Create or Update App Record
- POST for new records: `/items/mobile_apps`
- PATCH for updates: `/items/mobile_apps/{id}`
- Uses Bearer token authentication
- Sends JSON payload

### 12. Respond to Webhook
- Returns success response with app details
- Includes app ID, name, and action performed
- For form submissions: displays `formSubmittedText` in the UI
- For webhook: returns JSON response

## Data Mapping

### SerpAPI → Directus Fields
| SerpAPI Field | Directus Field |
|---------------|----------------|
| `product_info.title` | `name` |
| `product_info.authors[0].name` | `developer_name` |
| `product_info.description` | `long_description` |
| `product_info.rating` | `playstore_rating` |
| `product_info.reviews` | `playstore_reviews_count` |
| `product_info.content_rating.text` | `playstore_content_rating` |
| `extensions` (Downloads/Installs) | `playstore_installs` |
| `extensions` (Size) | `playstore_file_size` |
| `product_info.released` | `playstore_released_date` |
| `product_info.updated` | `playstore_updated_date` |
| `product_info.version` | `playstore_version` |
| `product_info.screenshots` | `playstore_screenshots` (JSON) |
| `similar_apps` | `playstore_similar_apps` (JSON) |

### F-Droid → Directus Fields
- F-Droid API response → `fdroid_package_data` (JSON)
- Availability → `fdroid_available` (boolean)
- If available → `is_open_source`: true
- If available → `alternative_distribution`: ["fdroid"]

## Error Handling
- **Invalid URL**: Returns 400 error with message
- **SerpAPI Failure**: Workflow continues but fields remain null
- **F-Droid Not Found**: Not treated as error, sets `fdroid_available` to false
- **Directus Save Failure**: Returns 500 error with details

## Testing

### Test Cases

#### Via Web Form
1. Open form: https://n8n.thecloud.sucks/form/google-play-import
2. Paste URL: `https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms`
3. Click submit
4. Verify success message appears

#### Via Webhook API
1. **App on both stores**: Signal (`org.thoughtcrime.securesms`)
   ```bash
   curl -X POST https://n8n.thecloud.sucks/webhook/google-play-import \
     -H "Content-Type: application/json" \
     -d '{"google_play_url":"https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms"}'
   ```

2. **App only on Google Play**: Instagram (`com.instagram.android`)
   ```bash
   curl -X POST https://n8n.thecloud.sucks/webhook/google-play-import \
     -H "Content-Type: application/json" \
     -d '{"google_play_url":"https://play.google.com/store/apps/details?id=com.instagram.android"}'
   ```

3. **Invalid URL**:
   ```bash
   curl -X POST https://n8n.thecloud.sucks/webhook/google-play-import \
     -H "Content-Type: application/json" \
     -d '{"google_play_url":"https://invalid-url.com"}'
   ```

4. **Update existing app**: Re-import Signal
   ```bash
   curl -X POST https://n8n.thecloud.sucks/webhook/google-play-import \
     -H "Content-Type: application/json" \
     -d '{"google_play_url":"https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms"}'
   ```

## Activation Steps
1. Open n8n UI: https://n8n.thecloud.sucks
2. Navigate to workflow "Google Play App Enrichment"
3. Click "Active" toggle to enable the workflow
4. Test the webhook endpoint with sample data
5. Verify data appears in Directus mobile_apps collection

## Monitoring
- Check n8n execution history for failures
- Monitor SerpAPI quota usage
- Review Directus logs for database errors
- Verify `external_data_fetched` flag is being set

## Known Limitations
1. Workflow has validation warnings (see below) but is functional
2. SerpAPI has rate limits - monitor usage
3. F-Droid API may be slow or unavailable at times
4. No retry logic for failed API calls (manual re-run required)
5. No duplicate slug handling (may need manual intervention)

## Validation Warnings
The workflow has some non-critical warnings:
- IF node: Missing combinator field (doesn't affect functionality)
- Code nodes: Lack error handling (handled at workflow level)
- HTTP requests: Lack retry logic (acceptable for this use case)
- Long linear chain: Consider sub-workflows for future scalability

These warnings don't prevent the workflow from functioning correctly.

## Future Enhancements
- Add Apple App Store support
- Implement sentiment analysis on reviews
- Schedule periodic re-fetches for existing apps
- Add bulk import via CSV
- Create admin UI for easy submission
- Add webhook authentication
- Implement retry logic with exponential backoff
