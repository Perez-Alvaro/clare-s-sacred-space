import { ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section 
      className="clare-section relative overflow-hidden"
      style={{ backgroundColor: 'hsl(var(--terracotta))' }}
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
          <div className="mb-12 animate-fade-in-up">
            <p 
              className="text-2xl md:text-3xl mb-6 font-light leading-relaxed"
              style={{ 
                fontFamily: 'var(--font-heading)',
                color: 'hsl(var(--warm-white))' 
              }}
            >
              "o todo o nada" - Clare Crockett.
            </p>
            <h2 
              className="mb-6 text-4xl md:text-5xl"
              style={{ color: 'hsl(var(--warm-white))' }}
            >
              Queremos formar parte de tu camino.
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'hsl(var(--warm-white))' }}
            >
              Descubrí piezas únicas creadas con amor franciscano. 
              Cada objeto es una invitación a la contemplación y la conexión espiritual.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in-up delay-100">
            <button 
              className="group px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-3"
              style={{ 
                backgroundColor: 'hsl(var(--warm-white))',
                color: 'hsl(var(--earth))'
              }}
            >
              <ShoppingBag size={20} />
              Entrar a la Tienda
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              className="group px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-3"
              style={{ 
                backgroundColor: 'transparent',
                color: 'hsl(var(--warm-white))',
                border: '2px solid hsl(var(--warm-white))'
              }}
            >
              <MessageCircle size={20} />
              Contactar por WhatsApp
            </button>
          </div>

          {/* Mensaje final */}
          <p 
            className="text-sm animate-fade-in-up delay-200"
            style={{ color: 'hsl(var(--warm-white))' }}
          >
            También puedes seguirnos en redes sociales para ver nuestras últimas creaciones
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;