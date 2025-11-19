import CollectionCard from './CollectionCard';
import RevealOnScroll from './RevealOnScroll';
import oratorioImg from '@/assets/oratorio.jpg';
import kraftImg from '@/assets/kraft.jpg';
import llaveroImg from '@/assets/llavero.jpg';
import macrameImg from '@/assets/macrame.jpg';
import canastaImg from '@/assets/canasta.jpg';
import centroMesaImg from '@/assets/centroMesa.jpg';
import macetaImg from '@/assets/maceta.jpg';

const Collections = () => {
  const collections = [
    {
      title: 'Oratorios de Bolsillo',
      description: 'Pequeños espacios sagrados para llevar la oración contigo. Cada oratorio es un refugio portátil de paz.',
      image: oratorioImg,
    },
    {
      title: 'Canastas Kraft',
      description: 'Creadas con diseño artesanal y simplicidad cálida. Son un abrazo práctico para tus objetos cotidianos, acompañando momentos de silencio, hogar y presencia.',
      image: kraftImg,
    },
    {
      title: 'Llaveros Devocionales',
      description: 'Medallas y símbolos que te acompañan cada día. Pequeños recordatorios de fe en cada paso.',
      image: llaveroImg,
    },
    {
      title: 'Tejidos de Macramé',
      description: 'Objetos tejidos a mano con intención. Cada nudo es una oración, cada hilo una conexión.',
      image: macrameImg,
    },
    {
      title: 'Canastas de Macramé',
      description: 'Tejidas con manos pacientes y corazón orante. Cada nudo sostiene historia y propósito. Perfectas para acompañar tus espacios con belleza, orden y calidez contemplativa.',
      image: canastaImg,
    },
    {
      title: 'Centros de mesa',
      description: 'Detalles que transforman el espacio. Cada pieza invita a la quietud, a la belleza sencilla y al encuentro con lo sagrado que habita en lo cotidiano.',
      image: centroMesaImg,
    },
    {
      title: 'Sostenedores de macetas en macramé',
      description: 'Tejidos que elevan y sostienen. Un recordatorio de que la vida crece mejor cuando está sostenida por amor, luz y raíces profundas.',
      image: macetaImg,
    },
  ];

  return (
    <section className="clare-section" id="colecciones">
      <div className="clare-container">
        {/* Encabezado */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <p className="clare-script mb-4">Nuestras creaciones</p>
            <h2 className="mb-6">Colecciones</h2>
            <p className="max-w-2xl mx-auto text-lg" style={{ color: 'hsl(var(--soft-brown))' }}>
              Cada pieza es única, creada con amor y dedicación contemplativa
            </p>
          </div>
        </RevealOnScroll>

        {/* Grid de colecciones */}
        <div className="clare-grid">
          {collections.map((collection, index) => (
            <RevealOnScroll key={collection.title} delay={index * 100}>
              <CollectionCard
                {...collection}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;