import {
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout, Button } from "./components/BaseLayout";
import { APP_URL } from "../lib/constants";

interface ReviewReminderEmailProps {
  userName: string;
  courseTitle: string;
  courseId: string;
}

export const ReviewReminderEmail = ({
  userName,
  courseTitle,
  courseId,
}: ReviewReminderEmailProps) => (
  <BaseLayout previewText={`How's your experience with ${courseTitle}?`}>
    <Heading className="text-[#1e293b] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
      Help us improve, {userName}!
    </Heading>
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      You've been making great progress in <strong>{courseTitle}</strong>. We'd love to hear what you think about the course so far!
    </Text>
    
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      Your feedback helps our creators improve their content and helps other students make the right choice. It only takes a minute!
    </Text>
    
    <Button href={`${APP_URL}/courses/view?id=${courseId}#reviews`}>
      Leave a Review
    </Button>
    
    <Section className="bg-amber-50 p-6 rounded-lg border border-amber-100 mt-6">
        <Text className="text-[#92400e] text-[14px] leading-[22px] m-0">
            <strong>Why it matters:</strong> Honest reviews are the backbone of Verox Academy. They help us maintain the highest standards of quality across all our courses.
        </Text>
    </Section>

    <Text className="text-[#334155] text-[16px] leading-[26px] mt-6">
      Thank you for being part of the Verox community!
    </Text>
  </BaseLayout>
);

export default ReviewReminderEmail;
