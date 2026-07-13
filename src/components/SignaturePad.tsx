import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Trash2 } from 'lucide-react';

interface SignaturePadProps {
  value?: string; // base64 string
  onChange: (base64: string | undefined) => void;
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Initialize and clear canvas helper
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill background with white (important for exporting clean PNG/JPG)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setHasSigned(false);
    onChange(undefined);
  };

  // Adjust canvas size and draw initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0F172A'; // Dark slate for signature ink
    }

    // If an existing value is passed, draw it on the canvas
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSigned(true);
      };
      img.src = value;
    }
  }, [value]);

  // Drawing event handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling on touch devices when drawing
    if (e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas && hasSigned) {
      // Save canvas as base64 string
      const base64Image = canvas.toDataURL('image/png');
      onChange(base64Image);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-bold text-gray-500 font-medium flex items-center gap-1">
          <PenTool className="h-3.5 w-3.5 text-[#4A6741]" />
          <span>ลายเซ็นอิเล็กทรอนิกส์แพทย์ (Doctor's Signature)</span>
        </label>
        {hasSigned && (
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs text-red-500 font-semibold hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            <span>ล้างลายเซ็น</span>
          </button>
        )}
      </div>

      <div className="relative border border-dashed border-gray-300 rounded-xl bg-white overflow-hidden shadow-inner h-32 md:h-36">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="w-full h-full cursor-crosshair touch-none"
          id="doctor-signature-canvas"
        />
        
        {!hasSigned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 select-none p-4 text-center">
            <span className="text-xs font-medium">ลากเมาส์หรือใช้นิ้วเขียนเพื่อลงลายมือชื่อที่นี่</span>
            <span className="text-[10px] text-gray-300 mt-1">(หากไม่ได้เซ็นออนไลน์ สามารถพิมพ์รายงานเพื่อนำไปเซ็นลงกระดาษจริงได้)</span>
          </div>
        )}
      </div>
    </div>
  );
}
