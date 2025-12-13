export const API_BASE_URL = 'https://hiring-dev.internal.kloudspot.com/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  ANALYTICS: {
    OCCUPANCY: '/analytics/occupancy',
    FOOTFALL: '/analytics/footfall',
    DWELL: '/analytics/dwell',
    DEMOGRAPHICS: '/analytics/demographics',
    ENTRY_EXIT: '/analytics/entry-exit',
  },
  ALL:{
    GETALL : '/sites'
  }
};

export const SOCKET_URL = 'https://hiring-dev.internal.kloudspot.com'; // Update with actual socket URL

export const SOCKET_EVENTS = {
  ALERT: 'alert',
  LIVE_OCCUPANCY: 'live_occupancy',
};

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  ENTRIES: '/entries',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};