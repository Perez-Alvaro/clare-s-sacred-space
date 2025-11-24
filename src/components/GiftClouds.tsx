import { Gift } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import ora3 from '../assets/ora3.jpg';
import ora4 from '../assets/ora4.jpg';

const GiftClouds = () => {
  return (
    <section className="clare-section" style={{ backgroundColor: 'hsl(var(--sand))' }}>
      <div className="clare-container">
        <div className="max-w-4xl mx-auto">

          {/* Encabezado */}
          <RevealOnScroll>
            <div className="text-center mb-16">
              <p className="clare-script mb-4">Llevá tu espacio de oración a donde vayas</p>
              <h2 className="mb-6">Personalizá tu Oratorio</h2>
              <div className="w-20 h-1 mx-auto mb-8"
                style={{ backgroundColor: 'hsl(var(--terracotta))' }} />
              <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-6"
                style={{ color: 'hsl(var(--soft-brown))' }}>
                Un pequeño objeto portátil pensado para crear un instante íntimo de recogimiento en medio de la vida diaria.
                Como llevar un refugio simbólico siempre a mano: un espacio interior reducido a su mínima expresión, pero lleno de sentido.
              </p>
              <p className="text-base max-w-2xl mx-auto leading-relaxed"
                style={{ color: 'hsl(var(--soft-brown))' }}>
                Elegí las imágenes de los santos y los dijes que acompañarán tu oración.
              </p>
            </div>
          </RevealOnScroll>

          {/* Modelos */}
          <RevealOnScroll delay={200}>
            <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">

              {/* Modelo 3 imágenes */}
              <div className="text-center">
                <img
                  src={ora3}
                  alt="Oratorio con 3 imágenes"
                  className="rounded-lg shadow-md mb-6 w-full"
                />
                <h3 className="text-xl mb-3 font-medium" style={{ color: 'hsl(var(--earth))' }}>
                  Formato Clásico
                </h3>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
                  3 imágenes de santos
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfLZh_Oratorio3Imagenes/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clare-btn clare-btn-primary w-full active:scale-95"
                  style={{ backgroundColor: '#7a5447' }}
                >
                  Encargar
                </a>
              </div>

              {/* Modelo 4 imágenes */}
              <div className="text-center">
                <img
                  src={ora4}
                  alt="Oratorio con 4 imágenes"
                  className="rounded-lg shadow-md mb-6 w-full"
                />
                <h3 className="text-xl mb-3 font-medium" style={{ color: 'hsl(var(--earth))' }}>
                  Formato Ampliado
                </h3>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
                  4 imágenes de santos
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfLZh_Oratorio4Imagenes/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clare-btn clare-btn-secondary w-full active:scale-95"
                  style={{
                    backgroundColor: '#b89a7c',
                    borderColor: '#b89a7c',
                    color: 'white'
                  }}
                >
                  Encargar
                </a>
              </div>

            </div>
          </RevealOnScroll>

          {/* Nota final */}
          <RevealOnScroll delay={300}>
            <div
              className="mt-12 p-6 rounded-lg border-l-4 text-center"
              style={{
                backgroundColor: 'hsl(var(--warm-white))',
                borderColor: 'hsl(var(--terracotta))'
              }}
            >
              <p className="text-lg leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
                Cada encargo es único. Una creación hecha con fe para acompañar tu camino espiritual.
              </p>
            </div>
          </RevealOnScroll>

        </div>
      </div>
    </section>
  );
};

export default GiftClouds;
