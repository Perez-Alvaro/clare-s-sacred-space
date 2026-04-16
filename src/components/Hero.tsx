import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-image.png';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--cream))]/45 via-[hsl(var(--cream))]/30 to-[hsl(var(--cream))]/10" />
      </div>

      {/* Contenido con efecto glass */}
      <div className="clare-container relative z-10 px-6 py-20 flex justify-center">
        <div className="max-w-2xl mx-auto animate-fade-in-up 
          bg-white/35 backdrop-blur-md 
          rounded-xl shadow-lg p-10 
          border border-white/40 text-center">

          <p className="clare-script mb-6 animate-fade-in delay-100 text-[hsl(var(--earth))]">
            Fe que se teje en cada detalle
          </p>

          <h1 className="mb-6 animate-fade-in-up delay-200">
            Cuando la luz interior se vuelve creación
          </h1>

          <p className="text-xl md:text-2xl mb-12 leading-relaxed animate-fade-in-up delay-300"
            style={{ color: 'hsl(var(--soft-brown))' }}>
            Es donde la oración toma forma.
          </p>

          <div className="flex justify-center animate-fade-in-up delay-500 mt-4">
            <Link to="/tienda" className="clare-btn clare-btn-primary w-full sm:w-auto px-10 py-4 text-xl font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl flex items-center justify-center">
              Conocé nuestra tienda
              <ArrowRight size={22} className="ml-2" />
            </Link>
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
