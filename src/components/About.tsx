import RevealOnScroll from './RevealOnScroll';

const About = () => {
  return (
    <section className="clare-section" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
      <div className="clare-container">
        <div className="max-w-4xl mx-auto">

          {/* Encabezado */}
          <RevealOnScroll>
            <div className="text-center mb-16">
              <p className="clare-script mb-4">Nuestra historia</p>
              <h2 className="mb-6">Inspirados por CLARE</h2>
              <div className="w-20 h-1 mx-auto"
                style={{ backgroundColor: 'hsl(var(--terracotta))' }} />
            </div>
          </RevealOnScroll>

          {/* Contenido en dos columnas */}
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Columna de texto 1 */}
            <RevealOnScroll delay={100}>
              <div>
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
            </RevealOnScroll>

            {/* Columna de texto 2 */}
            <RevealOnScroll delay={200}>
              <div>
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
            </RevealOnScroll>
          </div>

          {/* Valores */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Conexión' },
              { label: 'Fe' },
              { label: 'Amistad' },
              { label: 'Propósito' }
            ].map((value, index) => (
              <RevealOnScroll
                key={value.label}
                delay={(index + 3) * 100}
                className="h-full"
              >
                <div
                  className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-md h-full flex items-center justify-center"
                  style={{
                    backgroundColor: 'hsl(var(--sand))',
                  }}
                >
                  <p className="font-semibold text-lg" style={{ color: 'hsl(var(--earth))' }}>
                    {value.label}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
