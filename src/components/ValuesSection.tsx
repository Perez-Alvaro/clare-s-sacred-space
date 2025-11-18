import { Heart, Users, Compass, Sparkles } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: <Heart size={40} />,
      title: 'Conexión',
      description: 'Tejemos lazos que unen corazones con la fe y el amor divino'
    },
    {
      icon: <Sparkles size={40} />,
      title: 'Fe',
      description: 'Cada pieza lleva consigo una oración y una bendición silenciosa'
    },
    {
      icon: <Users size={40} />,
      title: 'Amistad',
      description: 'Regalos que fortalecen los vínculos más importantes de la vida'
    },
    {
      icon: <Compass size={40} />,
      title: 'Propósito',
      description: 'Acompañamos tu camino espiritual con objetos llenos de significado'
    }
  ];

  return (
    <section className="clare-section" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
      <div className="clare-container">
        {/* Encabezado */}
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="clare-script mb-4">Lo que nos mueve</p>
          <h2 className="mb-6">Nuestros Valores</h2>
          <div className="w-20 h-1 mx-auto" 
               style={{ backgroundColor: 'hsl(var(--terracotta))' }} />
        </div>

        {/* Grid de valores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div 
              key={value.title}
              className="text-center p-8 rounded-lg transition-all duration-300 hover:shadow-lg group animate-fade-in-up"
              style={{ 
                backgroundColor: 'hsl(var(--sand))',
                animationDelay: `${index * 100}ms`
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
          ))}
        </div>

        {/* Mensaje adicional */}
        <div className="mt-16 text-center max-w-3xl mx-auto animate-fade-in-up delay-400">
          <p className="text-lg leading-relaxed italic" style={{ color: 'hsl(var(--soft-brown))' }}>
            "Cada hilo tejido, cada cuenta ensartada, cada pieza creada lleva consigo 
            una intención: acompañarte en tu camino de fe, ser un recordatorio silencioso 
            del amor de Jesús en cada momento."
          </p>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;