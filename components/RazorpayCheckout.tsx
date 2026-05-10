"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/Button";

interface RazorpayCheckoutProps {
  amount: number; // in paise
  courseId?: string;
  courseName?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  courseId,
  courseName = "Verox Academy Course",
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on the server
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
          receipt: courseId ? `receipt_${courseId}` : undefined,
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Verox Academy",
        description: `Purchase for ${courseName}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify payment on the server
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              if (onSuccess) onSuccess(verifyData);
              alert("Payment Successful! Your course access is being activated.");
            } else {
              throw new Error(verifyData.error || "Verification failed");
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            if (onError) onError(err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#7c3aed", // Premium purple
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            console.log("Checkout modal closed");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        alert("Payment failed: " + response.error.description);
        if (onError) onError(response.error);
        setLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "An error occurred during payment setup");
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full md:w-auto"
      >
        {loading ? "Processing..." : "Enroll Now"}
      </Button>
    </>
  );
};

export default RazorpayCheckout;
