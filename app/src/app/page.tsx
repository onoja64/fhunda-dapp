import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { CTASection } from "@/components/home/CTASection";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatsSection />
      </div>

      <HowItWorksSection />

      <CTASection />
    </div>
  );
}
