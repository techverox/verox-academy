import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit, 
  setDoc, 
  serverTimestamp,
  increment,
  runTransaction
} from "firebase/firestore";
import { db } from "./firebase";
import { Referral, ReferralLog } from "@/types/firestore";

/**
 * Generates a unique referral code for a user.
 */
export const getOrCreateReferralCode = async (userId: string): Promise<string> => {
  const referralsRef = collection(db, "referrals");
  const q = query(referralsRef, where("userId", "==", userId), limit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }

  // Generate new code: VER-XXXXX
  const newCode = `VER-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const referralRef = doc(db, "referrals", newCode);
  
  await setDoc(referralRef, {
    id: newCode,
    userId,
    totalClicks: 0,
    totalSignups: 0,
    totalConversions: 0,
    totalEarnings: 0,
    createdAt: serverTimestamp(),
  });

  return newCode;
};

/**
 * Logs a click on a referral link.
 */
export const logReferralClick = async (code: string) => {
  const referralRef = doc(db, "referrals", code.toUpperCase());
  await setDoc(referralRef, { totalClicks: increment(1) }, { merge: true });
};

/**
 * Records a signup from a referral.
 */
export const recordReferralSignup = async (code: string, referredUserId: string) => {
  const referralRef = doc(db, "referrals", code.toUpperCase());
  const referralSnap = await getDoc(referralRef);

  if (!referralSnap.exists()) return;

  const referrerId = referralSnap.data().userId;
  const logRef = doc(collection(db, "referralLogs"));

  await runTransaction(db, async (transaction) => {
    transaction.update(referralRef, { totalSignups: increment(1) });
    transaction.set(logRef, {
      id: logRef.id,
      referralCode: code,
      referrerId,
      referredUserId,
      type: "signup",
      timestamp: serverTimestamp(),
    });
  });
};
