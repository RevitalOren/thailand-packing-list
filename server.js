const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'packing-list.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve built React app

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load family data
app.get('/api/family-data', async (req, res) => {
  try {
    await ensureDataDirectory();
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const familyData = JSON.parse(data);
      console.log('Family data loaded from file');
      res.json({ success: true, data: familyData });
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return null
        console.log('No saved data found, returning null');
        res.json({ success: true, data: null });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error loading family data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save family data
app.post('/api/family-data', async (req, res) => {
  try {
    const familyData = req.body;
    
    if (!familyData) {
      return res.status(400).json({ success: false, error: 'No data provided' });
    }

    await ensureDataDirectory();
    
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
    console.log('Family data saved to file');
    
    res.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving family data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Thailand Packing List server running on port ${PORT}`);
  console.log(`Data will be stored in: ${DATA_FILE}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});