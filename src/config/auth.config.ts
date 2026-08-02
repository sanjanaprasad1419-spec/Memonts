/**
 * Centralized Authentication & Authorization Configuration
 */

export const AUTH_CONFIG = {
  /**
   * Configured Admin Email address authorized to access the Admin Dashboard.
   * Reads from environment variable VITE_ADMIN_EMAIL with a default fallback.
   */
  ALLOWED_ADMIN_EMAIL: (
    import.meta.env.VITE_ADMIN_EMAIL || 'sanjanaprasad1419@gmail.com'
  ).trim().toLowerCase(),

  /**
   * Configured Viewer (Shubham) Email address authorized for Birthday Dashboard.
   * Reads from environment variable VITE_VIEWER_EMAIL with a default fallback.
   */
  ALLOWED_VIEWER_EMAIL: (
    import.meta.env.VITE_VIEWER_EMAIL || 'shubm1906@gmail.com'
  ).trim().toLowerCase(),

  /**
   * Username to Email mapping for Viewer authentication
   */
  VIEWER_USERNAME_MAPPING: {
    shuxbm: (import.meta.env.VITE_VIEWER_EMAIL || 'shubm1906@gmail.com').trim().toLowerCase(),
  } as Record<string, string>,
} as const;

/**
 * Resolves input string (e.g. username 'Shuxbm' or email address) to full Email address
 */
export const getResolvedEmailForInput = (input: string): string => {
  const normalized = input.trim().toLowerCase();
  if (AUTH_CONFIG.VIEWER_USERNAME_MAPPING[normalized]) {
    return AUTH_CONFIG.VIEWER_USERNAME_MAPPING[normalized];
  }
  return input.trim();
};

/**
 * Validates if the provided email matches the authorized Admin email address.
 */
export const isAuthorizedAdminEmail = (email: string | undefined | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTH_CONFIG.ALLOWED_ADMIN_EMAIL;
};

/**
 * Validates if the provided email matches the authorized Viewer (Shubham) email address.
 */
export const isAuthorizedViewerEmail = (email: string | undefined | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTH_CONFIG.ALLOWED_VIEWER_EMAIL;
};
