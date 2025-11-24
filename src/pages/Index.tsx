import Hero from '@/components/Hero';
import About from '@/components/About';
import Collections from '@/components/Collections';
import GiftClouds from '@/components/GiftClouds';
import ValuesSection from '@/components/ValuesSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <GiftClouds />
      <Collections />
      <ValuesSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;