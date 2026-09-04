import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { Payment } from '../types';
import { drawTrademarkStamp } from './pdfStamp';

/**
 * Payment receipt, drawn as vector primitives — same engine and visual
 * language as certificatePdf.ts, so the two read as one document family.
 *
 * This is the proof of sale a farmer, wild collector, processor or
 * manufacturer can point to: money changed hands, for this batch, at this
 * stage, and the record is on the ledger. One receipt per Payment row.
 */

const INK = { r: 0, g: 36, b: 16 };
const BAND = { r: 11, g: 59, b: 32 };
const GOLD = { r: 201, g: 154, b: 46 };
const SAGE = { r: 122, g: 158, b: 126 };
const PAPER = { r: 252, g: 250, b: 242 };
const MUTED = { r: 108, g: 118, b: 110 };
const STATUS_COLOR: Record<Payment['status'], { r: number; g: number; b: number }> = {
  Released: { r: 46, g: 106, b: 65 },
  Pending: { r: 180, g: 130, b: 20 },
  'On Hold': { r: 180, g: 130, b: 20 },
  Failed: { r: 186, g: 26, b: 26 },
};

const PAGE_W = 210;
const PAGE_H = 297;
const M = 16;
const BAND_H = 38;
const FOOTER_H = 16;

const setFill = (d: jsPDF, c: { r: number; g: number; b: number }) => d.setFillColor(c.r, c.g, c.b);
const setText = (d: jsPDF, c: { r: number; g: number; b: number }) => d.setTextColor(c.r, c.g, c.b);
const setDraw = (d: jsPDF, c: { r: number; g: number; b: number }) => d.setDrawColor(c.r, c.g, c.b);

function guilloche(doc: jsPDF, cx: number, cy: number, rings: number, radius: number) {
  doc.setLineWidth(0.12);
  setDraw(doc, SAGE);
  for (let i = 0; i < rings; i++) doc.circle(cx, cy, radius * (1 - i / rings), 'S');
}

function heading(doc: jsPDF, label: string, y: number, width: number) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setText(doc, INK);
  doc.text(label, M, y);
  setDraw(doc, GOLD);
  doc.setLineWidth(0.4);
  doc.line(M, y + 1.6, M + width, y + 1.6);
}

