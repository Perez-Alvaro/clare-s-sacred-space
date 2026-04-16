import CollectionCard from './CollectionCard';
import RevealOnScroll from './RevealOnScroll';
import oratorioImg from '@/assets/oratorio.jpg';
import llaveroImg from '@/assets/llavero.jpg';
import macrameImg from '@/assets/macrame.jpg';
import ora3Img from '@/assets/ora3.jpg';

const Collections = () => {
  const collections = [
    {
      title: 'Oratorios de Bolsillo',
      description: 'Nuestro producto destacado. Un pequeño objeto portátil pensado para crear un instante íntimo de recogimiento en medio de la vida diaria.',
      image: oratorioImg,
      link: '/tienda'
    },
    {
      title: 'Rosarios',
      description: 'Nuestro diferencial. Creados artesanalmente para acompañar tus momentos de fe y oración profunda, con detalles que inspiran paz y belleza.',
      image: ora3Img,
      link: '/tienda'
    },
    {
      title: 'Llaveros Multimedallas',
      description: 'Tejidos con hilo de seda, contienen medallas variadas. Un detalle para llevar en el día a día y recordar que no caminas solo.',
      image: llaveroImg,
      link: '/tienda'
    },
    {
      title: 'Telares en Macramé',
      description: 'Tejidos a mano, en tronco natural. Un objeto de decoración para tus espacios, que te invitan a la contemplación y a la calma.',
      image: macrameImg,
      link: '/tienda'
    }
  ];

  return (
    <section className="clare-section" id="colecciones">
      <div className="clare-container">
        {/* Encabezado */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <p className="clare-script mb-4">Nuestras creaciones</p>
            <h2 className="mb-6">Colecciones</h2>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
              Cada pieza es única, creada artesanalmente con amor y dedicación.
            </p>
          </div>
        </RevealOnScroll>

        {/* Grid de colecciones */}
        <div className="grid grid-cols-2 gap-4 md:gap-8">
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