import Image from 'next/image';

interface CustomIconProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function CustomIcon({ 
  src, 
  alt, 
  className = "h-6 w-6", 
  width = 24, 
  height = 24 
}: CustomIconProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}

// 커피 아이콘 컴포넌트
export function CoffeeIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <CustomIcon
      src="/icon.png"
      alt="Coffee"
      className={className}
      width={24}
      height={24}
    />
  );
}
