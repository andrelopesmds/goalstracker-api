const getEnvVariable = (key: string): string => {
  return process.env[key] ?? '';
};

export const EVENTS_TABLE = getEnvVariable('EVENTS_TABLE');
export const SUBSCRIPTIONS_TABLE = getEnvVariable('SUBSCRIPTIONS_TABLE');
export const TEAMS_TABLE = getEnvVariable('TEAMS_TABLE');

export const NOTIFICATIONS_TOPIC_ARN = getEnvVariable('NOTIFICATIONS_TOPIC_ARN');

export const ORIGIN = getEnvVariable('ORIGIN');

export const WEB_PUSH_PUBLIC_KEY = getEnvVariable('WEB_PUSH_PUBLIC_KEY');
export const WEB_PUSH_PRIVATE_KEY = getEnvVariable('WEB_PUSH_PRIVATE_KEY');

export const SPORTS_LIVE_SCORES_API_KEY = getEnvVariable('SPORTS_LIVE_SCORES_API_KEY');
