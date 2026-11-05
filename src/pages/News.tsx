import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';
import { NewsCardSkeleton } from '@/components/skeletons/NewsCardSkeleton';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string | null;
}

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false })
      .then(({ data }) => { setNews(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <Navbar />
      <div className="pt-24 pb-16 clare-container">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <p className="clare-script mb-4">Lo nuevo en CLARE</p>
            <h1 className="mb-4">Novedades</h1>
          </div>
        </RevealOnScroll>

        {loading ? (
          <NewsCardSkeleton count={3} />
        ) : news.length === 0 ? (
          <div className="text-center py-16">
            <p className="clare-script text-xl" style={{ color: 'hsl(var(--terracotta))' }}>Pronto compartiremos novedades</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-3xl mx-auto">
            {news.map((item, i) => (
              <RevealOnScroll key={item.id} delay={i * 100}>
                <article className="clare-card">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover rounded-lg mb-6" loading="lazy" />
                  )}
                  <h2 className="text-2xl mb-3" style={{ color: 'hsl(var(--earth))' }}>{item.title}</h2>
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
        )}
      </div>
      <Footer />
    </div>
  );
};

export default News;
