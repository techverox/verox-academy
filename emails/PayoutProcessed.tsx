import {
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout, Button } from "./components/BaseLayout";
import { APP_URL } from "../lib/constants";

interface PayoutProcessedEmailProps {
  userName: string;
  amount: number; // in paise
  payoutId: string;
}

export const PayoutProcessedEmail = ({
  userName,
  amount,
  payoutId,
}: PayoutProcessedEmailProps) => {
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100);

  return (
    <BaseLayout previewText={`Payout Processed: ${formattedAmount}`}>
      <Heading className="text-[#1e293b] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
        Funds are on the way! 💸
      </Heading>
      <Text className="text-[#334155] text-[16px] leading-[26px]">
        Hi {userName}, your payout request <strong>#{payoutId.slice(-6).toUpperCase()}</strong> has been processed successfully.
      </Text>
      
      <Section className="bg-emerald-50 p-8 rounded-xl border border-emerald-100 my-8 text-center">
          <Text className="text-[#065f46] text-[14px] leading-[24px] m-0 uppercase font-bold tracking-wider">
              Payout Amount
          </Text>
          <Heading className="text-[#047857] text-[36px] font-extrabold m-0 mt-2">
              {formattedAmount}
          </Heading>
          <Text className="text-[#065f46] text-[14px] mt-4 mb-0 opacity-75">
              Transferred to your linked bank account
          </Text>
      </Section>

      <Text className="text-[#334155] text-[16px] leading-[26px]">
        The funds should appear in your account within 3-5 business days, depending on your bank's processing times.
      </Text>
      
      <Button href={`${APP_URL}/creator/payouts`}>
        View Payout History
      </Button>
      
      <Text className="text-[#64748b] text-[14px] leading-[24px]">
        Thank you for being a vital part of Verox Academy. Keep up the great work!
      </Text>
    </BaseLayout>
  );
};

export default PayoutProcessedEmail;
