import { getAdminDb } from "./firebase-admin";
import { Coupon } from "@/types/firestore";

export interface ValidationResult {
  isValid: boolean;
  discountAmount: number; // in paise
  error?: string;
  coupon?: Coupon;
}

/**
 * Validates a coupon code and calculates the discount.
 * 
 * @param code - The coupon code to validate
 * @param courseId - The ID of the course being purchased
 * @param amount - The current price in paise
 * @param creatorId - The creator ID of the course
 */
export async function validateCoupon(
  code: string,
  courseId: string,
  amount: number,
  creatorId: string
): Promise<ValidationResult> {
  const db = getAdminDb();
  const couponRef = db.collection("coupons").doc(code.toUpperCase());
  const couponSnap = await couponRef.get();

  if (!couponSnap.exists) {
    return { isValid: false, discountAmount: 0, error: "Invalid coupon code" };
  }

  const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon;

  // 1. Check if active
  if (!coupon.isActive) {
    return { isValid: false, discountAmount: 0, error: "Coupon is no longer active" };
  }

  // 2. Check Expiry
  if (coupon.expiryDate) {
    const expiry = (coupon.expiryDate as any).toDate ? (coupon.expiryDate as any).toDate() : new Date((coupon.expiryDate as any).seconds * 1000);
    if (expiry < new Date()) {
      return { isValid: false, discountAmount: 0, error: "Coupon has expired" };
    }
  }

  // 3. Check Usage Limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { isValid: false, discountAmount: 0, error: "Coupon usage limit reached" };
  }

  // 4. Check Creator/Course Restriction
  if (coupon.creatorId && coupon.creatorId !== creatorId) {
    return { isValid: false, discountAmount: 0, error: "This coupon is not valid for this creator's courses" };
  }

  if (coupon.courseId && coupon.courseId !== courseId) {
    return { isValid: false, discountAmount: 0, error: "This coupon is not valid for this course" };
  }

  // 5. Check Min Order Amount
  if (coupon.minOrderAmount && amount < coupon.minOrderAmount) {
    return { isValid: false, discountAmount: 0, error: `Minimum order of ₹${coupon.minOrderAmount / 100} required` };
  }

  // 6. Calculate Discount
  let discountAmount = 0;
  if (coupon.type === "percentage") {
    discountAmount = Math.round((amount * coupon.value) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.value;
  }

  // Ensure discount doesn't exceed amount
  discountAmount = Math.min(discountAmount, amount);

  return {
    isValid: true,
    discountAmount,
    coupon,
  };
}
