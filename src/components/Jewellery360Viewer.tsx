"use client";

import { useState, useRef } from "react";

interface Jewellery360ViewerProps {
  images: string[];
  productName: string;
  purity?: string;
  grossWeight?: number;
}

export default function Jewellery360Viewer({ images, productName, purity = "22KT Gold", grossWeight }: Jewellery360ViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const totalFrames = images.length;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || totalFrames <= 1) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 15) {
      if (deltaX > 0) {
        setCurrentFrame((prev) => (prev + 1) % totalFrames);
      } else {
        setCurrentFrame((prev) => (prev - 1 + totalFrames) % totalFrames);
      }
      startXRef.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden group select-none cursor-grab active:cursor-grabbing">
      {/* Small WHPS Brand Logo Watermark in Top Right Corner */}
      <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-amber-500/30 flex items-center gap-1.5 shadow-md">
        <span className="text-amber-400 font-serif text-[11px] font-bold">वामन हरी पेटे सन्स</span>
        <span className="text-amber-200/70 text-[9px] font-mono">• 1909</span>
      </div>

      {/* 360 Degree Interactive Indicator Badge */}
      <div className="absolute top-3 left-3 z-20 bg-[#ED5425] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
        <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        360° View
      </div>

      {/* Image Display */}
      <div
        className="w-full h-80 relative flex items-center justify-center p-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={images[currentFrame] || images[0]}
          alt={`${productName} 360 view frame ${currentFrame + 1}`}
          className="max-h-full max-w-full object-contain drop-shadow-md transition-all duration-150"
        />

        {/* Drag Direction Hint */}
        <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-3 py-1 bg-black/70 text-white rounded-full text-[10px] font-semibold tracking-wider uppercase">
            Drag to Rotate 360°
          </span>
        </div>
      </div>

      {/* Product Card Details */}
      <div className="p-4 border-t border-[#E8E2D9] bg-[#FAF8F5]">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-[#ED5425] uppercase tracking-widest">{purity}</span>
            <h3 className="text-sm font-serif font-bold text-[#1E1E1E] mt-0.5">{productName}</h3>
          </div>
          {grossWeight && (
            <span className="text-xs font-mono font-semibold text-neutral-500 bg-white px-2 py-1 rounded border border-[#E8E2D9]">
              {grossWeight}g
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
