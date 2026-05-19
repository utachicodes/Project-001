export const STORAGE_KEYS = {
  CONFIG: 'mafalia_config',
  CHAT_HISTORY: 'mafalia_chat_history',
} as const;

export const STORAGE_BUCKETS = {
  UPLOADS: 'mafalia-uploads',
} as const;

export const LIMITS = {
  CHAT_TITLE_LENGTH: 40,
  CHAT_HISTORY_SIDEBAR: 5,
  QUICK_ACTIONS: 4,
  CONTENT_PREVIEW: 300,
  ROWS_PREVIEW: 10,
  FIELD_VALUE: 80,
  ALERTS: 3,
} as const;

export const DURATIONS = {
  SIGNED_URL_SECONDS: 60 * 60 * 24 * 7,
} as const;

export const DEFAULT_LANGUAGE = 'en' as const;

export const VIDEO_URL = 'https://d3ci6z5bi3h49s.cloudfront.net/mafalia-intro.mp4';
