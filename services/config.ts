
/**
 * APPLICATION CONFIGURATION
 * 
 * Central control for Environment switching (Local Sandbox vs. Cloud Run Production).
 * In a real deployment, these values would be injected via Docker Environment Variables.
 */

export const APP_CONFIG = {
  // 'SANDBOX': Uses LocalStorage and Client-Side Logic
  // 'PRODUCTION': Connects to Cloud Run Backend / Google Cloud SQL
  environment: (process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX') as 'SANDBOX' | 'PRODUCTION',
  
  // Future Cloud Run Endpoint
  apiBaseUrl: process.env.REACT_APP_API_URL || 'https://api.bluebanana-gate.internal',
  
  // Google Cloud Project Context
  gcp: {
    projectId: 'bluebanana-enterprise-v1',
    region: 'europe-west3',
    storageBucket: 'bb-secure-artifacts'
  },

  // Feature Flags
  features: {
    useRealAi: true, // Calls Gemini API directly (Sandbox only)
    enableDarkWebScan: false,
    enforceRbac: true
  }
};

export const isProduction = APP_CONFIG.environment === 'PRODUCTION';
