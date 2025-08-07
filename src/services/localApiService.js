// Local API service for Thailand Packing List
// Communicates with Express.js backend for file-based persistence

class LocalApiService {
  constructor() {
    this.isInitialized = false;
    this.baseUrl = window.location.origin; // Use same origin as frontend
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      console.log('Initializing Local API service...');
      
      // Test connection to backend
      const response = await fetch(`${this.baseUrl}/api/health`);
      
      if (!response.ok) {
        throw new Error(`Backend not available: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error('Backend health check failed');
      }
      
      this.isInitialized = true;
      console.log('Local API service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Local API service:', error);
      return false;
    }
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
   * Save family data to local backend
   */
  async saveFamilyData(familyData) {
    // Always save to localStorage first as backup
    this.saveToLocalStorage(familyData);

    if (!this.isInitialized) {
      console.warn('Service not initialized - data saved locally only');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/family-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(familyData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Save failed');
      }

      console.log('Data saved to local backend successfully');
      return true;
    } catch (error) {
      console.log('Local backend save failed (using localStorage backup):', error.message);
      return false;
    }
  }

  /**
   * Load family data from local backend with localStorage fallback
   */
  async loadFamilyData() {
    // Try local backend first if initialized
    if (this.isInitialized) {
      try {
        const response = await fetch(`${this.baseUrl}/api/family-data`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            console.log('Data loaded from local backend successfully');
            // Also update localStorage with the latest data
            this.saveToLocalStorage(result.data);
            return result.data;
          }
        }
      } catch (error) {
        console.log('Local backend load failed, trying localStorage:', error.message);
      }
    }

    // Fallback to localStorage
    const localData = this.loadFromLocalStorage();
    if (localData) {
      return localData;
    }

    console.log('No data found in local backend or localStorage');
    return null;
  }

  /**
   * Check if the service is connected
   */
  isConnected() {
    return this.isInitialized;
  }
}

// Create and export a singleton instance
const localApiService = new LocalApiService();
export default localApiService;