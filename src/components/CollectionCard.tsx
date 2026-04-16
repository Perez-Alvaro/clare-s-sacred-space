import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CollectionCardProps {
  title: string;
  description: string;
  image: string;
  link?: string;
  delay?: string;
}

const CollectionCard = ({ title, description, image, link = '#', delay = '0ms' }: CollectionCardProps) => {
  const isExternal = link.startsWith('http');
  const Component = isExternal ? 'a' : Link;
  const props = isExternal ? { href: link, target: '_blank', rel: 'noopener noreferrer' } : { to: link };
  
  return (
    <Component
      {...(props as any)}
      className="clare-card group cursor-pointer animate-fade-in-up h-full flex flex-col no-underline"
      style={{ animationDelay: delay }}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden rounded-lg mb-6 aspect-square bg-slate-100">
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
      <div className="flex flex-col flex-1">
        <h3 className="text-2xl mb-3 font-medium" style={{ color: 'hsl(var(--earth))' }}>
          {title}
        </h3>
        <p className="mb-6 leading-relaxed flex-1" style={{ color: 'hsl(var(--soft-brown))' }}>
          {description}
        </p>

        {/* Botón */}
        <span
          className="inline-flex items-center gap-2 font-medium transition-all duration-300 group-hover:gap-4"
          style={{ color: 'hsl(var(--terracotta))' }}
        >
          Ver productos
          <ArrowRight size={18} />
        </span>
      </div>
    </Component>
  );
};

export default CollectionCard;