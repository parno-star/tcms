import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, GripVertical } from 'lucide-react';

interface DraggableAiButtonProps {
  onClick: () => void;
}

export const DraggableAiButton: React.FC<DraggableAiButtonProps> = ({ onClick }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    // Initial position: bottom-right (24px padding)
    const initialX = Math.max(16, window.innerWidth - 180);
    const initialY = Math.max(16, window.innerHeight - 70);
    setPosition({ x: initialX, y: initialY });

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const clampedX = Math.min(Math.max(16, prev.x), window.innerWidth - 180);
        const clampedY = Math.min(Math.max(16, prev.y), window.innerHeight - 70);
        return { x: clampedX, y: clampedY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    if (position) {
      elementPosRef.current = { ...position };
    }

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
    }

    const newX = Math.min(Math.max(16, elementPosRef.current.x + deltaX), window.innerWidth - 180);
    const newY = Math.min(Math.max(16, elementPosRef.current.y + deltaY), window.innerHeight - 70);

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };

  if (!position) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
      }}
      className="touch-none select-none"
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        className="group flex items-center space-x-1.5 px-3.5 py-2.5 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white font-bold text-xs rounded-full shadow-2xl shadow-teal-950/40 ring-2 ring-white/90 transition-shadow duration-200 cursor-grab active:cursor-grabbing border border-teal-400/40"
        title="Tanya Starfa AI — Tahan &amp; geser untuk memindahkan posisi tombol"
      >
        <GripVertical className="w-3.5 h-3.5 text-teal-300/80 group-hover:text-white transition shrink-0" />
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
        <span className="font-semibold tracking-wide">Tanya Starfa</span>
        <span className="text-[9.5px] bg-teal-950/80 text-teal-200 px-1.5 py-0.5 rounded font-mono font-bold">
          Gemini
        </span>
      </div>
    </div>
  );
};
