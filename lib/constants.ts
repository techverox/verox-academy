/**
 * Application Constants
 * =====================
 * Centralized constants used across the application.
 * 
 * APP_URL: The base URL of the application.
 * Defaults to localhost in development and uses NEXT_PUBLIC_APP_URL in production.
 */

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// For server-side usage if needed (e.g. absolute URLs in emails)
export const SERVER_APP_URL = process.env.APP_URL || APP_URL;
