import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { EmailLog } from "@/types/firestore";
import { serverEnv } from "@/lib/env";
import React from "react";

const resend = new Resend(serverEnv.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: string; // Template name for logging
  react: React.ReactElement;
  recipientId?: string;
  metadata?: any;
}

export class EmailService {
  /**
   * Logs email attempt to Firestore for auditing and retries.
   */
  private static async logEmail(log: Omit<EmailLog, "id" | "sentAt" | "lastAttemptAt">) {
    try {
      const db = getAdminDb();
      const logRef = db.collection("emailLogs").doc();
      const timestamp = FieldValue.serverTimestamp();
      
      const emailLog: any = {
        ...log,
        id: logRef.id,
        sentAt: timestamp,
        lastAttemptAt: timestamp,
      };

      // Firestore does not accept undefined values
      Object.keys(emailLog).forEach(key => {
        if (emailLog[key] === undefined) {
          delete emailLog[key];
        }
      });

      await logRef.set(emailLog);
      return logRef.id;
    } catch (error) {
      console.error("[EMAIL_SERVICE] Failed to log email:", error);
      return null;
    }
  }

  /**
   * Sends an email using Resend with built-in retry logic and logging.
   */
  static async sendEmail(options: SendEmailOptions) {
    const { to, subject, react, template, recipientId, metadata } = options;
    
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = "";

    // Use default 'from' if not provided or configured
    const from = "Verox Academy <onboarding@resend.dev>"; // Default Resend domain for testing

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const { data, error } = await resend.emails.send({
          from,
          to,
          subject,
          react,
        });

        if (error) {
          throw new Error(error.message);
        }

        // Log success
        await this.logEmail({
          recipientEmail: Array.isArray(to) ? to.join(", ") : to,
          recipientId,
          template,
          status: "sent",
          resendId: data?.id,
          attempts,
          metadata,
        });

        return { success: true, id: data?.id };
      } catch (err: any) {
        lastError = err.message || "Unknown error";
        console.warn(`[EMAIL_SERVICE] Attempt ${attempts} failed for ${template}:`, lastError);
        
        // Stop retries for hard errors (auth, validation, free tier limits)
        const isHardError = 
          lastError.includes("testing emails") || 
          lastError.includes("API key") || 
          lastError.includes("valid domain");

        if (attempts >= maxAttempts || isHardError) {
          // Log final failure
          await this.logEmail({
            recipientEmail: Array.isArray(to) ? to.join(", ") : to,
            recipientId,
            template,
            status: "failed",
            error: lastError,
            attempts,
            metadata,
          });
          return { success: false, error: lastError };
        }
        
        // Wait before retry (exponential backoff: 2s, 4s...)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }

    return { success: false, error: lastError };
  }
}
