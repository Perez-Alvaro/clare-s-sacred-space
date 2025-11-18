import { ArrowRight } from 'lucide-react';

interface CollectionCardProps {
  title: string;
  description: string;
  image: string;
  delay?: string;
}

const CollectionCard = ({ title, description, image, delay = '0ms' }: CollectionCardProps) => {
  return (
    <div 
      className="clare-card group cursor-pointer animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden rounded-lg mb-6 aspect-square">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{ backgroundColor: 'hsl(var(--terracotta))' }}
        />
      </div>

      {/* Contenido */}
      <div>
        <h3 className="text-2xl mb-3 font-medium" style={{ color: 'hsl(var(--earth))' }}>
          {title}
        </h3>
        <p className="mb-6 leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
          {description}
        </p>
        
        {/* Botón */}
        <button 
          className="inline-flex items-center gap-2 font-medium transition-all duration-300 group-hover:gap-4"
          style={{ color: 'hsl(var(--terracotta))' }}
        >
          Ver productos
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default CollectionCard;