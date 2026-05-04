import { useEffect, useRef, useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

const cache = new Map<string, string>();

const isHeic = (url?: string) => !!url && /\.(heic|heif)(\?|$)/i.test(url);

/**
 * Renders an <img> but transparently converts HEIC/HEIF files to JPEG
 * blobs in browsers that don't support them natively (Chrome, Firefox).
 */
const SmartImage = ({ src, alt, ...rest }: Props) => {
  const [resolved, setResolved] = useState<string | undefined>(
    src && isHeic(src) ? cache.get(src) : src
  );
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    if (!src) { setResolved(undefined); return; }

    if (!isHeic(src)) { setResolved(src); return; }

    const cached = cache.get(src);
    if (cached) { setResolved(cached); return; }

    (async () => {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const heic2any = (await import('heic2any')).default;
        const out = await heic2any({ blob, toType: 'image/jpeg', quality: 0.9 });
        const finalBlob = Array.isArray(out) ? out[0] : out;
        const url = URL.createObjectURL(finalBlob as Blob);
        cache.set(src, url);
        if (!cancelled.current) setResolved(url);
      } catch (e) {
        console.warn('HEIC conversion failed for', src, e);
        if (!cancelled.current) setResolved(src);
      }
    })();

    return () => { cancelled.current = true; };
  }, [src]);

  if (!resolved) {
    return <div {...(rest as any)} aria-label={alt} style={{ ...(rest.style || {}), backgroundColor: 'hsl(var(--sand))' }} />;
  }

  return <img src={resolved} alt={alt} {...rest} />;
};

export default SmartImage;
