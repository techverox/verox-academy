import {
  Heading,
  Section,
  Text,
  Img,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout, Button } from "./components/BaseLayout";
import { APP_URL } from "../lib/constants";

interface EnrollmentSuccessEmailProps {
  userName: string;
  courseTitle: string;
  courseThumbnail: string;
  courseId: string;
}

export const EnrollmentSuccessEmail = ({
  userName,
  courseTitle,
  courseThumbnail,
  courseId,
}: EnrollmentSuccessEmailProps) => (
  <BaseLayout previewText={`Enrolled: ${courseTitle}`}>
    <Heading className="text-[#1e293b] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
      You're in, {userName}!
    </Heading>
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      Great choice! Your enrollment in <strong>{courseTitle}</strong> was successful. You now have full access to all lessons, resources, and community discussions for this course.
    </Text>

    <Section className="my-[24px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <Img
        src={courseThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}
        width="100%"
        height="auto"
        alt={courseTitle}
      />
      <Section className="p-4 bg-white">
        <Text className="text-[#1e293b] text-[18px] font-bold m-0">
            {courseTitle}
        </Text>
        <Text className="text-[#64748b] text-[14px] mt-1 mb-0">
            Full Lifetime Access
        </Text>
      </Section>
    </Section>
    
    <Button href={`${APP_URL}/learn/viewer?id=${courseId}`}>
      Start Learning Now
    </Button>
    
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      Ready to dive in? Your progress will be saved automatically, so you can pick up right where you left off.
    </Text>
    
    <Section className="mt-6 p-4 border-l-4 border-indigo-500 bg-indigo-50/50">
        <Text className="text-[#4338ca] text-[14px] leading-[22px] m-0">
            <strong>Pro Tip:</strong> Complete all lessons and pass the final assessment to unlock your official Verox Academy Certificate of Completion.
        </Text>
    </Section>
  </BaseLayout>
);

export default EnrollmentSuccessEmail;
