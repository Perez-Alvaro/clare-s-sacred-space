import { Instagram, Mail, Heart } from 'lucide-react';
import { toast } from 'sonner';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleHeartClick = () => {
    toast("Te quiero mucho flor, el cielo te sonrie por tu gran corazón. — Alvaro", {
      duration: 5000,
      icon: <Heart size={16} fill="hsl(var(--terracotta))" style={{ color: 'hsl(var(--terracotta))' }} />,
    });
  };

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
              Cuando la luz interior se vuelve creación; es donde la oración toma forma
            </p>
            <p
              className="clare-script text-lg"
              style={{ color: 'hsl(var(--warm-white))' }}
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
              <li>
                <a
                  href="/tienda"
                  className="text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  style={{
                    color: 'hsl(var(--sand))',
                  }}
                >
                  Tienda
                </a>
              </li>
              <li>
                <a
                  href="/novedades"
                  className="text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  style={{
                    color: 'hsl(var(--sand))',
                  }}
                >
                  Novedades
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/3534259493"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  style={{
                    color: 'hsl(var(--sand))',
                  }}
                >
                  Contacto
                </a>
              </li>
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
                href="mailto:florenciaseia67@gmail.com"
                className="flex items-center gap-3 text-sm transition-colors duration-200"
                style={{ color: 'hsl(var(--sand))' }}
              >
                <Mail size={18} />
                florenciaseia67@gmail.com
              </a>
            </div>

            {/* Redes sociales */}
            <div className="flex gap-4 items-center">
              <a
                href="https://www.instagram.com/clare.hm_/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  backgroundColor: 'hsl(var(--terracotta))',
                  color: 'hsl(var(--warm-white))'
                }}
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
              <span className="text-sm" style={{ color: 'hsl(var(--sand))' }}>@clare.hm_</span>
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
          <button
            onClick={handleHeartClick}
            className="flex items-center gap-2 transition-all duration-300 hover:scale-110 active:scale-90"
            style={{ color: 'hsl(var(--sand))' }}
          >
            Hecho con
            <Heart size={16} className="text-red-300 transition-colors hover:text-red-400" fill="currentColor" />
            y devoción
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;