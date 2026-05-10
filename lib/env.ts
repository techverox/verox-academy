/**
 * Environment Variable Validation
 * ================================
 * Runtime validation of required environment variables.
 * Fails fast at startup if critical vars are missing.
 *
 * SECURITY: Server-only variables (no NEXT_PUBLIC_ prefix)
 * are never exposed to the client bundle.
 */

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[ENV] Missing required environment variable: ${key}. ` +
      `Please add it to your .env.local file.`
    );
  }
  return value;
}

function getOptionalEnv(key: string, fallback: string = ""): string {
  return process.env[key] || fallback;
}

// ─── Server-Only Environment Variables ──────────────────────────────────────
// These are only accessible in API routes and server components.

export const serverEnv = {
  get RAZORPAY_KEY_ID() {
    return getRequiredEnv("RAZORPAY_KEY_ID");
  },
  get RAZORPAY_KEY_SECRET() {
    return getRequiredEnv("RAZORPAY_KEY_SECRET");
  },
  get RAZORPAY_WEBHOOK_SECRET() {
    return getOptionalEnv("RAZORPAY_WEBHOOK_SECRET", "");
  },
  get FIREBASE_PROJECT_ID() {
    return getRequiredEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  },
  get FIREBASE_CLIENT_EMAIL() {
    return getOptionalEnv("FIREBASE_CLIENT_EMAIL");
  },
  get FIREBASE_PRIVATE_KEY() {
    return getOptionalEnv("FIREBASE_PRIVATE_KEY");
  },
  get RESEND_API_KEY() {
    return getOptionalEnv("RESEND_API_KEY", "re_123");
  },
} as const;

// ─── Client-Safe Environment Variables ──────────────────────────────────────
// These use NEXT_PUBLIC_ prefix and are safe to embed in client bundles.

export const clientEnv = {
  RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
} as const;
