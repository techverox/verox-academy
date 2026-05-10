import {
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout, Button } from "./components/BaseLayout";

interface AdminAlertEmailProps {
  title: string;
  description: string;
  details: Record<string, string>;
  actionLabel: string;
  actionUrl: string;
}

export const AdminAlertEmail = ({
  title,
  description,
  details,
  actionLabel,
  actionUrl,
}: AdminAlertEmailProps) => (
  <BaseLayout previewText={`Admin Alert: ${title}`}>
    <Heading className="text-[#1e293b] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
      Admin Notification
    </Heading>
    <Section className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <Text className="text-[#991b1b] text-[16px] font-bold m-0">
            {title}
        </Text>
    </Section>
    
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      {description}
    </Text>
    
    <Section className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-6">
        {Object.entries(details).map(([key, value]) => (
            <Text key={key} className="text-[#334155] text-[14px] m-0 mb-2">
                <strong>{key}:</strong> {value}
            </Text>
        ))}
    </Section>
    
    <Button href={actionUrl}>
      {actionLabel}
    </Button>
    
    <Text className="text-[#64748b] text-[12px] leading-[20px] text-center mt-6">
      This is an automated administrative alert. Please take appropriate action in the admin dashboard.
    </Text>
  </BaseLayout>
);

export default AdminAlertEmail;
