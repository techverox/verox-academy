import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Initialize inside the handler to avoid build-time errors if env vars are missing
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder",
  });

  try {
    const { amount, currency = "INR", receipt } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1)" },
        { status: 400 }
      );
    }

    const options = {
      amount: amount,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order", details: error.message },
      { status: 500 }
    );
  }
}
