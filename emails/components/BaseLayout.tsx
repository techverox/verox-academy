import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";
import { APP_URL } from "../../lib/constants";

interface BaseLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export const BaseLayout = ({ previewText, children }: BaseLayoutProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Tailwind>
      <Body style={main} className="bg-slate-50 my-auto mx-auto font-sans">
        <Container className="border border-solid border-[#eaeaea] bg-white rounded-xl my-[40px] mx-auto p-[32px] w-[500px] shadow-sm">
          <Section className="mb-[32px]">
             {/* Replace with your actual logo URL */}
            <Heading style={logoStyle}>VEROX ACADEMY</Heading>
          </Section>
          
          {children}
          
          <Hr className="border border-solid border-[#eaeaea] my-[32px] mx-0 w-full" />
          
          <Section>
            <Text className="text-[#94a3b8] text-[12px] leading-[20px] text-center italic">
              "Empowering the next generation of digital creators and professionals."
            </Text>
            <Text className="text-[#64748b] text-[12px] leading-[24px] text-center mt-4">
              © {new Date().getFullYear()} Verox Academy. Built with passion for excellence.
            </Text>
            <Text className="text-[#64748b] text-[12px] leading-[24px] text-center">
              <Link href={APP_URL} className="text-[#6366f1] no-underline font-medium">
                Website
              </Link>{" "}
              •{" "}
              <Link href={`${APP_URL}/dashboard`} className="text-[#6366f1] no-underline font-medium">
                Dashboard
              </Link>{" "}
              •{" "}
              <Link href={`${APP_URL}/support`} className="text-[#64748b] no-underline">
                Help Center
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const logoStyle = {
    color: "#6366f1",
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    textAlign: "center" as const,
    margin: "0",
    padding: "0",
};

// Helper components for templates
export const Button = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Section className="text-center mt-[32px] mb-[32px]">
    <Link
      href={href}
      className="bg-[#6366f1] rounded-lg text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
    >
      {children}
    </Link>
  </Section>
);

import { Heading } from "@react-email/components";
