import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eraser, PenLine } from 'lucide-react';

/**
 * A hand-drawn signature captured on a canvas, encoded as a PNG data URL —
 * the same shape a saved signature takes anywhere else in the app. No signing
 * library: this is one small canvas and a pointer-event drag, not worth a
 * dependency.
 *
 * The certificate PDF draws this bitmap where the analyst's line used to just
 * print their typed name — a real captured mark, not a font pretending to be one.
 */
export default function SignaturePad({
  value,
  onChange,
  label = 'Signature',
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);
  const [empty, setEmpty] = useState(!value);

  // Re-paint a previously saved signature (editing an existing report) once
  // the canvas has real pixel dimensions to draw into.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = value;
  }, [value]);

  const pointerPos = (canvas: HTMLCanvasElement, e: React.PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = pointerPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = pointerPos(canvas, e);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#002410';
    ctx.lineTo(x, y);
    ctx.stroke();
    hasStroke.current = true;
    setEmpty(false);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasStroke.current) onChange(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
    setEmpty(true);
    onChange(undefined);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <PenLine className="w-3.5 h-3.5" /> {label}
        </Label>
        {!empty && (
          <Button type="button" size="sm" variant="ghost" className="h-6 text-[11px] px-2" onClick={clear}>
            <Eraser className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full h-[100px] rounded-md border border-input bg-white touch-none cursor-crosshair"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <p className="text-[11px] text-muted-foreground">
        {empty ? 'Sign above with mouse, stylus or finger.' : 'Signature captured.'}
      </p>
    </div>
  );
}
