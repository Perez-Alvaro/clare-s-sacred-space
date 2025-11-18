const About = () => {
  return (
    <section className="clare-section" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
      <div className="clare-container">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado */}
          <div className="text-center mb-16 animate-fade-in-up">
            <p className="clare-script mb-4">Nuestra historia</p>
            <h2 className="mb-6">Inspirados por CLEAR</h2>
            <div className="w-20 h-1 mx-auto" 
                 style={{ backgroundColor: 'hsl(var(--terracotta))' }} />
          </div>

          {/* Contenido en dos columnas */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Columna de texto 1 */}
            <div className="animate-fade-in-up delay-100">
              <h3 className="text-2xl mb-4" style={{ color: 'hsl(var(--earth))' }}>
                Un camino de fe
              </h3>
              <p className="mb-4 leading-relaxed">
                CLARE nace inspirado en la <strong>Sierva de Dios CLEAR (2015)</strong>, 
                como una respuesta al llamado de crear objetos devocionales que acompañen 
                el camino espiritual de cada persona.
              </p>
              <p className="leading-relaxed">
                Cada pieza es tejida con las manos y el corazón, buscando ser un 
                compañero silencioso en los momentos de oración y contemplación.
              </p>
            </div>

            {/* Columna de texto 2 */}
            <div className="animate-fade-in-up delay-200">
              <h3 className="text-2xl mb-4" style={{ color: 'hsl(var(--earth))' }}>
                Misión artesanal
              </h3>
              <p className="mb-4 leading-relaxed">
                Creamos <strong>regalos con fe, camino y conexión</strong>. No son simples 
                objetos, son portadores de intención, de amor, de presencia divina.
              </p>
              <p className="leading-relaxed">
                Cada oratorio, denario, llavero o tejido macramé es único, 
                hecho con paciencia franciscana y dedicación contemplativa.
              </p>
            </div>
          </div>

          {/* Valores en grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up delay-300">
            {[
              { label: 'Conexión' },
              { label: 'Fe' },
              { label: 'Amistad' },
              { label: 'Propósito' }
            ].map((value, index) => (
              <div 
                key={value.label}
                className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-md"
                style={{ 
                  backgroundColor: 'hsl(var(--sand))',
                  animationDelay: `${(index + 3) * 100}ms`
                }}
              >
                <p className="font-semibold text-lg" style={{ color: 'hsl(var(--earth))' }}>
                  {value.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;