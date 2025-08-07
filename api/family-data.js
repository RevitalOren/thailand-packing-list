// Vercel serverless function for family data API
const fs = require('fs').promises;
const path = require('path');

// Use /tmp directory for Vercel serverless functions
const DATA_FILE = '/tmp/packing-list.json';

// Ensure data directory exists
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // File doesn't exist, that's OK for first run
  }
}

// Load family data
async function loadFamilyData() {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const familyData = JSON.parse(data);
    console.log('Family data loaded from serverless storage');
    return { success: true, data: familyData };
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No saved data found, returning null');
      return { success: true, data: null };
    } else {
      console.error('Error loading family data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Save family data
async function saveFamilyData(familyData) {
  try {
    if (!familyData) {
      return { success: false, error: 'No data provided' };
    }

    // Create backup of existing data
    try {
      const existingData = await fs.readFile(DATA_FILE, 'utf8');
      const backupFile = DATA_FILE.replace('.json', `.backup.${Date.now()}.json`);
      await fs.writeFile(backupFile, existingData, 'utf8');
      console.log('Backup created:', backupFile);
    } catch (error) {
      // Ignore backup errors (file might not exist)
    }
    
    // Save new data
    const dataToSave = {
      ...familyData,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    console.log('Family data saved to serverless storage');
    
    return { success: true, message: 'Data saved successfully' };
  } catch (error) {
    console.error('Error saving family data:', error);
    return { success: false, error: error.message };
  }
}

// Vercel serverless function handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const result = await loadFamilyData();
      res.status(result.success ? 200 : 500).json(result);
    } else if (req.method === 'POST') {
      const result = await saveFamilyData(req.body);
      res.status(result.success ? 200 : 500).json(result);
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}