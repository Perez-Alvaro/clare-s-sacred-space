import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import RevealOnScroll from '@/components/RevealOnScroll';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string | null;
}

const NewsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false })
      .then(({ data }) => { setNews(data || []); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <section className="clare-section" id="novedades">
        <div className="clare-container">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <h2 className="mb-4">Enterate de las novedades en CLARE</h2>
            </div>
          </RevealOnScroll>
          <div className="space-y-8 max-w-3xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="clare-card animate-pulse">
                <div className="h-48 rounded-lg mb-4" style={{ backgroundColor: 'hsl(var(--sand))' }} />
                <div className="h-5 rounded w-2/3 mb-2" style={{ backgroundColor: 'hsl(var(--sand))' }} />
                <div className="h-3 rounded w-full" style={{ backgroundColor: 'hsl(var(--sand))' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) return null;

  return (
    <section className="clare-section" id="novedades" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
      <div className="clare-container">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <h2 className="mb-4">Enterate de las novedades en CLARE</h2>
          </div>
        </RevealOnScroll>

        <div className="space-y-8 max-w-3xl mx-auto">
          {news.map((item, i) => (
            <RevealOnScroll key={item.id} delay={i * 100}>
              <article className="clare-card">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover rounded-lg mb-6" loading="lazy" />
                )}
                <h3 className="text-2xl mb-3" style={{ color: 'hsl(var(--earth))' }}>{item.title}</h3>
                {item.published_at && (
                  <p className="text-xs mb-3" style={{ color: 'hsl(var(--soft-brown))' }}>
                    {new Date(item.published_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
                {item.excerpt && <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>{item.excerpt}</p>}
                {item.content && (
                  <div className="mt-4 text-sm leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
                    {item.content.split('\n').map((p, idx) => <p key={idx} className="mb-2">{p}</p>)}
                  </div>
                )}
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
