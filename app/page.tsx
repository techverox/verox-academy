import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import FeaturedCourses from "@/components/landing/FeaturedCourses";
import CreatorShowcase from "@/components/landing/CreatorShowcase";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ContentContainer } from "@/components/layout/ContentContainer";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      
      <SectionWrapper py="md">
        <ContentContainer>
          <Stats />
        </ContentContainer>
      </SectionWrapper>

      <SectionWrapper py="lg">
        <ContentContainer>
          <FeaturedCourses />
        </ContentContainer>
      </SectionWrapper>

      <SectionWrapper py="lg">
        <ContentContainer>
          <Features />
        </ContentContainer>
      </SectionWrapper>

      <SectionWrapper py="lg">
        <ContentContainer>
          <CreatorShowcase />
        </ContentContainer>
      </SectionWrapper>

      <SectionWrapper py="lg">
        <ContentContainer>
          <Testimonials />
        </ContentContainer>
      </SectionWrapper>

      <SectionWrapper py="lg">
        <ContentContainer>
          <FAQ />
        </ContentContainer>
      </SectionWrapper>

      <SectionWrapper py="xl" className="bg-surface/50 border-y border-border/50">
        <ContentContainer>
          <CTA />
        </ContentContainer>
      </SectionWrapper>
    </div>
  );
}
