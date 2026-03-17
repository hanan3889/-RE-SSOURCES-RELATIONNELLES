export const environment = {
  production: true,
  apiUrl: '/api',

  // Sécurité
  encryptionKey: '',
  jwtTokenName: 'rr_access_token',
  refreshTokenName: 'rr_refresh_token',

  // Stockage
  storagePrefix: 'rr_',
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
  enableConsoleLogging: false,
  logLevel: 'error'
};
