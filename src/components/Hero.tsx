import { ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo con overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--cream))] via-[hsl(var(--cream))]/95 to-[hsl(var(--cream))]/90" />
      </div>

      {/* Contenido */}
      <div className="clare-container relative z-10 text-center px-6 py-20">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          {/* Texto decorativo */}
          <p className="clare-script mb-6 animate-fade-in delay-100">
            Fe que se teje en cada detalle
          </p>

          {/* Título principal */}
          <h1 className="mb-6 animate-fade-in-up delay-200">
            CLARE
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl mb-4 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300" 
             style={{ color: 'hsl(var(--soft-brown))' }}>
            Artes con propósito, camino y oración
          </p>

          <p className="text-lg mb-12 max-w-xl mx-auto animate-fade-in-up delay-400" 
             style={{ color: 'hsl(var(--earth))' }}>
            Regalos que acompañan el camino espiritual, tejidos con fe y amor artesanal
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-500">
            <button className="clare-btn clare-btn-primary w-full sm:w-auto">
              Ver Tienda
              <ArrowRight size={20} />
            </button>
            <button className="clare-btn clare-btn-secondary w-full sm:w-auto">
              Nubes de Regalo
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-2"
             style={{ borderColor: 'hsl(var(--soft-brown))' }}>
          <div className="w-1.5 h-1.5 rounded-full" 
               style={{ backgroundColor: 'hsl(var(--terracotta))' }} />
        </div>
      </div>
    </section>
  );
};

export default Hero;