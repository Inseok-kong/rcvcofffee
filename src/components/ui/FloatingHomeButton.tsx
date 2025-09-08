'use client';

import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export function FloatingHomeButton() {
  return (
    <Link
      href="/"
      className="fixed bottom-20 right-4 z-40 bg-amber-600 text-white p-3 rounded-full shadow-lg hover:bg-amber-700 transition-all duration-200 hover:scale-110"
      title="홈으로 이동"
    >
      <HomeIcon className="h-6 w-6" />
    </Link>
  );
}
