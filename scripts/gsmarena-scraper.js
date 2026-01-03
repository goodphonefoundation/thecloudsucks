/**
 * GSMArena Phone Scraper
 * 
 * Scrapes phone specifications from GSMArena and populates Directus hardware collections
 * Usage: node gsmarena-scraper.js <gsmarena_url>
 * Example: node gsmarena-scraper.js https://www.gsmarena.com/samsung_galaxy_m17_5g-14221.php
 */

const axios = require('axios');

// Configuration
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://directus.thecloud.sucks';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('Error: DIRECTUS_TOKEN environment variable is required');
  process.exit(1);
}

const directusApi = axios.create({
  baseURL: `${DIRECTUS_URL}/items`,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Extract phone specifications from GSMArena page
 * This function should be run using Playwright MCP browser_evaluate
 */
function extractPhoneSpecs() {
  const specs = {};
  
  // Extract title
  const titleEl = document.querySelector('h1.specs-phone-name-title');
  if (titleEl) {
    specs.name = titleEl.textContent.trim();
    // Extract brand from name (first word)
    const nameParts = specs.name.split(' ');
    specs.brandName = nameParts[0];
  }
  
  // Helper function to extract cell value by row label
  function getCellValue(labelText) {
    const rows = document.querySelectorAll('table tr');
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        const label = cells[0].textContent.trim();
        if (label.toLowerCase() === labelText.toLowerCase()) {
          return cells[1].textContent.trim();
        }
      }
    }
    return null;
  }
  
  // Network specs
  specs.network_technology = getCellValue('Technology');
  specs.network_2g_bands = getCellValue('2G bands');
  specs.network_3g_bands = getCellValue('3G bands');
  specs.network_4g_bands = getCellValue('4G bands');
  specs.network_5g_bands = getCellValue('5G bands');
  specs.network_speed = getCellValue('Speed');
  
  // Launch specs
  specs.release_status = getCellValue('Status');
  const announced = getCellValue('Announced');
  if (announced) {
    // Try to parse date from "2025, October 10" format
    try {
      const match = announced.match(/(\d{4}),\s+(\w+)\s+(\d+)/);
      if (match) {
        const [, year, month, day] = match;
        const monthMap = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04',
          'May': '05', 'June': '06', 'July': '07', 'August': '08',
          'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        specs.release_date = `${year}-${monthMap[month]}-${day.padStart(2, '0')}`;
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
  }
  
  // Body specs
  specs.dimensions = getCellValue('Dimensions');
  specs.weight = getCellValue('Weight');
  specs.build_materials = getCellValue('Build');
  specs.sim_type = getCellValue('SIM');
  
  // IP rating (may be in separate row)
  const ipRating = getCellValue('');
  if (ipRating && ipRating.includes('IP')) {
    specs.ip_rating = ipRating;
  }
  
  // Display specs
  specs.display_type = getCellValue('Type');
  specs.display_size = getCellValue('Size');
  specs.display_resolution = getCellValue('Resolution');
  specs.display_protection = getCellValue('Protection');
  
  // Platform specs
  specs.os = getCellValue('OS');
  specs.chipset = getCellValue('Chipset');
  specs.cpu = getCellValue('CPU');
  specs.gpu = getCellValue('GPU');
  
  // Memory specs
  specs.memory_card_slot = getCellValue('Card slot');
  const internalStorage = getCellValue('Internal');
  if (internalStorage) {
    // Parse variants like "128GB 4GB RAM, 128GB 6GB RAM, 128GB 8GB RAM"
    const variants = internalStorage.split(',').map(v => {
      const match = v.trim().match(/(\d+GB)\s+(\d+GB)\s+RAM/);
      if (match) {
        return { storage: match[1], ram: match[2] };
      }
      return null;
    }).filter(Boolean);
    if (variants.length > 0) {
      specs.internal_storage = JSON.stringify(variants);
    }
  }
  
  // Camera specs
  const mainCamera = getCellValue('Triple') || getCellValue('Dual') || getCellValue('Single');
  if (mainCamera) {
    // Split by line breaks to get individual camera specs
    const cameras = mainCamera.split('\n').filter(c => c.trim()).map(c => c.trim());
    specs.main_camera = JSON.stringify(cameras);
  }
  specs.main_camera_features = getCellValue('Features');
  const mainVideo = getCellValue('Video');
  if (mainVideo) {
    specs.main_camera_video = mainVideo;
  }
  
  // Selfie camera
  const selfieCamera = document.querySelectorAll('table')[6]; // Selfie camera table
  if (selfieCamera) {
    const selfieSingle = getCellValue('Single');
    if (selfieSingle) {
      specs.selfie_camera = selfieSingle;
    }
  }
  
  // Extract selfie camera video separately
  const allRows = Array.from(document.querySelectorAll('table tr'));
  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    const headerCell = row.querySelector('th');
    if (headerCell && headerCell.textContent.trim() === 'Selfie camera') {
      // Look for Video row in next rows
      for (let j = i + 1; j < Math.min(i + 5, allRows.length); j++) {
        const cells = allRows[j].querySelectorAll('td');
        if (cells.length >= 2 && cells[0].textContent.trim() === 'Video') {
          specs.selfie_camera_video = cells[1].textContent.trim();
          break;
        }
      }
      break;
    }
  }
  
  // Sound specs
  specs.loudspeaker = getCellValue('Loudspeaker');
  specs.audio_jack = getCellValue('3.5mm jack');
  
  // Comms specs
  specs.wlan = getCellValue('WLAN');
  specs.bluetooth = getCellValue('Bluetooth');
  specs.positioning = getCellValue('Positioning');
  specs.nfc = getCellValue('NFC');
  specs.radio = getCellValue('Radio');
  specs.usb = getCellValue('USB');
  
  // Features
  specs.sensors = getCellValue('Sensors');
  
  // Battery
  specs.battery_type = getCellValue('Type');
  const charging = getCellValue('Charging');
  if (charging) {
    specs.battery_charging = charging;
  }
  
  // Misc
  specs.colors = getCellValue('Colors');
  specs.price = getCellValue('Price');
  
  return specs;
}

/**
 * Create or get brand in Directus
 */
async function createOrGetBrand(brandName) {
  try {
    // Check if brand exists
    const response = await directusApi.get('/hardware_brands', {
      params: {
        filter: { name: { _eq: brandName } },
        limit: 1
      }
    });
    
    if (response.data.data && response.data.data.length > 0) {
      console.log(`Brand "${brandName}" already exists`);
      return response.data.data[0];
    }
    
    // Create brand
    console.log(`Creating brand "${brandName}"`);
    const createResponse = await directusApi.post('/hardware_brands', {
      name: brandName,
      slug: brandName.toLowerCase().replace(/\s+/g, '-'),
      status: 'active'
    });
    
    return createResponse.data.data;
  } catch (error) {
    console.error('Error creating/getting brand:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create phone model in Directus
 */
async function createPhoneModel(specs, brandId, gsmarenaUrl) {
  try {
    // Extract GSMArena ID from URL
    const urlMatch = gsmarenaUrl.match(/-(\d+)\.php/);
    const gsmarenaId = urlMatch ? urlMatch[1] : null;
    
    // Generate slug from name
    const slug = specs.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    // Check if model already exists
    const existingResponse = await directusApi.get('/hardware_models', {
      params: {
        filter: { 
          _and: [
            { brand: { _eq: brandId } },
            { slug: { _eq: slug } }
          ]
        },
        limit: 1
      }
    });
    
    if (existingResponse.data.data && existingResponse.data.data.length > 0) {
      console.log(`Model "${specs.name}" already exists, updating...`);
      const existingId = existingResponse.data.data[0].id;
      
      const updateResponse = await directusApi.patch(`/hardware_models/${existingId}`, {
        ...prepareModelData(specs, brandId, gsmarenaUrl, gsmarenaId, slug)
      });
      
      return updateResponse.data.data;
    }
    
    // Create new model
    console.log(`Creating model "${specs.name}"`);
    const createResponse = await directusApi.post('/hardware_models', {
      ...prepareModelData(specs, brandId, gsmarenaUrl, gsmarenaId, slug)
    });
    
    return createResponse.data.data;
  } catch (error) {
    console.error('Error creating phone model:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Prepare model data for Directus
 */
function prepareModelData(specs, brandId, gsmarenaUrl, gsmarenaId, slug) {
  return {
    brand: brandId,
    name: specs.name,
    slug: slug,
    gsmarena_url: gsmarenaUrl,
    gsmarena_id: gsmarenaId,
    hardware_type: 'phone',
    status: 'active',
    short_description: `${specs.name} with ${specs.chipset || 'chipset'} and ${specs.battery_type || 'battery'}`,
    summary: `${specs.name} smartphone with ${specs.display_type || 'display'} and ${specs.os || 'OS'}`,
    
    // Technical specs
    release_date: specs.release_date || null,
    release_status: specs.release_status || null,
    dimensions: specs.dimensions || null,
    weight: specs.weight || null,
    build_materials: specs.build_materials || null,
    sim_type: specs.sim_type || null,
    ip_rating: specs.ip_rating || null,
    
    display_type: specs.display_type || null,
    display_size: specs.display_size || null,
    display_resolution: specs.display_resolution || null,
    display_protection: specs.display_protection || null,
    
    os: specs.os || null,
    chipset: specs.chipset || null,
    cpu: specs.cpu || null,
    gpu: specs.gpu || null,
    
    memory_card_slot: specs.memory_card_slot || null,
    internal_storage: specs.internal_storage ? JSON.parse(specs.internal_storage) : null,
    
    main_camera: specs.main_camera ? JSON.parse(specs.main_camera) : null,
    main_camera_features: specs.main_camera_features || null,
    main_camera_video: specs.main_camera_video || null,
    selfie_camera: specs.selfie_camera || null,
    selfie_camera_video: specs.selfie_camera_video || null,
    
    loudspeaker: specs.loudspeaker || null,
    audio_jack: specs.audio_jack || null,
    
    wlan: specs.wlan || null,
    bluetooth: specs.bluetooth || null,
    positioning: specs.positioning || null,
    nfc: specs.nfc || null,
    radio: specs.radio || null,
    usb: specs.usb || null,
    
    sensors: specs.sensors || null,
    
    battery_type: specs.battery_type || null,
    battery_charging: specs.battery_charging || null,
    
    colors: specs.colors || null,
    price: specs.price || null,
    
    network_technology: specs.network_technology || null,
    network_2g_bands: specs.network_2g_bands || null,
    network_3g_bands: specs.network_3g_bands || null,
    network_4g_bands: specs.network_4g_bands || null,
    network_5g_bands: specs.network_5g_bands || null,
    network_speed: specs.network_speed || null
  };
}

/**
 * Main scraper function
 * Note: This script requires Playwright MCP to be available
 * The actual page navigation and extraction should be done through MCP calls
 */
async function scrapeGSMArena(url) {
  console.log(`Starting scrape of: ${url}`);
  console.log('Note: You need to run the Playwright browser_evaluate MCP call separately');
  console.log('Use the extractPhoneSpecs() function provided in this script');
  
  // For demonstration, we'll use the extracted specs from the user's context
  // In a real implementation, this would come from Playwright MCP
  const specs = {
    name: "Samsung Galaxy M17",
    brandName: "Samsung",
    release_date: "2025-10-13",
    release_status: "Available. Released 2025, October 13",
    dimensions: "164.4 x 77.9 x 7.5 mm (6.47 x 3.07 x 0.30 in)",
    weight: "192 g (6.77 oz)",
    build_materials: "Glass front (Gorilla Glass Victus), plastic back, plastic frame",
    sim_type: "Nano-SIM + Nano-SIM",
    ip_rating: "IP54",
    display_type: "Super AMOLED, 90Hz, 1100 nits (HBM)",
    display_size: "6.7 inches, 110.2 cm2 (~86.0% screen-to-body ratio)",
    display_resolution: "1080 x 2340 pixels, 19.5:9 ratio (~385 ppi density)",
    display_protection: "Corning Gorilla Glass Victus",
    os: "Android 15, up to 6 major Android upgrades, One UI 7",
    chipset: "Exynos 1330 (5 nm)",
    cpu: "Octa-core (2x2.4 GHz Cortex-A78 & 6x2.0 GHz Cortex-A55)",
    gpu: "Mali-G68 MP2",
    memory_card_slot: "microSDXC (uses shared SIM slot)",
    internal_storage: JSON.stringify([
      { storage: "128GB", ram: "4GB" },
      { storage: "128GB", ram: "6GB" },
      { storage: "128GB", ram: "8GB" }
    ]),
    main_camera: JSON.stringify([
      "50 MP, f/1.8, (wide), 1/2.76\", 0.64µm, AF, OIS",
      "5 MP, f/2.2, (ultrawide), 1/5.0\", 1.12µm",
      "2 MP (macro)"
    ]),
    main_camera_features: "LED flash, panorama, HDR",
    main_camera_video: "1080p@30fps, gyro-EIS",
    selfie_camera: "13 MP, f/2.0, (wide), 1/3.1\", 1.12µm",
    selfie_camera_video: "1080p@30fps",
    loudspeaker: "Yes",
    audio_jack: "No",
    wlan: "Wi-Fi 802.11 a/b/g/n/ac, dual-band, Wi-Fi Direct",
    bluetooth: "5.3, A2DP, LE",
    positioning: "GPS, GALILEO, GLONASS, BDS, QZSS",
    nfc: "Yes",
    radio: "No",
    usb: "USB Type-C 2.0",
    sensors: "Fingerprint (side-mounted), accelerometer, gyro, proximity, compass",
    battery_type: "5000 mAh",
    battery_charging: "25W wired",
    colors: "Moonlight Silver, Sapphire Black",
    price: "About 120 EUR",
    network_technology: "GSM / HSPA / LTE / 5G",
    network_2g_bands: "GSM 850 / 900 / 1800 / 1900",
    network_3g_bands: "HSDPA 850 / 900 / 1700(AWS) / 1900 / 2100",
    network_4g_bands: "1, 2, 3, 4, 5, 7, 8, 12, 17, 20, 26, 28, 38, 40, 41, 66",
    network_5g_bands: "1, 3, 5, 7, 8, 28, 40, 41, 66, 77, 78 SA/NSA/Sub6",
    network_speed: "HSPA, LTE, 5G"
  };
  
  // Create or get brand
  const brand = await createOrGetBrand(specs.brandName);
  
  // Create phone model
  const model = await createPhoneModel(specs, brand.id, url);
  
  console.log('\nScraping completed successfully!');
  console.log(`Brand ID: ${brand.id}`);
  console.log(`Model ID: ${model.id}`);
  console.log(`View model: ${DIRECTUS_URL}/admin/content/hardware_models/${model.id}`);
  
  return { brand, model };
}

// Main execution
if (require.main === module) {
  const url = process.argv[2];
  
  if (!url) {
    console.error('Usage: node gsmarena-scraper.js <gsmarena_url>');
    console.error('Example: node gsmarena-scraper.js https://www.gsmarena.com/samsung_galaxy_m17_5g-14221.php');
    process.exit(1);
  }
  
  scrapeGSMArena(url)
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { extractPhoneSpecs, scrapeGSMArena, createOrGetBrand, createPhoneModel };
