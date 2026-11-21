import { useState } from 'react';
import { Cpu } from 'lucide-react';

interface MediaFrameProps {
  src?: string;
  alt: string;
  className?: string;
  aspectClass?: string;
}

export function MediaFrame({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-[4/3]',
}: MediaFrameProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`relative overflow-hidden bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-6 text-center ${aspectClass} ${className}`}
        role="img"
        aria-label={alt}
      >
        <Cpu className="w-8 h-8 text-slate-400 mb-2" aria-hidden="true" />
        <span className="text-xs font-medium text-slate-500 max-w-[20ch] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${aspectClass} ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover transition-transform duration-300 ease-out"
      />
    </div>
  );
}
