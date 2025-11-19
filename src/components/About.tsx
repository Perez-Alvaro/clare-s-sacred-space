const About = () => {
  return (
    <section className="clare-section" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
      <div className="clare-container">
        <div className="max-w-4xl mx-auto">

          {/* Encabezado */}
          <div className="text-center mb-16 animate-fade-in-up">
            <p className="clare-script mb-4">Nuestra historia</p>
            <h2 className="mb-6">Inspirados por CLARE</h2>
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
                Esta obra nace inspirada en la vida de <strong>la hermana Clare Crockett</strong> 
                (1982–2016), reconocida por su alegría, entrega total y profundo amor a Cristo.
                Su frase de vida <em>“Todo o nada”</em> se convirtió en guía y luz para muchos.
              </p>
              <p className="leading-relaxed">
                En 2025 su causa de beatificación fue oficialmente abierta por la Iglesia, 
                siendo declarada <strong>Sierva de Dios</strong>, confirmando su testimonio como 
                ejemplo para nuestro tiempo.
              </p>
            </div>

            {/* Columna de texto 2 */}
            <div className="animate-fade-in-up delay-200">
              <h3 className="text-2xl mb-4" style={{ color: 'hsl(var(--earth))' }}>
                Misión artesanal
              </h3>
              <p className="mb-4 leading-relaxed">
                Lo que hacemos no son solo objetos: son gestos de fe. Cada pieza está pensada 
                como un recordatorio silencioso del amor de Dios, del servicio sencillo, 
                y del camino espiritual que la hermana Clare vivió con tanta autenticidad.
              </p>
              <p className="leading-relaxed">
                Así como ella ofreció su vida completamente, cada creación busca transmitir 
                esperanza, belleza y una invitación al encuentro con Dios en lo cotidiano: 
                oración, entrega, alegría y propósito.
              </p>
            </div>
          </div>

          {/* Valores */}
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
