import { Instagram, Facebook, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'hsl(var(--earth))' }}>
      <div className="clare-container py-16">
        {/* Grid principal */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Columna 1: Marca */}
          <div>
            <h3 
              className="text-3xl mb-4"
              style={{ 
                fontFamily: 'var(--font-heading)',
                color: 'hsl(var(--warm-white))' 
              }}
            >
              CLARE
            </h3>
            <p 
              className="text-sm leading-relaxed mb-6"
              style={{ color: 'hsl(var(--sand))' }}
            >
              Artes con propósito, camino y oración. 
              Creando objetos devocionales que acompañan tu camino espiritual.
            </p>
            <p 
              className="clare-script text-lg"
              style={{ color: 'hsl(var(--terracotta))' }}
            >
              Fe que se teje en cada detalle
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h4 
              className="text-lg font-medium mb-4"
              style={{ color: 'hsl(var(--warm-white))' }}
            >
              Explora
            </h4>
            <ul className="space-y-3">
              {['Colecciones', 'Nubes de Regalo', 'Nuestra Historia', 'Contacto'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                    style={{ 
                      color: 'hsl(var(--sand))',
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto y redes */}
          <div>
            <h4 
              className="text-lg font-medium mb-4"
              style={{ color: 'hsl(var(--warm-white))' }}
            >
              Conecta con nosotros
            </h4>
            <div className="space-y-4 mb-6">
              <a 
                href="mailto:contacto@clare.com"
                className="flex items-center gap-3 text-sm transition-colors duration-200"
                style={{ color: 'hsl(var(--sand))' }}
              >
                <Mail size={18} />
                contacto@clare.com
              </a>
            </div>

            {/* Redes sociales */}
            <div className="flex gap-4">
              {[
                { icon: <Instagram size={22} />, label: 'Instagram' },
                { icon: <Facebook size={22} />, label: 'Facebook' }
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ 
                    backgroundColor: 'hsl(var(--terracotta))',
                    color: 'hsl(var(--warm-white))'
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Separador */}
        <div 
          className="h-px mb-8"
          style={{ backgroundColor: 'hsl(var(--soft-brown))' }}
        />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p style={{ color: 'hsl(var(--sand))' }}>
            © {currentYear} CLARE. Todos los derechos reservados.
          </p>
          <p 
            className="flex items-center gap-2"
            style={{ color: 'hsl(var(--sand))' }}
          >
            Hecho con
            <Heart size={16} style={{ color: 'hsl(var(--terracotta))' }} fill="currentColor" />
            y devoción
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;