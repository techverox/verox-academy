/**
 * RazorpayCheckout Component — Secure Payment Flow
 * ==================================================
 * Client-side component that orchestrates the Razorpay payment flow.
 *
 * FLOW:
 * 1. User clicks "Enroll Now"
 * 2. Component sends authenticated request to /api/razorpay/create-order
 * 3. Server validates course, creates Razorpay order, stores payment record
 * 4. Razorpay Checkout modal opens
 * 5. On success: Sends verification to /api/razorpay/verify
 * 6. On failure: Shows error state
 * 7. Webhook (async) creates enrollment if verify hasn't already
 *
 * SECURITY:
 * - Uses Firebase Auth token for API authentication
 * - Price comes from server, not client (prevents manipulation)
 * - Enrollment happens server-side only
 */

"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface RazorpayCheckoutProps {
  courseId: string;
  courseName: string;
  price: number; // Display price in rupees (for UI only)
  autoOpen?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Razorpay types
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    description: string;
  };
}

type PaymentState = "idle" | "creating_order" | "checkout_open" | "verifying" | "success" | "error";

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  courseId,
  courseName,
  price,
  autoOpen = false,
  onSuccess,
  onError,
}) => {
  const [state, setState] = useState<PaymentState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();

  // ─── Auto-Trigger Logic ─────────────────────────────────────────────
  React.useEffect(() => {
    if (autoOpen && user && state === "idle") {
      handlePayment();
    }
  }, [autoOpen, user]);

  /**
   * Get the current user's Firebase ID token for API authentication.
   */
  const getAuthToken = async (): Promise<string> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be logged in to make a purchase");
    }
    return currentUser.getIdToken();
  };

  const handlePayment = async () => {
    // ─── Pre-checks ────────────────────────────────────────────────────
    if (!user) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search + "&autoEnroll=true");
      router.push(`/login/?redirect=${currentUrl}`);
      return;
    }

    setErrorMessage("");
    setState("creating_order");

    try {
      const token = await getAuthToken();

      // ─── 1. Create Order (Server-Side) ───────────────────────────────
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        // Log the detailed error from the server
        console.error("[PAYMENT] Order creation failed:", orderData.message || orderData.error);
        throw new Error(orderData.message || orderData.error || "Failed to create order");
      }

      setState("checkout_open");

      // ─── 2. Open Razorpay Checkout ───────────────────────────────────
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        throw new Error("Razorpay Key ID is not configured. Please check your environment variables.");
      }

      console.log(`[PAYMENT] Initializing Razorpay with key: ${razorpayKey.slice(0, 8)}...`);

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Verox Academy",
        description: `Enrollment: ${courseName}`,
        order_id: orderData.id,
        handler: async function (response: RazorpayResponse) {
          setState("verifying");

          try {
            const freshToken = await getAuthToken();

            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${freshToken}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              setState("success");
              if (onSuccess) onSuccess();

              setTimeout(() => {
                router.push(`/learn/viewer/?id=${courseId}`);
              }, 1500);
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Verification failed";
            console.error("[PAYMENT] Verification error:", msg);
            setErrorMessage(
              "Payment was successful but verification failed. " +
                "Your access will be activated shortly. Please contact support if needed."
            );
            setState("error");
            if (onError) onError(msg);
          }
        },
        prefill: {
          name: user?.displayName || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            // Only reset to idle if we aren't in a success or verifying state
            setState((prev) => (prev === "checkout_open" ? "idle" : prev));
          },
        },
      };

      // Ensure Razorpay is available on window
      const RzpConstructor = (window as any).Razorpay;
      if (!RzpConstructor) {
        throw new Error("Razorpay SDK failed to load. Please check your connection.");
      }

      const rzp = new RzpConstructor(options);

      rzp.on("payment.failed", function (response: any) {
        const errorDesc = response.error?.description || "Payment failed or cancelled";
        setErrorMessage(errorDesc);
        setState("error");
        if (onError) onError(errorDesc);
      });

      rzp.open();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Payment setup failed";
      console.error("[PAYMENT] Error:", msg);
      setErrorMessage(msg);
      setState("error");
      if (onError) onError(msg);
    }
  };

  // ─── Button State Management ───────────────────────────────────────────
  const getButtonText = (): string => {
    switch (state) {
      case "creating_order":
        return "Preparing Checkout...";
      case "checkout_open":
        return "Complete Payment...";
      case "verifying":
        return "Verifying Payment...";
      case "success":
        return "✓ Enrollment Complete!";
      case "error":
        return "Try Again";
      default:
        return `Enroll Now — ₹${price}`;
    }
  };

  const isDisabled = ["creating_order", "checkout_open", "verifying", "success"].includes(state);

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="space-y-3">
        <Button
          onClick={state === "error" ? handlePayment : handlePayment}
          disabled={isDisabled}
          size="lg"
          className={`w-full ${state === "success" ? "bg-success hover:bg-success" : ""}`}
        >
          {getButtonText()}
        </Button>

        {/* Error Message */}
        {state === "error" && errorMessage && (
          <div className="rounded-xl bg-danger/10 border border-danger/20 p-4">
            <p className="text-sm font-medium text-danger">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {state === "success" && (
          <div className="rounded-xl bg-success/10 border border-success/20 p-4">
            <p className="text-sm font-medium text-success">
              Payment verified! Redirecting to your course...
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default RazorpayCheckout;
