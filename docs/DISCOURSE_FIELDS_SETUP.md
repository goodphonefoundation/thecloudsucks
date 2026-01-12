# Add Discourse Fields to Posts Collection

Follow these steps in the Directus admin panel at https://directus.brax.guide/admin

## Navigate to Data Model
1. Click **Settings** (gear icon) in the sidebar
2. Click **Data Model**
3. Find and click on the **posts** collection

## Add Field 1: discourse_topic_id

1. Click **Create Field** button
2. Select **Input** as the field type
3. Configure the field:
   - **Key**: `discourse_topic_id`
   - **Type**: Integer
   - **Field**: Input
   - **Interface Options**:
     - Placeholder: (leave empty)
     - Icon Suffix: (leave empty)
   - **Width**: Half
   - **Note**: "Discourse topic ID for this article"
   - **Required**: No (unchecked)
   - **Readonly**: No (unchecked)
   - **Hidden**: No (unchecked)
4. Click **Save**

## Add Field 2: discourse_topic_url

1. Click **Create Field** button
2. Select **Input** as the field type
3. Configure the field:
   - **Key**: `discourse_topic_url`
   - **Type**: String
   - **Field**: Input
   - **Interface Options**:
     - Placeholder: "https://community.brax.guide/t/..."
     - Icon Suffix: (leave empty)
   - **Width**: Half
   - **Note**: "Full URL to the Discourse topic"
   - **Required**: No (unchecked)
   - **Readonly**: No (unchecked)
   - **Hidden**: No (unchecked)
4. Click **Save**

## Add Field 3: discourse_latest_comment

1. Click **Create Field** button
2. Select **JSON** as the field type (or find "Code" interface)
3. Configure the field:
   - **Key**: `discourse_latest_comment`
   - **Type**: JSON
   - **Field**: Code
   - **Interface Options**:
     - Language: JSON
     - Line Numbers: Yes
   - **Width**: Full
   - **Note**: "Latest comment from Discourse (auto-updated by webhook)"
   - **Required**: No (unchecked)
   - **Readonly**: No (unchecked)
   - **Hidden**: No (unchecked)
4. Click **Save**

## Verify Fields

After adding all three fields, go to Content → Posts and click on any post to verify the new fields appear in the form.

## Next Steps

After adding these fields, you can:
1. Create the Directus Flow for automatic topic creation (see `DISCOURSE_ARTICLE_INTEGRATION.md`)
2. Configure the Discourse webhook
3. Test by publishing a new article
