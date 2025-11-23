import CollectionCard from './CollectionCard';
import RevealOnScroll from './RevealOnScroll';
import oratorioImg from '@/assets/oratorio.jpg';
import llaveroImg from '@/assets/llavero.jpg';
import macrameImg from '@/assets/macrame.jpg';
import canastaImg from '@/assets/canasta.jpg';
import centroMesaImg from '@/assets/centroMesa.jpg';
import macetaImg from '@/assets/maceta.jpg';
import borlasImg from '@/assets/borlas.jpeg';
import borlasTotoraImg from '@/assets/borlasTotora.jpeg';

const Collections = () => {
  const collections = [
    {
      title: 'Oratorios de Bolsillo',
      description: 'Refugios portátiles de paz. Espacios íntimos donde tu corazón encuentra silencio y la presencia de Dios se hace compañía en medio del día.',
      image: oratorioImg,
      link: '#oratorios'
    },
    {
      title: 'Llaveros Multimedallas',
      description: 'Medallas bendecidas que te acompañan en cada paso. Pequeños recordatorios de que no caminas solo: la fe va contigo, siempre.',
      image: llaveroImg,
      link: '#llaveros'
    },
    {
      title: 'Telares en Macramé',
      description: 'Tejidos contemplativos donde cada nudo es una oración, cada hilo una conexión. Objetos que invitan a la quietud y la contemplación.',
      image: macrameImg,
      link: '#telares'
    },
    {
      title: 'Canastas a Crochet',
      description: 'Tejidas con manos pacientes y corazón orante. Cada punto sostiene historia, propósito y belleza. Elementos que ordenan tu espacio con calidez contemplativa.',
      image: canastaImg,
      link: '#canastas'
    },
    {
      title: 'Centros de Mesa',
      description: 'Detalles que transforman lo ordinario en sagrado. Cada pieza invita a la pausa, a la belleza sencilla, al encuentro con Dios en lo cotidiano.',
      image: centroMesaImg,
      link: '#centros-mesa'
    },
    {
      title: 'Portamacetas a Macramé',
      description: 'Tejidos que elevan y sostienen. Un recordatorio de que toda vida crece mejor cuando está sostenida por amor, luz y raíces profundas.',
      image: macetaImg,
      link: '#portamacetas'
    },
    {
      title: 'Borlas de Totora',
      description: 'Fibras naturales tejidas con intención devocional. Cada borla es un gesto de belleza artesanal que agrega calidez contemplativa a tus espacios.',
      image: borlasTotoraImg,
      link: '#borlas-totora'
    },
    {
      title: 'Borlas de Hilo de Seda',
      description: 'Sedas delicadas anudadas con oración. Elementos de belleza suave que acompañan tus momentos con elegancia franciscana.',
      image: borlasImg,
      link: '#borlas-seda'
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
            <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
              Cada pieza es única, creada con amor y dedicación contemplativa.
              Más que objetos, son gestos de fe tejidos a mano.
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