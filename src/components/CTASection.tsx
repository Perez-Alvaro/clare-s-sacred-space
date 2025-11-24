import { ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const CTASection = () => {
  return (
    <section
      className="clare-section relative overflow-hidden"
      style={{ backgroundColor: '#a26953' }}
    >
      {/* Patrón decorativo de fondo */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--warm-white)) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="clare-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Contenido principal */}
          <RevealOnScroll delay={100}>
            <div className="mb-12">
              <h2
                className="mb-6 text-4xl md:text-5xl"
                style={{ color: 'hsl(var(--warm-white))' }}
              >
                La belleza nace de la entrega
              </h2>
              
              <p
                className="text-lg max-w-2xl mx-auto leading-relaxed"
                style={{ color: 'hsl(var(--warm-white))' }}
              >
                Como Clare ofreció su vida completamente —sin reservas, sin medias tintas— nosotros ofrecemos
                nuestra artesanía del mismo modo: con entrega total, belleza auténtica, y el deseo profundo de
                que cada pieza sea, para ti, un refugio portátil de paz.
              </p>
            </div>
          </RevealOnScroll>

          {/* Botones de acción */}
          <RevealOnScroll delay={200}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <a
                href="https://clare3.mitiendanube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-3"
                style={{
                  backgroundColor: 'hsl(var(--warm-white))',
                  color: 'hsl(var(--earth))'
                }}
              >
                <ShoppingBag size={20} />
                Entrar a la Tienda
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="https://wa.me/3534259493"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-3"
                style={{
                  backgroundColor: 'transparent',
                  color: 'hsl(var(--warm-white))',
                  border: '2px solid hsl(var(--warm-white))'
                }}
              >
                <MessageCircle size={20} />
                Contactar por WhatsApp
              </a>
            </div>
          </RevealOnScroll>

          {/* Mensaje final */}
          <RevealOnScroll delay={300}>
            <p
              className="text-sm"
              style={{ color: 'hsl(var(--warm-white))' }}
            >
              También podés seguirnos en redes para ver nuestras últimas creaciones
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

export default CTASection;