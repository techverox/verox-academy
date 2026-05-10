import {
  Heading,
  Section,
  Text,
  Img,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout, Button } from "./components/BaseLayout";
import { APP_URL } from "../lib/constants";

interface CertificateUnlockedEmailProps {
  userName: string;
  courseTitle: string;
  certificateUrl: string;
}

export const CertificateUnlockedEmail = ({
  userName,
  courseTitle,
  certificateUrl,
}: CertificateUnlockedEmailProps) => (
  <BaseLayout previewText={`Congratulations! Your certificate for ${courseTitle} is ready.`}>
    <Heading className="text-[#1e293b] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
      Achievement Unlocked! 🏆
    </Heading>
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      Incredible work, {userName}! You've successfully completed <strong>{courseTitle}</strong>. Your hard work and dedication have paid off.
    </Text>
    
    <Section className="my-[32px] text-center">
        <Img
            src={`${APP_URL}/cert-badge.png`} // Placeholder badge
            width="120"
            height="120"
            alt="Verox Certified"
            className="mx-auto"
        />
    </Section>

    <Text className="text-[#334155] text-[16px] leading-[26px] text-center">
      Your official Certificate of Completion is now available. You can view, download, or share it directly to your LinkedIn profile.
    </Text>
    
    <Button href={certificateUrl}>
      View Certificate
    </Button>
    
    <Text className="text-[#64748b] text-[14px] leading-[24px] text-center italic">
      Don't stop now! Keep the momentum going by exploring more advanced courses in your field.
    </Text>
  </BaseLayout>
);

export default CertificateUnlockedEmail;
