import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import FeaturedCourses from "@/components/landing/FeaturedCourses";
import CreatorShowcase from "@/components/landing/CreatorShowcase";
import FAQ from "@/components/landing/FAQ";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <Hero />
        <Stats />
        <FeaturedCourses />
        <Features />
        <CreatorShowcase />
        <FAQ />
      </main>
    </div>
  );
}

