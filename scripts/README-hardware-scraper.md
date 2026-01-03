# Hardware Collections Refactor & GSMArena Scraper

This implementation refactors the hardware collection structure to support a brand/model hierarchy and includes a GSMArena scraper for automated phone specification collection.

## Overview

### New Collections

#### `hardware_brands`
Brand-level container with:
- Basic brand info (name, slug, website)
- Logo/symbol images (light/dark theme variants)
- Description and metadata
- O2M relationship to hardware_models

**View in Directus**: [Hardware Brands Collection](https://directus.thecloud.sucks/admin/content/hardware_brands)

#### `hardware_models`
Individual device models with:
- **Basic Info**: Name, slug, hardware type, descriptions
- **GSMArena Integration**: URL and ID for source tracking
- **Technical Specs** (40+ fields):
  - Network (2G/3G/4G/5G bands, technology, speed)
  - Launch (release date, status)
  - Body (dimensions, weight, materials, IP rating, SIM type)
  - Display (type, size, resolution, protection)
  - Platform (OS, chipset, CPU, GPU)
  - Memory (card slot, internal storage variants)
  - Cameras (main camera array, features, video specs, selfie camera)
  - Sound (loudspeaker, audio jack)
  - Connectivity (WLAN, Bluetooth, positioning, NFC, radio, USB)
  - Sensors
  - Battery (type, charging)
  - Misc (colors, price)
- **Assessment Fields** (existing framework maintained):
  - Repairability, parts availability
  - Warranty and software support years
  - Bootloader, firmware, alternative OS support
  - Telemetry and cloud dependency
  - Tier, recommended use, audience level
  - Scores and justifications (privacy, autonomy, transparency, governance)

**View in Directus**: [Hardware Models Collection](https://directus.thecloud.sucks/admin/content/hardware_models)

## GSMArena Scraper

### Installation

1. Install dependencies:
```bash
npm install axios
```

2. Set your Directus API token:
```bash
# Windows PowerShell
$env:DIRECTUS_TOKEN="your_directus_token_here"

# Linux/Mac
export DIRECTUS_TOKEN="your_directus_token_here"
```

### Usage

#### Method 1: Using the Node.js Script (Recommended for batch processing)

The scraper script includes hardcoded data for the Samsung Galaxy M17 5G as an example:

```bash
node scripts/gsmarena-scraper.js https://www.gsmarena.com/samsung_galaxy_m17_5g-14221.php
```

**Features:**
- Automatically creates or retrieves the brand
- Creates or updates the phone model
- Handles all specification fields
- Returns Directus URLs for viewing the created items

#### Method 2: Using Playwright MCP + Directus MCP (Recommended for live scraping)

For scraping live from GSMArena:

1. **Navigate to the page** using Playwright MCP:
   ```
   browser_navigate(url: "https://www.gsmarena.com/samsung_galaxy_m17_5g-14221.php")
   ```

2. **Extract specs** using the extraction function:
   ```javascript
   // Use the extractPhoneSpecs() function from scripts/gsmarena-scraper.js
   // Run it with Playwright's browser_evaluate MCP tool
   ```

3. **Create brand and model** using Directus MCP:
   ```
   Use the items tool to create hardware_brands and hardware_models entries
   ```

### Extraction Function

The `extractPhoneSpecs()` function in `gsmarena-scraper.js` is designed to run in the browser context via Playwright's `browser_evaluate`. It:

- Extracts the phone name and brand
- Parses all specification tables
- Handles variants (multiple RAM/storage configurations)
- Formats data for Directus JSON fields
- Returns a structured object ready for database insertion

### Example Output

```javascript
{
  name: "Samsung Galaxy M17",
  brandName: "Samsung",
  chipset: "Exynos 1330 (5 nm)",
  display_type: "Super AMOLED, 90Hz, 1100 nits (HBM)",
  internal_storage: [
    { storage: "128GB", ram: "4GB" },
    { storage: "128GB", ram: "6GB" },
    { storage: "128GB", ram: "8GB" }
  ],
  main_camera: [
    "50 MP, f/1.8, (wide), 1/2.76\", 0.64µm, AF, OIS",
    "5 MP, f/2.2, (ultrawide), 1/5.0\", 1.12µm",
    "2 MP (macro)"
  ],
  // ... 40+ more fields
}
```

## Data Structure

### Brand → Models Relationship

```
hardware_brands (M2O) ← hardware_models
       ↓ (O2M)
  hardware_models
```

- One brand has many models (O2M)
- One model belongs to one brand (M2O)
- Cascading updates maintain referential integrity

### Example Data Hierarchy

```
Samsung (Brand)
├── Galaxy M17 5G
├── Galaxy A56
├── Galaxy S25 Ultra
└── ...

Apple (Brand)
├── iPhone 16 Pro
├── iPhone 16
└── ...
```

## Testing

A test entry has been created:

- **Brand**: Samsung (ID: `74aebfb1-8f82-4680-bb68-39fb1d70ed93`)
  - [View in Directus](https://directus.thecloud.sucks/admin/content/hardware_brands/74aebfb1-8f82-4680-bb68-39fb1d70ed93)

- **Model**: Galaxy M17 5G (ID: `6402f59e-e242-4eb6-982e-35296354ec81`)
  - [View in Directus](https://directus.thecloud.sucks/admin/content/hardware_models/6402f59e-e242-4eb6-982e-35296354ec81)
  - Contains full specifications scraped from GSMArena
  - All 40+ technical specification fields populated
  - Assessment fields ready for manual entry

## Next Steps

### For Adding More Phones

1. Navigate to the GSMArena phone page with Playwright
2. Extract specs using `browser_evaluate` with the `extractPhoneSpecs()` function
3. Create/update brand and model using Directus MCP items tool
4. Add assessment data (repairability, privacy scores, etc.) manually in Directus UI

### For Batch Imports

1. Create a list of GSMArena URLs
2. Use the Node.js scraper script in a loop
3. Consider rate limiting to avoid overloading GSMArena

### For UI Integration

Update any existing UI components that reference `hardware_items`:
- Change collection references to `hardware_models`
- Update GraphQL queries to include brand relationship
- Use the new specification fields for display
- Consider showing brand logos from `hardware_brands`

## Benefits

✅ **Clear Hierarchy**: Brand → Models structure matches real-world organization  
✅ **Comprehensive Data**: 40+ specification fields from authoritative source  
✅ **Automated Entry**: Scraper eliminates manual data entry for technical specs  
✅ **Maintained Assessments**: Existing privacy/repairability framework preserved  
✅ **Scalable**: Easy to add new brands and models  
✅ **Traceable**: GSMArena URL stored for source attribution  

## Files

- `scripts/gsmarena-scraper.js` - Main scraper script
- `scripts/README-hardware-scraper.md` - This documentation

## Collections in Directus

- [hardware_brands](https://directus.thecloud.sucks/admin/content/hardware_brands)
- [hardware_models](https://directus.thecloud.sucks/admin/content/hardware_models)

---

*Implementation completed: January 2, 2026*
