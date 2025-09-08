'use client';

import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

interface HomeButtonProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function HomeButton({ 
  className = '', 
  showText = true, 
  size = 'md' 
}: HomeButtonProps) {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors ${sizeClasses[size]} ${className}`}
    >
      <HomeIcon className={iconSizes[size]} />
      {showText && (
        <span className={`font-medium ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        }`}>
          홈으로
        </span>
      )}
    </Link>
  );
}
