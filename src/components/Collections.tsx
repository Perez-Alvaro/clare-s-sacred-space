import CollectionCard from './CollectionCard';
import oratorioImg from '@/assets/oratorio.jpg';
import denarioImg from '@/assets/denario.jpg';
import llaveroImg from '@/assets/llavero.jpg';
import macrameImg from '@/assets/macrame.jpg';

const Collections = () => {
  const collections = [
    {
      title: 'Oratorios de Bolsillo',
      description: 'Pequeños espacios sagrados para llevar la oración contigo. Cada oratorio es un refugio portátil de paz.',
      image: oratorioImg,
    },
    {
      title: 'Denarios',
      description: 'Cuentas de oración artesanales tejidas con devoción. Acompañan tus momentos de contemplación y silencio.',
      image: denarioImg,
    },
    {
      title: 'Llaveros Devocionales',
      description: 'Medallas y símbolos que te acompañan cada día. Pequeños recordatorios de fe en cada paso.',
      image: llaveroImg,
    },
    {
      title: 'Macramé Espiritual',
      description: 'Pulseras y objetos tejidos a mano con intención. Cada nudo es una oración, cada hilo una conexión.',
      image: macrameImg,
    },
  ];

  return (
    <section className="clare-section" id="colecciones">
      <div className="clare-container">
        {/* Encabezado */}
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="clare-script mb-4">Nuestras creaciones</p>
          <h2 className="mb-6">Colecciones</h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: 'hsl(var(--soft-brown))' }}>
            Cada pieza es única, creada con amor y dedicación contemplativa
          </p>
        </div>

        {/* Grid de colecciones */}
        <div className="clare-grid">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.title}
              {...collection}
              delay={`${index * 100}ms`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;