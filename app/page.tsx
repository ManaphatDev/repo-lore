import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Examples } from '@/components/landing/examples';
import { Faq } from '@/components/landing/faq';
import { ApiStatusSection } from '@/components/landing/api-status';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Examples />
      <Faq />
      <ApiStatusSection />
    </>
  );
}
