// PostHog is retired. Keep legacy instrumentation inert; current publishing
// events use publishing-analytics.ts and Replit supplies automatic pageviews.
export const trackEvent = (
  _action: string,
  _category?: string,
  _label?: string,
  _value?: number,
) => {};

export const optOutTracking = () => {
  localStorage.setItem('analytics_opt_out', 'true');
  localStorage.setItem('umami.disabled', '1');
};

export const optInTracking = () => {
  localStorage.removeItem('analytics_opt_out');
  localStorage.removeItem('umami.disabled');
};

export const isOptedOut = (): boolean => {
  return localStorage.getItem('analytics_opt_out') === 'true'
    || localStorage.getItem('umami.disabled') === '1';
};
