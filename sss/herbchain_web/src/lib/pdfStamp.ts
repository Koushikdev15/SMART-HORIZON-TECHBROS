import type { jsPDF } from 'jspdf';

/**
 * The one trademark stamp used on every AyurTrace+ PDF — certificates and
 * payment receipts alike. Drawn as vector primitives (matching the rest of
 * these documents), not an image, so it never blurs, never needs an asset
 * file, and stays byte-identical across every certificate it's stamped on —
 * which is the point of a stamp: it's the same mark every time, not a
 * per-document decoration.
 */
const STAMP_INK = { r: 150, g: 28, b: 40 };

export function drawTrademarkStamp(doc: jsPDF, cx: number, cy: number, radius: number) {
  const setDraw = (r: number, g: number, b: number) => doc.setDrawColor(r, g, b);
  const setText = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);

  setDraw(STAMP_INK.r, STAMP_INK.g, STAMP_INK.b);
  doc.setLineWidth(0.7);
  doc.circle(cx, cy, radius, 'S');
  doc.setLineWidth(0.3);
  doc.circle(cx, cy, radius - 1.4, 'S');

  setText(STAMP_INK.r, STAMP_INK.g, STAMP_INK.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(radius * 0.82);
  doc.text('AYURTRACE+', cx, cy - radius * 0.32, { align: 'center' });

  doc.setLineWidth(0.22);
  doc.line(cx - radius + 3.5, cy - radius * 0.08, cx + radius - 3.5, cy - radius * 0.08);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(radius * 0.5);
  doc.text('BLOCKCHAIN', cx, cy + radius * 0.22, { align: 'center' });
  doc.text('VERIFIED', cx, cy + radius * 0.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(radius * 0.42);
  doc.text('GOVT. OF INDIA  *  MINISTRY OF AYUSH', cx, cy, {
    align: 'center',
    angle: 12,
  });
}
