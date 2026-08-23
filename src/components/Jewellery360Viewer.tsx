"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Jewellery360ViewerProps {
  images: string[];
  productName: string;
  purity?: string;
  grossWeight?: number;
}

export default function Jewellery360Viewer({
  images,
  productName,
  purity = "22KT Gold",
  grossWeight
}: Jewellery360ViewerProps) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const autoSpinRef = useRef<NodeJS.Timeout | null>(null);

  const totalFrames = images.length;
  // Calculate current frame index based on 360° angle
  const normalizedAngle = ((rotationAngle % 360) + 360) % 360;
  const currentFrame = Math.floor(normalizedAngle / (360 / Math.max(1, totalFrames)));
  const currentImage = images[currentFrame] || images[0];

  // Auto-Spin Effect: Continuous 360-degree rotation
  useEffect(() => {
    if (isAutoSpinning) {
      autoSpinRef.current = setInterval(() => {
        setRotationAngle((prev) => (prev + 4) % 360);
      }, 25);
    } else {
      if (autoSpinRef.current) clearInterval(autoSpinRef.current);
    }
    return () => {
      if (autoSpinRef.current) clearInterval(autoSpinRef.current);
    };
  }, [isAutoSpinning]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoSpinning(false);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    setRotationAngle((prev) => (prev + deltaX * 1.2) % 360);
    startXRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Swipe Handlers for Mobile/Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      setIsAutoSpinning(false);
      startXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    setRotationAngle((prev) => (prev + deltaX * 1.5) % 360);
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Control Button Handlers
  const rotateLeft = () => {
    setIsAutoSpinning(false);
    setRotationAngle((prev) => (prev - 45 + 360) % 360);
  };

  const rotateRight = () => {
    setIsAutoSpinning(false);
    setRotationAngle((prev) => (prev + 45) % 360);
  };

  const toggleAutoSpin = () => {
    setIsAutoSpinning((prev) => !prev);
  };

  return (
    <div className="relative bg-white rounded-2xl border border-[#E8E2D9] shadow-md overflow-hidden group select-none flex flex-col justify-between">
      {/* Official WHPS Brand Logo Watermark in Top Right Corner */}
      <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-amber-500/30 shadow-md flex items-center gap-1.5 pointer-events-none">
        <Image
          src="/assets/logo/whps_logo.png"
          alt="Waman Hari Pethe Sons Logo"
          width={70}
          height={24}
          className="object-contain h-5 w-auto"
        />
      </div>

      {/* 360° Interactive Angle Status Badge */}
      <div className="absolute top-3 left-3 z-20 bg-[#ED5425] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 pointer-events-none">
        <svg
          className={`w-3.5 h-3.5 ${isAutoSpinning ? "animate-spin" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        360° View ({Math.round(normalizedAngle)}°)
      </div>

      {/* Interactive 360 Viewport Container */}
      <div
        className="w-full h-80 relative flex items-center justify-center p-4 cursor-grab active:cursor-grabbing bg-radial from-amber-50/50 via-white to-neutral-50 overflow-hidden"
        style={{ perspective: "1200px" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Single Jewellery Item Image Spinning 360 Degrees in 3D Space */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `rotateY(${rotationAngle}deg)`,
            transformStyle: "preserve-3d",
            backfaceVisibility: "visible"
          }}
        >
          <Image
            src={currentImage}
            alt={productName + " 360 view " + Math.round(normalizedAngle) + " deg"}
            width={380}
            height={300}
            priority
            className="max-h-full max-w-full object-contain drop-shadow-2xl pointer-events-none"
          />
        </div>

        {/* Drag or Swipe Instruction Overlay */}
        <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-3.5 py-1.5 bg-black/80 text-white rounded-full text-[10px] font-bold tracking-widest uppercase shadow-xl">
            Drag or Swipe to Spin 360°
          </span>
        </div>
      </div>

      {/* 360° Rotational Controls */}
      <div className="px-3 py-2 bg-neutral-100 border-t border-[#E8E2D9] flex items-center justify-between gap-2 text-xs font-semibold text-neutral-700">
        <button
          onClick={rotateLeft}
          type="button"
          className="px-2.5 py-1 bg-white rounded border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-200 transition-all shadow-sm flex items-center gap-1"
          title="Rotate Left 45°"
        >
          ↺ 45° Left
        </button>

        <button
          onClick={toggleAutoSpin}
          type="button"
          className={`px-3.5 py-1 rounded text-white font-bold transition-all shadow-sm flex items-center gap-1.5 text-[11px] ${
            isAutoSpinning ? "bg-amber-600 animate-pulse" : "bg-[#ED5425] hover:bg-[#C83E13]"
          }`}
        >
          {isAutoSpinning ? "⏸ Pause 360°" : "▶ Spin 360°"}
        </button>

        <button
          onClick={rotateRight}
          type="button"
          className="px-2.5 py-1 bg-white rounded border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-200 transition-all shadow-sm flex items-center gap-1"
          title="Rotate Right 45°"
        >
          45° Right ↻
        </button>
      </div>

      {/* Product Information */}
      <div className="p-4 border-t border-[#E8E2D9] bg-[#FAF8F5]">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-[#ED5425] uppercase tracking-widest">{purity}</span>
            <h3 className="text-sm font-serif font-bold text-[#1E1E1E] mt-0.5">{productName}</h3>
          </div>
          {grossWeight && (
            <span className="text-xs font-mono font-semibold text-neutral-600 bg-white px-2 py-1 rounded border border-[#E8E2D9]">
              {grossWeight}g
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
