import type { User, ScanHistoryItem } from '@/types';

export const MOCK_USER: User = {
  id: 'user-001',
  name: 'Koushik',
  email: 'koushik@example.com',
  phone: '+91 9876543210',
  language: 'en',
  isGuest: false,
};

export const MOCK_SCAN_HISTORY: ScanHistoryItem[] = [
  {
    id: 'scan-001',
    productId: 'AYUR-PRD-PWFKFA',
    productName: 'Cinnamon Digestive Tea',
    manufacturer: 'GreenLeaf Herbal Pharma',
    batchId: 'AYUR-PRD-PWFKFA',
    scanDate: '2026-08-23',
    trustScore: 100,
    status: 'verified',
  },
  {
    id: 'scan-002',
    productId: 'AYUR-PRD-DL4Y0B',
    productName: 'Brahmi Memory Support Capsules',
    manufacturer: 'GreenLeaf Herbal Pharma',
    batchId: 'AYUR-PRD-DL4Y0B',
    scanDate: '2026-08-23',
    trustScore: 100,
    status: 'verified',
  },
  {
    id: 'scan-003',
    productId: 'AYUR-PRD-SL8F6F',
    productName: 'Amla Herbal Powder',
    manufacturer: 'AyuVeda Naturals Pvt Ltd',
    batchId: 'AYUR-PRD-SL8F6F',
    scanDate: '2026-08-22',
    trustScore: 100,
    status: 'verified',
  },
  {
    id: 'scan-004',
    productId: 'AYUR-PRD-YIL54I',
    productName: 'Ashwagandha Stress Relief Powder',
    manufacturer: 'VedaRoots Wellness Pvt Ltd',
    batchId: 'AYUR-PRD-YIL54I',
    scanDate: '2026-08-20',
    trustScore: 100,
    status: 'verified',
  },
];

export const MOCK_SAVED_PRODUCT_IDS: string[] = ['AYUR-PRD-PWFKFA', 'AYUR-PRD-DL4Y0B', 'AYUR-PRD-SL8F6F'];
