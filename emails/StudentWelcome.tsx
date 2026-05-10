import {
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout, Button } from "./components/BaseLayout";
import { APP_URL } from "../lib/constants";

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => (
  <BaseLayout previewText="Welcome to Verox Academy!">
    <Heading className="text-[#1e293b] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
      Welcome to the Academy, {userName}!
    </Heading>
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      We're thrilled to have you here. Verox Academy is more than just an LMS; it's a community of ambitious learners and expert creators.
    </Text>
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      Ready to start your journey? Explore our premium courses and take the first step towards mastering your next skill.
    </Text>
    
    <Button href={`${APP_URL}/courses`}>
      Browse Courses
    </Button>
    
    <Section className="bg-slate-50 p-6 rounded-lg border border-slate-100">
        <Text className="text-[#475569] text-[14px] leading-[24px] m-0 font-semibold mb-2">
            Quick Start Guide:
        </Text>
        <ul className="m-0 p-0 pl-4 text-[#64748b] text-[14px] leading-[24px]">
            <li>Browse the course library</li>
            <li>Enroll in your first course</li>
            <li>Track your progress in the dashboard</li>
            <li>Join our discord community</li>
        </ul>
    </Section>

    <Text className="text-[#334155] text-[16px] leading-[26px] mt-6">
      If you have any questions, feel free to reply to this email. We're here to help!
    </Text>
  </BaseLayout>
);

export default WelcomeEmail;
