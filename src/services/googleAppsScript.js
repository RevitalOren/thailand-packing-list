// Google Apps Script integration for packing list data persistence
// Uses deployed Google Apps Script web app to handle authentication

class GoogleAppsScriptService {
  constructor() {
    this.isInitialized = false;
    this.webAppUrl = null;
  }

  /**
   * Initialize with Google Apps Script web app URL
   */
  async initialize(webAppUrl) {
    try {
      this.webAppUrl = webAppUrl;
      
      console.log('Initializing Google Apps Script service...');
      
      // Test connection by trying to read data
      await this.testConnection();
      
      this.isInitialized = true;
      console.log('Google Apps Script service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Apps Script service:', error);
      return false;
    }
  }

  /**
   * Test connection by fetching data (using simple GET to avoid CORS preflight)
   */
  async testConnection() {
    const response = await fetch(this.webAppUrl + '?test=1');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Connection test failed');
    }
    
    console.log('Connection test successful');
    return true;
  }

  /**
   * Save to localStorage as backup
   */
  saveToLocalStorage(familyData) {
    try {
      localStorage.setItem('packingListData', JSON.stringify(familyData));
      console.log('Data saved to localStorage as backup');
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  /**
   * Load from localStorage
   */
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('packingListData');
      if (data) {
        console.log('Data loaded from localStorage');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Save family data using Google Apps Script
   */
  async saveFamilyData(familyData) {
    // Always save to localStorage first
    this.saveToLocalStorage(familyData);

    if (!this.isInitialized) {
      console.warn('Service not initialized - data saved locally only');
      return false;
    }

    try {
      // Use URL parameters to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('familyData', JSON.stringify(familyData));
      
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Save failed');
      }

      console.log('Data saved to Google Sheets successfully via Apps Script');
      return true;
    } catch (error) {
      console.log('Google Sheets save failed (using localStorage backup):', error.message);
      return false;
    }
  }

  /**
   * Load family data from Google Apps Script with localStorage fallback
   */
  async loadFamilyData() {
    // Try Google Apps Script first if initialized
    if (this.isInitialized) {
      try {
        const response = await fetch(this.webAppUrl);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            console.log('Data loaded from Google Sheets via Apps Script successfully');
            return result.data;
          }
        }
      } catch (error) {
        console.log('Google Apps Script load failed, trying localStorage:', error.message);
      }
    }

    // Fallback to localStorage
    const localData = this.loadFromLocalStorage();
    if (localData) {
      return localData;
    }

    console.log('No data found in Google Sheets or localStorage');
    return null;
  }
}

// Create and export a singleton instance
const googleAppsScriptService = new GoogleAppsScriptService();
export default googleAppsScriptService;