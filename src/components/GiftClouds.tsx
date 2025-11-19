import { Gift, Heart, Sparkles } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const GiftClouds = () => {
  return (
    <section className="clare-section" style={{ backgroundColor: 'hsl(var(--sand))' }}>
      <div className="clare-container">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado */}
          <RevealOnScroll>
            <div className="text-center mb-12">
              <div className="inline-block p-4 rounded-full mb-6"
                style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
                <Gift size={48} style={{ color: 'hsl(var(--terracotta))' }} />
              </div>
              <h2 className="mb-6">Nubes de Regalo</h2>
              <p className="text-lg max-w-2xl mx-auto leading-relaxed"
                style={{ color: 'hsl(var(--soft-brown))' }}>
                Una forma especial de regalar con intención. Las Nubes de Regalo son
                selecciones curadas de nuestras piezas más significativas, listas para
                entregar amor y fe.
              </p>
            </div>
          </RevealOnScroll>

          {/* Características */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: <Heart size={32} />,
                title: 'Con amor',
                description: 'Cada nube está preparada con cuidado y devoción'
              },
              {
                icon: <Gift size={32} />,
                title: 'Lista para regalar',
                description: 'Empaquetada de forma hermosa y contemplativa'
              },
              {
                icon: <Sparkles size={32} />,
                title: 'Momentos especiales',
                description: 'Perfecta para acompañar fechas importantes'
              }
            ].map((item, index) => (
              <RevealOnScroll key={item.title} delay={(index + 1) * 100}>
                <div
                  className="text-center p-6 rounded-lg"
                  style={{
                    backgroundColor: 'hsl(var(--warm-white))'
                  }}
                >
                  <div className="inline-block mb-4" style={{ color: 'hsl(var(--terracotta))' }}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl mb-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>
                    {item.description}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          {/* CTAs */}
          <RevealOnScroll delay={400}>
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="clare-btn clare-btn-primary">
                  Ver Nubes Disponibles
                </button>
                <button className="clare-btn clare-btn-secondary">
                  Personalizar una Nube
                </button>
              </div>
              <p className="mt-6 text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>
                También puedes contactarnos para crear una nube personalizada
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

export default GiftClouds;