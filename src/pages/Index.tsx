import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import NewsSection from '@/components/NewsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <NewsSection />
      <About />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
