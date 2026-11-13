import { useState } from 'react';
import { Leaf } from 'lucide-react';
import type { ApprovedCategory } from '../types/pantry';
import { resolveFoodImage } from '../utils/imageAssets';

interface FoodImageProps {
  src?: string;
  category?: ApprovedCategory;
  alt: string;
  className?: string;
}

export function FoodImage({ src, category, alt, className = '' }: FoodImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolved = resolveFoodImage(src, category);

  if (hasError || !resolved) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EEF3EE] text-[#1B5E3A] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Leaf className="w-8 h-8 opacity-70" aria-hidden="true" />
        <span className="mt-1.5 text-xs font-medium text-[#3B5245] px-2 text-center truncate max-w-full">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
