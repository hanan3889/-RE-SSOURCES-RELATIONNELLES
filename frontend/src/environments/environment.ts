export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  
  
  // Sécurité
  encryptionKey: 'dev_encryption_key_32_chars_minimum_required',
  jwtTokenName: 'rr_access_token',
  refreshTokenName: 'rr_refresh_token',
  
  // Stockage
  storagePrefix: 'rr_dev_',
  sessionTimeout: 3600000, 
  
  // Pagination
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  
  // Upload
  maxFileSize: 10485760, 
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  
  // Features flags
  features: {
    messaging: true,
    notifications: true,
    analytics: true,
    darkMode: true,
  },
  
  // Logging
  enableConsoleLogging: true,
  logLevel: 'debug' 
};
