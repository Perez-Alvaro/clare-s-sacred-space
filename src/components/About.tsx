import RevealOnScroll from './RevealOnScroll';
import clareProfile from '@/assets/clare-profile.png';

const About = () => {
  return (
    <section className="clare-section" id="historia" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
      <div className="clare-container">
        <div className="max-w-4xl mx-auto">

          {/* Encabezado */}
          <RevealOnScroll>
            <div className="text-center mb-16">
              <p className="clare-script mb-4">Nuestra historia</p>
              <h2 className="mb-6">Inspirados por CLARE</h2>
              <div className="w-20 h-1 mx-auto"
                style={{ backgroundColor: 'hsl(var(--terracotta))' }} />

              {/* Clare's Profile Photo */}
              <div className="mt-12 flex justify-center">
                <img
                  src={clareProfile}
                  alt="Clare Crockett"
                  className="w-48 h-48 rounded-full object-cover shadow-md border-2"
                  style={{ borderColor: 'hsl(var(--sand))' }}
                />
              </div>
            </div>
          </RevealOnScroll>

          {/* Contenido resumido y tarjetas */}
          <RevealOnScroll delay={100}>
            <div className="mb-12 text-center max-w-4xl mx-auto">
              <p className="mb-6 text-lg leading-relaxed font-light" style={{ color: 'hsl(var(--earth))' }}>
                Esta obra nace inspirada en la vida de la <strong>hermana Clare Crockett (1982-2016)</strong>, una mujer cuya alegría era contagiosa, cuya entrega era total, y cuyo amor a Cristo no conocía medias tintas. Su frase de vida —<em>"O todo o nada"</em>— se convirtió en luz para miles, y hoy sostiene cada puntada que tejemos.
              </p>
              <p className="mb-12 text-lg leading-relaxed font-light" style={{ color: 'hsl(var(--earth))' }}>
                En 2025, su causa de beatificación fue oficialmente abierta por la Iglesia, siendo declarada Sierva de Dios. Su testimonio no es historia: es invitación viva.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
                <div className="p-8 rounded-2xl shadow-sm transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center" style={{ backgroundColor: 'white', border: '1px solid hsl(var(--sand))' }}>
                  <h4 className="mb-4 text-xl font-normal" style={{ color: 'hsl(var(--terracotta))' }}>Detalles que abrazan</h4>
                  <p className="text-base leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
                    <strong style={{ color: 'hsl(var(--earth))', fontWeight: 600 }}>No son solo objetos.</strong> Llevan una intención silenciosa: recordarte que <strong style={{ color: 'hsl(var(--earth))', fontWeight: 600 }}>Dios camina contigo</strong>.
                  </p>
                </div>
                
                <div className="p-8 rounded-2xl shadow-sm transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center" style={{ backgroundColor: 'white', border: '1px solid hsl(var(--sand))' }}>
                  <h4 className="mb-4 text-xl font-normal" style={{ color: 'hsl(var(--terracotta))' }}>Refugio portátil de paz</h4>
                  <p className="text-base leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
                    Ofrecemos nuestra artesanía con <strong style={{ color: 'hsl(var(--earth))', fontWeight: 600 }}>entrega total</strong> para que cada pieza sea tu <strong style={{ color: 'hsl(var(--earth))', fontWeight: 600 }}>refugio portátil de paz</strong>.
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Pull Quote */}
          <RevealOnScroll delay={200}>
            <div
              className="p-8 rounded-2xl italic text-center max-w-2xl mx-auto shadow-sm"
              style={{
                backgroundColor: 'hsl(var(--sand))',
                border: '1px solid hsl(var(--warm-white))'
              }}
            >
              <p className="text-2xl font-light mb-2" style={{ color: 'hsl(var(--earth))' }}>
                "O todo o nada"
              </p>
              <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--terracotta))' }}>
                — Hna. Clare Crockett
              </p>
            </div>
          </RevealOnScroll>

        </div>
      </div>
    </section>
  );
};

export default About;
