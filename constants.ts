
export const API_BASE_URL = 'https://api.rocketqueue.app/v1';

export const SERVICE_FLAGS = {
  USE_MOCK_AUTH: true,
  USE_MOCK_SHOPS: true,
  USE_MOCK_ANALYTICS: true,
  USE_MOCK_SEARCH: true,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
  },
  SHOPS: {
    LIST: '/shops',
    SEARCH: '/shops/search',
  },
  BOOKINGS: {
    LIST: '/bookings',
    JOIN: '/bookings/join',
    LEAVE: '/bookings/leave',
  },
  ANALYTICS: {
    VENDOR: '/analytics/vendor',
    CUSTOMER: '/analytics/customer',
  }
};
