import {
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout, Button } from "./components/BaseLayout";
import { APP_URL } from "../lib/constants";

interface CreatorApprovedEmailProps {
  userName: string;
}

export const CreatorApprovedEmail = ({
  userName,
}: CreatorApprovedEmailProps) => (
  <BaseLayout previewText="Welcome to the Creator Program!">
    <Heading className="text-[#1e293b] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
      You're Officially a Creator! 🚀
    </Heading>
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      Congratulations {userName}, your application to become a Verox Academy Creator has been approved!
    </Text>
    
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      You now have access to the <strong>Creator Studio</strong>, where you can build your courses, track your earnings, and manage your students.
    </Text>
    
    <Button href={`${APP_URL}/creator/studio`}>
      Go to Creator Studio
    </Button>
    
    <Section className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mt-6">
        <Text className="text-[#4338ca] text-[14px] leading-[22px] m-0 font-semibold mb-2">
            Next Steps for You:
        </Text>
        <ul className="m-0 p-0 pl-4 text-[#4338ca] text-[14px] leading-[24px]">
            <li>Set up your creator profile</li>
            <li>Create your first course outline</li>
            <li>Upload your introductory video</li>
            <li>Set your course price and publish</li>
        </ul>
    </Section>

    <Text className="text-[#334155] text-[16px] leading-[26px] mt-6">
      We're excited to see what you build. If you need any help getting started, our creator support team is just an email away.
    </Text>
  </BaseLayout>
);

export default CreatorApprovedEmail;
