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
      description: 'Es un pequeño objeto portátil pensado para crear un instante íntimo de recogimiento en medio de la vida diaria. Es como llevar un mini refugio simbólico siempre a mano: un espacio interior reducido a su mínima expresión, pero lleno de sentido.',
      image: oratorioImg,
      link: '#oratorios'
    },
    {
      title: 'Llaveros Multimedallas',
      description: 'Tejidos con hilo de seda, que contienen 6 medallas variadas, entre ellas de la Sagrada Familia, Espíritu Santo, Sagrado Corazón de Jesús, Rostro de Jesús, Virgen del Escapulario, Virgen de Luján, Cruz. Un detalle que te recuerda que no caminas solo!',
      image: llaveroImg,
      link: '#llaveros'
    },
    {
      title: 'Telares en Macramé',
      description: 'Tejidos a mano, en tronco natural. Un objeto de decoración para tus espacios, que te invitan a la contemplación y a la calma.',
      image: macrameImg,
      link: '#telares'
    },
    {
      title: 'Canastas a Crochet',
      description: 'Tejidas con cordón de algodón, sobre una base de MDF pintada. Pensada para decorar tu mesa o colocar el equipo de mate.',
      image: canastaImg,
      link: '#canastas'
    },
    {
      title: 'Centros de Mesa',
      description: 'Tejidos a mano, en hilo macramé o papel Kraft, pensado para darle un toque distinto a tus espacios.',
      image: centroMesaImg,
      link: '#centros-mesa'
    },
    {
      title: 'Portamacetas a Macramé',
      description: 'Pensado para colocar tus macetas y revestir cada espacio con naturaleza.',
      image: macetaImg,
      link: '#portamacetas'
    },
    {
      title: 'Borlas de Totora',
      description: 'Tejidas a crochet en distintos colores, con detalles en bolas de madera, y distintas medallas. Pensadas darle a tus puertas, un detalle único.',
      image: borlasTotoraImg,
      link: '#borlas-totora'
    },
    {
      title: 'Borlas de Hilo de Seda',
      description: 'Tejidas a mano sobre un aro de madera, en distintos colores, con detalles colgantes de madera, y una medalla. Pensadas darle a tus puertas, un detalle único.',
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
              Cada pieza es única, creada artesanalmente con amor y dedicación.
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