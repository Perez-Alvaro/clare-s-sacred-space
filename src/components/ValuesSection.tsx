import { Heart, Users, Compass, Sparkles } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const ValuesSection = () => {
  const values = [
    {
      icon: <Sparkles size={40} />,
      title: 'Presencia',
      description: 'Objetos que te recuerdan: Dios está aquí, ahora, contigo.'
    },
    {
      icon: <Heart size={40} />,
      title: 'Oración',
      description: 'Cada pieza lleva consigo una bendición silenciosa, tejida con fe.'
    },
    {
      icon: <Users size={40} />,
      title: 'Comunión',
      description: 'Regalos que fortalecen lazos y celebran el amor que nos une.'
    },
    {
      icon: <Compass size={40} />,
      title: 'Camino',
      description: 'Compañeros silenciosos que acompañan tu peregrinaje espiritual.'
    }
  ];

  return (
    <section className="clare-section" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
      <div className="clare-container">
        {/* Encabezado */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <p className="clare-script mb-4">Lo que nos mueve</p>
            <h2 className="mb-6">Nuestros Valores</h2>
            <div className="w-20 h-1 mx-auto"
              style={{ backgroundColor: 'hsl(var(--terracotta))' }} />
          </div>
        </RevealOnScroll>

        {/* Grid de valores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <RevealOnScroll key={value.title} delay={index * 100}>
              <div
                className="text-center p-8 rounded-lg transition-all duration-300 hover:shadow-lg group"
                style={{
                  backgroundColor: 'hsl(var(--sand))'
                }}
              >
                {/* Ícono */}
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: 'hsl(var(--warm-white))',
                    color: 'hsl(var(--terracotta))'
                  }}
                >
                  {value.icon}
                </div>

                {/* Título */}
                <h3 className="text-xl mb-3 font-medium" style={{ color: 'hsl(var(--earth))' }}>
                  {value.title}
                </h3>

                {/* Descripción */}
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
                  {value.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Mensaje adicional */}
        <RevealOnScroll delay={400}>
          <div className="mt-16 text-center max-w-3xl mx-auto">
            <p className="text-lg leading-relaxed italic" style={{ color: 'hsl(var(--soft-brown))' }}>
              «Cada hilo tejido, cada cuenta ensartada, cada pieza creada lleva consigo una intención:
              acompañarte en tu camino de fe, ser un recordatorio silencioso del amor de Jesús en cada momento.»
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default ValuesSection;