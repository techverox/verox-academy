import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Img,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout, Button } from "./components/BaseLayout";

interface UnfinishedCourseReminderProps {
  studentName: string;
  courseTitle: string;
  progress: number;
  courseUrl: string;
}

export const UnfinishedCourseReminder = ({
  studentName,
  courseTitle,
  progress,
  courseUrl,
}: UnfinishedCourseReminderProps) => (
  <BaseLayout previewText="You're almost there! Continue your learning journey.">
    <Heading className="text-[#1e293b] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
      Don't stop now, {studentName}!
    </Heading>
    <Text className="text-[#334155] text-[16px] leading-[26px]">
      We noticed you haven't visited <strong>{courseTitle}</strong> lately. 
      You've already completed <strong>{progress}%</strong> of the course—you're so close to earning your certificate!
    </Text>
    
    <Section className="my-[24px] p-6 bg-slate-50 rounded-xl border border-slate-200">
      <Text className="text-[12px] font-bold text-[#64748b] uppercase tracking-[0.1em] m-0 mb-3">
        Current Progress: {progress}%
      </Text>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </Section>

    <Text className="text-[#334155] text-[16px] leading-[26px]">
      Mastering a new skill takes consistency. Jump back in today and pick up right where you left off.
    </Text>
    
    <Button href={courseUrl}>
      Continue Learning
    </Button>
  </BaseLayout>
);

export default UnfinishedCourseReminder;
