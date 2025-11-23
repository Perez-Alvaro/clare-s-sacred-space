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

          {/* Contenido narrativo */}
          <RevealOnScroll delay={100}>
            <div className="mb-12">
              <p className="mb-6 leading-relaxed text-lg" style={{ color: 'hsl(var(--soft-brown))' }}>
                Esta obra nace inspirada en la vida de <strong>la hermana Clare Crockett</strong> (1982-2016),
                una mujer cuya alegría era contagiosa, cuya entrega era total, y cuyo amor a Cristo no conocía
                medias tintas. Su frase de vida —<em>"O todo o nada"</em>— se convirtió en luz para miles,
                y hoy sostiene cada puntada que tejemos.
              </p>
              <p className="mb-6 leading-relaxed text-lg" style={{ color: 'hsl(var(--soft-brown))' }}>
                En 2025, su causa de beatificación fue oficialmente abierta por la Iglesia, siendo declarada
                <strong> Sierva de Dios</strong>. Su testimonio no es historia: es invitación viva.
              </p>
            </div>
          </RevealOnScroll>

          {/* Misión */}
          <RevealOnScroll delay={200}>
            <div className="mb-12">
              <h3 className="text-2xl mb-6 font-medium text-center" style={{ color: 'hsl(var(--earth))' }}>
                Lo que hacemos no son solo objetos. Son gestos de fe.
              </h3>
              <p className="mb-6 leading-relaxed text-lg" style={{ color: 'hsl(var(--soft-brown))' }}>
                Cada oratorio de bolsillo, cada llavero multimedallas, cada pieza tejida en macramé lleva consigo
                una intención silenciosa: acompañarte cuando necesitas recordar que no estás solo. Que Dios camina
                contigo. Que la belleza también es oración.
              </p>
              <p className="leading-relaxed text-lg" style={{ color: 'hsl(var(--soft-brown))' }}>
                Como Clare ofreció su vida completamente —sin reservas, sin medias tintas— nosotros ofrecemos
                nuestra artesanía del mismo modo: con entrega total, belleza auténtica, y el deseo profundo de
                que cada pieza sea, para ti, un refugio portátil de paz.
              </p>
            </div>
          </RevealOnScroll>

          {/* Pull Quote */}
          <RevealOnScroll delay={300}>
            <div
              className="p-6 rounded-lg border-l-4 italic text-center"
              style={{
                backgroundColor: 'hsl(var(--sand))',
                borderColor: 'hsl(var(--terracotta))'
              }}
            >
              <p className="text-xl font-light" style={{ color: 'hsl(var(--earth))' }}>
                "O todo o nada"
              </p>
              <p className="text-sm mt-2" style={{ color: 'hsl(var(--soft-brown))' }}>
                — Clare Crockett
              </p>
            </div>
          </RevealOnScroll>

        </div>
      </div>
    </section>
  );
};

export default About;
