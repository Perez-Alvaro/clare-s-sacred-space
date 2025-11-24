import { Heart, Users, Compass, Sparkles } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const ValuesSection = () => {
  const values = [
    {
      icon: <Heart size={40} />,
      title: 'Oración',
      description: 'Cada pieza lleva consigo una bendición silenciosa.'
    },
    {
      icon: <Sparkles size={40} />,
      title: 'Presencia',
      description: 'Objetos que te invitan a detenerte y estar en el aquí y ahora..'
    },
    {
      icon: <Users size={40} />,
      title: 'Encuentro',
      description: 'Gestos que fortalecen la conexión con quienes querés..'
    },
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
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
      </div>
    </section>
  );
};

export default ValuesSection;