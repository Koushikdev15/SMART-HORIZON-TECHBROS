import JsBarcode from 'jsbarcode';

/**
 * A Code128 barcode, encoding whatever unique reference is passed in, as a
 * PNG data URL ready for `doc.addImage(...)` — same shape as the QR helper
 * already used by these PDFs. Code128 accepts the certificate/batch/receipt
 * number formats used throughout this app (letters, digits, hyphens) without
 * a checksum-digit scheme like EAN/UPC would require.
 *
 * Rendered on an off-screen canvas (never attached to the DOM) — jsbarcode
 * only needs a canvas to draw into, not one visible on the page.
 */
export function barcodeDataUrl(value: string): string | null {
  if (!value) return null;
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, value, {
      format: 'CODE128',
      width: 1.6,
      height: 46,
      margin: 4,
      displayValue: false,
      background: '#FCFAF2',
      lineColor: '#002410',
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Barcode generation failed:', err);
    return null;
  }
}
