"use client";

import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export function SafeImage({ src, alt, className, fill, priority, sizes }: SafeImageProps) {
  const isWebUrl = src && (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/"));
  if (isWebUrl) {
    return (
      <Image 
        src={src} 
        alt={alt} 
        className={className} 
        fill={fill} 
        priority={priority} 
        sizes={sizes} 
      />
    );
  }
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className || ""} ${fill ? "absolute inset-0 w-full h-full" : ""}`} 
    />
  );
}