/** Builds the document. Split from the save step so it can be exercised in tests. */
export async function buildReceipt(payment: Payment): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFont('helvetica');

  setFill(doc, PAPER);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  guilloche(doc, 8, 150, 6, 7);
  guilloche(doc, PAGE_W - 8, 150, 6, 7);

  // ── Masthead ────────────────────────────────────────────────────────────
  setFill(doc, BAND);
  doc.rect(0, 0, PAGE_W, BAND_H, 'F');
  setFill(doc, GOLD);
  doc.rect(0, BAND_H, PAGE_W, 1.2, 'F');

  setText(doc, { r: 255, g: 255, b: 255 });
  doc.setFontSize(19);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', M, 17);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setText(doc, { r: 170, g: 205, b: 180 });
  doc.text('HerbChain · AyurTrace+  |  Ministry of AYUSH, Government of India', M, 24);
  doc.text('Blockchain-recorded proof of payment across the supply chain', M, 29.5);

  doc.setFontSize(7.5);
  setText(doc, GOLD);
  doc.text('RECEIPT NO.', PAGE_W - M, 15, { align: 'right' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setText(doc, { r: 255, g: 255, b: 255 });
  doc.text(payment.id, PAGE_W - M, 21, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  setText(doc, { r: 170, g: 205, b: 180 });
  const issued = payment.releasedAt ? new Date(payment.releasedAt) : new Date(payment.createdAt);
  doc.text(`Issued ${issued.toLocaleDateString('en-IN')}`, PAGE_W - M, 27, { align: 'right' });

  let y = BAND_H + 12;

  // ── Transaction identification ───────────────────────────────────────────
  heading(doc, 'TRANSACTION DETAILS', y, 55);
  y += 8;

  const facts: [string, string][] = [
    ['Batch Number', payment.batchNumber || payment.batchId],
    ['Species', payment.species || '—'],
    ['Supply Chain Stage', payment.stage],
    ['Payment Method', payment.method || '—'],
    ['Paid By', `${payment.payerName || '—'}${payment.payerRole ? ` (${payment.payerRole})` : ''}`],
    ['Paid To', `${payment.recipient} (${payment.recipientRole})`],
    ['Date Recorded', new Date(payment.createdAt).toLocaleDateString('en-IN')],
    ['Released On', payment.releasedAt ? new Date(payment.releasedAt).toLocaleDateString('en-IN') : 'Not yet released'],
  ];

  const COLS = 2;
  const colW = (PAGE_W - M * 2) / COLS;
  facts.forEach(([label, value], i) => {
    const x = M + (i % COLS) * colW;
    const ly = y + Math.floor(i / COLS) * 9;
    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    setText(doc, MUTED);
    doc.text(label.toUpperCase(), x, ly);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setText(doc, INK);
    doc.text(doc.splitTextToSize(String(value), colW - 6)[0] ?? '—', x, ly + 4.5);
  });
  y += Math.ceil(facts.length / COLS) * 9 + 6;

  // ── Amount ────────────────────────────────────────────────────────────────
  const statusColor = STATUS_COLOR[payment.status];
  setFill(doc, statusColor);
  doc.roundedRect(M, y, PAGE_W - M * 2, 26, 2.5, 2.5, 'F');
  setText(doc, { r: 255, g: 255, b: 255 });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('AMOUNT', M + 6, y + 9);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `${payment.currency === 'INR' || !payment.currency ? '₹' : payment.currency + ' '}${payment.amount.toLocaleString('en-IN')}`,
    M + 6,
    y + 19,
  );
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(payment.status.toUpperCase(), PAGE_W - M - 6, y + 15, { align: 'right' });
  y += 34;

  if (payment.remarks) {
    doc.setFontSize(8);
    const lines: string[] = doc.splitTextToSize(`Remarks: ${payment.remarks}`, PAGE_W - M * 2);
    doc.setFont('helvetica', 'italic');
    setText(doc, MUTED);
    doc.text(lines, M, y);
    y += lines.length * 3.8 + 4;
  }

  // ── Blockchain verification ──────────────────────────────────────────────
  const VERIFY_H = 20;
  const verifyY = y + 4;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayurtrace.in';
  const verifyUrl = `${origin}/verify/${payment.batchNumber || payment.batchId}`;

  try {
    const qr = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 256, color: { dark: '#002410', light: '#FCFAF2' } });
    doc.addImage(qr, 'PNG', PAGE_W - M - VERIFY_H, verifyY, VERIFY_H, VERIFY_H);
  } catch {
    // A missing QR must not block the receipt.
  }

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  setText(doc, INK);
  doc.text('BLOCKCHAIN VERIFICATION', M, verifyY + 4);
  doc.setFont('helvetica', 'normal');
  setText(doc, MUTED);
  doc.setFontSize(6.8);
  doc.text(`Payment record: ${payment.id}`, M, verifyY + 9);
  let vy = verifyY + 13;
  if (payment.blockchainTxId) {
    doc.text(`Tx hash: ${doc.splitTextToSize(payment.blockchainTxId, 110)[0]}`, M, vy);
    vy += 4;
  }
  doc.text(doc.splitTextToSize(`Scan to verify batch: ${verifyUrl}`, 110)[0], M, vy);

  // ── Sign-off + stamp ──────────────────────────────────────────────────────
  const SIG_Y = PAGE_H - FOOTER_H - 22;
  drawTrademarkStamp(doc, PAGE_W / 2, SIG_Y - 10, 7.5);

  setDraw(doc, INK);
  doc.setLineWidth(0.3);
  doc.line(M, SIG_Y, M + 55, SIG_Y);
  doc.line(PAGE_W - M - 55, SIG_Y, PAGE_W - M, SIG_Y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setText(doc, INK);
  doc.text(payment.recipient, M, SIG_Y + 4.5);
  doc.text(payment.payerName || 'Authorised Signatory', PAGE_W - M, SIG_Y + 4.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setText(doc, MUTED);
  doc.text('Received by', M, SIG_Y + 8.8);
  doc.text('Paid by', PAGE_W - M, SIG_Y + 8.8, { align: 'right' });

  // ── Footer ────────────────────────────────────────────────────────────────
  setFill(doc, BAND);
  doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, 'F');
  setFill(doc, GOLD);
  doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, 0.8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  setText(doc, { r: 170, g: 205, b: 180 });
  doc.text(
    'This receipt relates only to the transaction identified above. Recorded on the AyurTrace+ ledger',
    PAGE_W / 2,
    PAGE_H - 10,
    { align: 'center' },
  );
  doc.text(
    'and may be independently verified by scanning the code. Reproduction except in full is not permitted.',
    PAGE_W / 2,
    PAGE_H - 6.5,
    { align: 'center' },
  );
  doc.text(payment.id, M, PAGE_H - 3.2);
  doc.text('Page 1 of 1', PAGE_W - M, PAGE_H - 3.2, { align: 'right' });

  return doc;
}

export function receiptFileName(payment: Payment): string {
  return `${payment.id}-payment-receipt.pdf`;
}

export async function generateReceiptPdf(payment: Payment): Promise<void> {
  const doc = await buildReceipt(payment);
  doc.save(receiptFileName(payment));
}
