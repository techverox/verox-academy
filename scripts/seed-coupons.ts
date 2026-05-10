import { getAdminDb } from "../lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function seedCoupons() {
  const db = getAdminDb();
  const coupons = [
    {
      id: "LAUNCH2026",
      type: "percentage",
      value: 20, // 20% off
      usageLimit: 100,
      usageCount: 0,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    },
    {
      id: "VEROX50",
      type: "flat",
      value: 5000, // ₹50 off (5000 paise)
      minOrderAmount: 10000, // Min order ₹100
      usageLimit: 50,
      usageCount: 0,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    },
    {
      id: "FREEPASS",
      type: "percentage",
      value: 100, // 100% off
      usageLimit: 10,
      usageCount: 0,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    }
  ];

  for (const coupon of coupons) {
    await db.collection("coupons").doc(coupon.id).set(coupon);
    console.log(`Created coupon: ${coupon.id}`);
  }
}

seedCoupons().then(() => process.exit(0)).catch(console.error);
