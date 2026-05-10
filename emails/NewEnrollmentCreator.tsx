import {
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout, Button } from "./components/BaseLayout";
import { APP_URL } from "../lib/constants";

interface NewEnrollmentCreatorEmailProps {
  creatorName: string;
  studentName: string;
  courseTitle: string;
  revenue: number; // in paise
}

export const NewEnrollmentCreatorEmail = ({
  creatorName,
  studentName,
  courseTitle,
  revenue,
}: NewEnrollmentCreatorEmailProps) => {
  const formattedRevenue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(revenue / 100);

  return (
    <BaseLayout previewText={`New Enrollment: ${studentName}`}>
      <Heading className="text-[#1e293b] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
        You have a new student! 🎉
      </Heading>
      <Text className="text-[#334155] text-[16px] leading-[26px]">
        Hi {creatorName}, someone just joined your course!
      </Text>
      
      <Section className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 my-6">
          <Text className="text-[#334155] text-[16px] m-0">
              <strong>Student:</strong> {studentName}
          </Text>
          <Text className="text-[#334155] text-[16px] m-0 mt-2">
              <strong>Course:</strong> {courseTitle}
          </Text>
          <Text className="text-[#334155] text-[16px] m-0 mt-2">
              <strong>Your Revenue:</strong> {formattedRevenue}
          </Text>
      </Section>

      <Text className="text-[#334155] text-[16px] leading-[26px]">
        Your earnings have been updated in your dashboard. You can see more details and student progress in the Creator Studio.
      </Text>
      
      <Button href={`${APP_URL}/creator/dashboard`}>
        View Analytics
      </Button>
      
      <Text className="text-[#64748b] text-[14px] leading-[24px]">
        Don't forget to check if {studentName} has any questions in the course discussion forum!
      </Text>
    </BaseLayout>
  );
};

export default NewEnrollmentCreatorEmail;
