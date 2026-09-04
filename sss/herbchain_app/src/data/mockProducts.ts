// Real, blockchain-traced product data synced from the AyurTrace+ traceability
// portal (public.products in Supabase) — not fictional demo content. See
// herbchain_backend/scripts/generate-mock-products.ts (deleted after running;
// see git history to regenerate) for how this file is produced and what is
// genuinely computed vs. honestly left unverified (blockchain fields).
import type { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    "id": "AYUR-PRD-FLOWTS",
    "name": "FLOWTEST Polyherbal Capsules",
    "type": "Capsule",
    "manufacturer": "FLOWTEST Unit",
    "batchId": "AYUR-PRD-FLOWTS",
    "manufacturingDate": "2026-08-21",
    "expiryDate": "2028-08-21",
    "netQuantity": "60 capsules",
    "formulation": "Proprietary polyherbal",
    "status": "verified",
    "trustScore": 90,
    "ingredients": [
      {
        "id": "AYUR-PRD-FLOWTS-ing-1",
        "commonName": "Kutki",
        "scientificName": "Picrorhiza kurroa",
        "plantPart": "Root/rhizome",
        "source": "Namakkal Village, Namakkal District, Tamil Nadu - 637001",
        "sourceRegion": "Namakkal Village, Namakkal District, Tamil Nadu - 637001",
        "status": "verified",
        "harvestDate": "2026-08-13",
        "processing": "Collected by Farmer via Anamalai Herb Collection Hub.",
        "quality": "Lab Certified — CERT-SYN-26-2017",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Kutki (Picrorhiza kurroa) is a bitter Himalayan root traditionally used in Ayurveda to support liver function and healthy digestion."
      },
      {
        "id": "AYUR-PRD-FLOWTS-ing-2",
        "commonName": "Clove",
        "scientificName": "Syzygium aromaticum",
        "plantPart": "Flower bud",
        "source": "Gobichettipalayam Village, Erode District, Tamil Nadu - 638452",
        "sourceRegion": "Gobichettipalayam Village, Erode District, Tamil Nadu - 638452",
        "status": "verified",
        "harvestDate": "2026-08-10",
        "processing": "Collected by Farmer via Kongu Ayurvedic Raw Material Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2013",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Clove (Syzygium aromaticum) is an aromatic flower bud traditionally used in Ayurveda to support digestion and oral wellness."
      }
    ],
    "origin": {
      "sourceRegion": "Namakkal Village, Namakkal District, Tamil Nadu - 637001",
      "district": "Tamil Nadu",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.1271,
      "longitude": 78.6569
    },
    "timeline": [
      {
        "id": "AYUR-PRD-FLOWTS-tl-1",
        "stage": "Manufacturing",
        "location": "FLOWTEST Unit",
        "date": "2026-08-21",
        "status": "Completed",
        "icon": "package",
        "details": "Released from 2 batches."
      },
      {
        "id": "AYUR-PRD-FLOWTS-tl-2",
        "stage": "Supply Chain",
        "location": "FLOWTEST SC",
        "date": "2026-08-28",
        "status": "In Progress",
        "icon": "truck",
        "details": "In Transit to FLOWTEST Distributor."
      },
      {
        "id": "AYUR-PRD-FLOWTS-tl-3",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to FLOWTEST Distributor, Coimbatore — vehicle TN-38-ZZ-0001."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-FLOWTS-lr-2",
        "test": "Moisture Content",
        "result": "4.2",
        "status": "passed",
        "date": "2026-08-21",
        "laboratory": "FLOWTEST Unit",
        "reportReference": "CERT-SYN-26-2017"
      },
      {
        "id": "AYUR-PRD-FLOWTS-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-21",
        "laboratory": "FLOWTEST Unit",
        "reportReference": "CERT-SYN-26-2017"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 87,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 60
    },
    "safety": {
      "storage": "Below 25 C",
      "warnings": "No specific warnings documented for this product.",
      "expiry": "2028-08-21",
      "usage": "1-2 capsules twice daily",
      "contraindications": "None documented."
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 60,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": false,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-BRGCOM",
    "name": "Amla Immunity Juice",
    "type": "Syrup",
    "manufacturer": "AyuVeda Naturals Pvt Ltd",
    "batchId": "AYUR-PRD-BRGCOM",
    "manufacturingDate": "2026-08-22",
    "expiryDate": "2027-08-22",
    "netQuantity": "200 mL bottle",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-BRGCOM-ing-1",
        "commonName": "Amla (Indian Gooseberry)",
        "scientificName": "Phyllanthus emblica",
        "plantPart": "Fruit",
        "source": "Sathyamangalam Tiger Reserve Buffer, Erode",
        "sourceRegion": "Sathyamangalam Tiger Reserve Buffer, Erode",
        "status": "verified",
        "harvestDate": "2026-07-16",
        "processing": "Collected by Wild Collector via Western Ghats Herbal Collection Centre.",
        "quality": "Lab Certified — LAB-2026-7658",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Amla (Phyllanthus emblica), or Indian Gooseberry, is one of the richest natural sources of Vitamin C and a key ingredient in classical Ayurvedic formulations such as Chyawanprash."
      },
      {
        "id": "AYUR-PRD-BRGCOM-ing-2",
        "commonName": "Amla (Indian Gooseberry)",
        "scientificName": "Phyllanthus emblica",
        "plantPart": "Fruit",
        "source": "Sirumalai Hills, Dindigul",
        "sourceRegion": "Sirumalai Hills, Dindigul",
        "status": "verified",
        "harvestDate": "2026-08-06",
        "processing": "Collected by Wild Collector via Erode Herbal Aggregation Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2006",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Amla (Phyllanthus emblica), or Indian Gooseberry, is one of the richest natural sources of Vitamin C and a key ingredient in classical Ayurvedic formulations such as Chyawanprash."
      },
      {
        "id": "AYUR-PRD-BRGCOM-ing-3",
        "commonName": "Amla (Indian Gooseberry)",
        "scientificName": "Phyllanthus emblica",
        "plantPart": "Fruit",
        "source": "Mettupalayam Village, Coimbatore District, Tamil Nadu - 641301",
        "sourceRegion": "Mettupalayam Village, Coimbatore District, Tamil Nadu - 641301",
        "status": "verified",
        "harvestDate": "2026-08-12",
        "processing": "Collected by Farmer via Anamalai Herb Collection Hub.",
        "quality": "Lab Certified — CERT-SYN-26-2016",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Amla (Phyllanthus emblica), or Indian Gooseberry, is one of the richest natural sources of Vitamin C and a key ingredient in classical Ayurvedic formulations such as Chyawanprash."
      }
    ],
    "origin": {
      "sourceRegion": "Sathyamangalam Tiger Reserve Buffer, Erode",
      "district": "Erode",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.341,
      "longitude": 77.7172
    },
    "timeline": [
      {
        "id": "AYUR-PRD-BRGCOM-tl-1",
        "stage": "Manufacturing",
        "location": "AyuVeda Naturals Pvt Ltd",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Amla Immunity Juice released from 3 batches (BATCH-2026-7658, BATCH-2026-9674, BATCH-2026-5143)."
      },
      {
        "id": "AYUR-PRD-BRGCOM-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "In Progress",
        "icon": "truck",
        "details": "In Transit to MindWell Pharmacy, Chennai — vehicle TN-39-AB-1829."
      },
      {
        "id": "AYUR-PRD-BRGCOM-tl-3",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to MindWell Pharmacy, Chennai — vehicle TN-39-AB-1829."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-BRGCOM-lr-1",
        "test": "Assay",
        "result": "Vitamin C ≥ 2.5%",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "AyuVeda Naturals Pvt Ltd",
        "reportReference": "LAB-2026-7658"
      },
      {
        "id": "AYUR-PRD-BRGCOM-lr-2",
        "test": "Moisture Content",
        "result": "≤1.5%",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "AyuVeda Naturals Pvt Ltd",
        "reportReference": "LAB-2026-7658"
      },
      {
        "id": "AYUR-PRD-BRGCOM-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "AyuVeda Naturals Pvt Ltd",
        "reportReference": "LAB-2026-7658"
      },
      {
        "id": "AYUR-PRD-BRGCOM-lr-4",
        "test": "Stability Study",
        "result": "12 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "AyuVeda Naturals Pvt Ltd",
        "reportReference": "LAB-2026-7658"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store below 25°C, away from direct sunlight",
      "warnings": "Avoid if allergic to amla; consult physician during pregnancy",
      "expiry": "2027-08-22",
      "usage": "10–20 mL twice daily after meals",
      "contraindications": "Avoid if allergic to amla; consult physician during pregnancy"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-SL8F6F",
    "name": "Amla Herbal Powder",
    "type": "Powder / Churna",
    "manufacturer": "AyuVeda Naturals Pvt Ltd",
    "batchId": "AYUR-PRD-SL8F6F",
    "manufacturingDate": "2026-08-20",
    "expiryDate": "2028-08-20",
    "netQuantity": "100 g pouch",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-SL8F6F-ing-1",
        "commonName": "Amla (Indian Gooseberry)",
        "scientificName": "Phyllanthus emblica",
        "plantPart": "Fruit",
        "source": "Sathyamangalam Tiger Reserve Buffer, Erode",
        "sourceRegion": "Sathyamangalam Tiger Reserve Buffer, Erode",
        "status": "verified",
        "harvestDate": "2026-07-16",
        "processing": "Collected by Wild Collector via Western Ghats Herbal Collection Centre.",
        "quality": "Lab Certified — LAB-2026-7658",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Amla (Phyllanthus emblica), or Indian Gooseberry, is one of the richest natural sources of Vitamin C and a key ingredient in classical Ayurvedic formulations such as Chyawanprash."
      },
      {
        "id": "AYUR-PRD-SL8F6F-ing-2",
        "commonName": "Amla (Indian Gooseberry)",
        "scientificName": "Phyllanthus emblica",
        "plantPart": "Fruit",
        "source": "Sirumalai Hills, Dindigul",
        "sourceRegion": "Sirumalai Hills, Dindigul",
        "status": "verified",
        "harvestDate": "2026-08-06",
        "processing": "Collected by Wild Collector via Erode Herbal Aggregation Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2006",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Amla (Phyllanthus emblica), or Indian Gooseberry, is one of the richest natural sources of Vitamin C and a key ingredient in classical Ayurvedic formulations such as Chyawanprash."
      }
    ],
    "origin": {
      "sourceRegion": "Sathyamangalam Tiger Reserve Buffer, Erode",
      "district": "Erode",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.341,
      "longitude": 77.7172
    },
    "timeline": [
      {
        "id": "AYUR-PRD-SL8F6F-tl-1",
        "stage": "Manufacturing",
        "location": "AyuVeda Naturals Pvt Ltd",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Amla Herbal Powder released from 2 batches (BATCH-2026-7658, BATCH-2026-9674)."
      },
      {
        "id": "AYUR-PRD-SL8F6F-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to Traditional Wellness Hub, Coimbatore — vehicle TN-40-AB-1866."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-SL8F6F-lr-1",
        "test": "Assay",
        "result": "Amla extract ≥ 5%",
        "status": "passed",
        "date": "2026-08-20",
        "laboratory": "AyuVeda Naturals Pvt Ltd",
        "reportReference": "LAB-2026-7658"
      },
      {
        "id": "AYUR-PRD-SL8F6F-lr-2",
        "test": "Moisture Content",
        "result": "≤8.0%",
        "status": "passed",
        "date": "2026-08-20",
        "laboratory": "AyuVeda Naturals Pvt Ltd",
        "reportReference": "LAB-2026-7658"
      },
      {
        "id": "AYUR-PRD-SL8F6F-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-20",
        "laboratory": "AyuVeda Naturals Pvt Ltd",
        "reportReference": "LAB-2026-7658"
      },
      {
        "id": "AYUR-PRD-SL8F6F-lr-4",
        "test": "Stability Study",
        "result": "24 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-20",
        "laboratory": "AyuVeda Naturals Pvt Ltd",
        "reportReference": "LAB-2026-7658"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store in a cool, dry place",
      "warnings": "Avoid in case of known amla allergy",
      "expiry": "2028-08-20",
      "usage": "3–5 g once or twice daily with water",
      "contraindications": "Avoid in case of known amla allergy"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-2PV1PI",
    "name": "Shatavari Wellness Powder",
    "type": "Powder / Churna",
    "manufacturer": "VedaRoots Wellness Pvt Ltd",
    "batchId": "AYUR-PRD-2PV1PI",
    "manufacturingDate": "2026-08-14",
    "expiryDate": "2028-08-14",
    "netQuantity": "100 g pouch",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-2PV1PI-ing-1",
        "commonName": "Shatavari",
        "scientificName": "Asparagus racemosus",
        "plantPart": "Root",
        "source": "Nilgiri Biosphere Reserve, Nilgiris",
        "sourceRegion": "Nilgiri Biosphere Reserve, Nilgiris",
        "status": "verified",
        "harvestDate": "2026-07-20",
        "processing": "Collected by Wild Collector via Western Ghats Herbal Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1001",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Shatavari (Asparagus racemosus), meaning \"she who possesses a hundred roots,\" is a Rasayana traditionally used in Ayurveda to support women’s reproductive health and overall vitality."
      },
      {
        "id": "AYUR-PRD-2PV1PI-ing-2",
        "commonName": "Brahmi",
        "scientificName": "Bacopa monnieri",
        "plantPart": "Whole plant",
        "source": "Kalakkad-Mundanthurai Buffer, Tirunelveli",
        "sourceRegion": "Kalakkad-Mundanthurai Buffer, Tirunelveli",
        "status": "verified",
        "harvestDate": "2026-08-08",
        "processing": "Collected by Wild Collector via Erode Herbal Aggregation Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2007",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Brahmi (Bacopa monnieri) is a Medhya Rasayana in Ayurveda — a class of herbs traditionally used to support memory, focus, and cognitive wellness."
      }
    ],
    "origin": {
      "sourceRegion": "Nilgiri Biosphere Reserve, Nilgiris",
      "district": "Tamil Nadu",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.1271,
      "longitude": 78.6569
    },
    "timeline": [
      {
        "id": "AYUR-PRD-2PV1PI-tl-1",
        "stage": "Manufacturing",
        "location": "VedaRoots Wellness Pvt Ltd",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Shatavari Wellness Powder released from 2 batches (BATCH-2026-5046, BATCH-2026-7247)."
      },
      {
        "id": "AYUR-PRD-2PV1PI-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to NatureGlow Retail, Coimbatore — vehicle TN-43-AB-1681."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-2PV1PI-lr-1",
        "test": "Assay",
        "result": "Shatavari marker ≥ 2.0%",
        "status": "passed",
        "date": "2026-08-14",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      },
      {
        "id": "AYUR-PRD-2PV1PI-lr-2",
        "test": "Moisture Content",
        "result": "≤7.0%",
        "status": "passed",
        "date": "2026-08-14",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      },
      {
        "id": "AYUR-PRD-2PV1PI-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-14",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      },
      {
        "id": "AYUR-PRD-2PV1PI-lr-4",
        "test": "Stability Study",
        "result": "24 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-14",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store below 25°C in a dry place",
      "warnings": "Consult a professional for hormone-sensitive conditions",
      "expiry": "2028-08-14",
      "usage": "3–5 g daily with warm milk/water",
      "contraindications": "Consult a professional for hormone-sensitive conditions"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-O84CH3",
    "name": "Shatavari Women's Health Capsules",
    "type": "Capsule",
    "manufacturer": "VedaRoots Wellness Pvt Ltd",
    "batchId": "AYUR-PRD-O84CH3",
    "manufacturingDate": "2026-08-12",
    "expiryDate": "2028-08-12",
    "netQuantity": "60 Capsules",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-O84CH3-ing-1",
        "commonName": "Shatavari",
        "scientificName": "Asparagus racemosus",
        "plantPart": "Root",
        "source": "Nilgiri Biosphere Reserve, Nilgiris",
        "sourceRegion": "Nilgiri Biosphere Reserve, Nilgiris",
        "status": "verified",
        "harvestDate": "2026-07-20",
        "processing": "Collected by Wild Collector via Western Ghats Herbal Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1001",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Shatavari (Asparagus racemosus), meaning \"she who possesses a hundred roots,\" is a Rasayana traditionally used in Ayurveda to support women’s reproductive health and overall vitality."
      },
      {
        "id": "AYUR-PRD-O84CH3-ing-2",
        "commonName": "Brahmi",
        "scientificName": "Bacopa monnieri",
        "plantPart": "Whole plant",
        "source": "Kalakkad-Mundanthurai Buffer, Tirunelveli",
        "sourceRegion": "Kalakkad-Mundanthurai Buffer, Tirunelveli",
        "status": "verified",
        "harvestDate": "2026-08-08",
        "processing": "Collected by Wild Collector via Erode Herbal Aggregation Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2007",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Brahmi (Bacopa monnieri) is a Medhya Rasayana in Ayurveda — a class of herbs traditionally used to support memory, focus, and cognitive wellness."
      }
    ],
    "origin": {
      "sourceRegion": "Nilgiri Biosphere Reserve, Nilgiris",
      "district": "Tamil Nadu",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.1271,
      "longitude": 78.6569
    },
    "timeline": [
      {
        "id": "AYUR-PRD-O84CH3-tl-1",
        "stage": "Manufacturing",
        "location": "VedaRoots Wellness Pvt Ltd",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Shatavari Women's Health Capsules released from 2 batches (BATCH-2026-5046, BATCH-2026-7247)."
      },
      {
        "id": "AYUR-PRD-O84CH3-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "In Progress",
        "icon": "truck",
        "details": "In Transit to Spice Wellness Traders, Chennai — vehicle TN-44-AB-1718."
      },
      {
        "id": "AYUR-PRD-O84CH3-tl-3",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to Spice Wellness Traders, Chennai — vehicle TN-44-AB-1718."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-O84CH3-lr-1",
        "test": "Assay",
        "result": "Shatavari marker ≥ 2.0%",
        "status": "passed",
        "date": "2026-08-12",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      },
      {
        "id": "AYUR-PRD-O84CH3-lr-2",
        "test": "Moisture Content",
        "result": "≤5.0%",
        "status": "passed",
        "date": "2026-08-12",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      },
      {
        "id": "AYUR-PRD-O84CH3-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-12",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      },
      {
        "id": "AYUR-PRD-O84CH3-lr-4",
        "test": "Stability Study",
        "result": "24 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-12",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Keep tightly closed, dry and cool",
      "warnings": "Pregnancy/lactation use only with professional advice",
      "expiry": "2028-08-12",
      "usage": "1 capsule twice daily after meals",
      "contraindications": "Pregnancy/lactation use only with professional advice"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-R13F9J",
    "name": "Shatavari Herbal Tea",
    "type": "Powder / Churna",
    "manufacturer": "VedaRoots Wellness Pvt Ltd",
    "batchId": "AYUR-PRD-R13F9J",
    "manufacturingDate": "2026-08-10",
    "expiryDate": "2028-08-10",
    "netQuantity": "50 g pouch",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-R13F9J-ing-1",
        "commonName": "Shatavari",
        "scientificName": "Asparagus racemosus",
        "plantPart": "Root",
        "source": "Nilgiri Biosphere Reserve, Nilgiris",
        "sourceRegion": "Nilgiri Biosphere Reserve, Nilgiris",
        "status": "verified",
        "harvestDate": "2026-07-20",
        "processing": "Collected by Wild Collector via Western Ghats Herbal Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1001",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Shatavari (Asparagus racemosus), meaning \"she who possesses a hundred roots,\" is a Rasayana traditionally used in Ayurveda to support women’s reproductive health and overall vitality."
      },
      {
        "id": "AYUR-PRD-R13F9J-ing-2",
        "commonName": "Brahmi",
        "scientificName": "Bacopa monnieri",
        "plantPart": "Whole plant",
        "source": "Kalakkad-Mundanthurai Buffer, Tirunelveli",
        "sourceRegion": "Kalakkad-Mundanthurai Buffer, Tirunelveli",
        "status": "verified",
        "harvestDate": "2026-08-08",
        "processing": "Collected by Wild Collector via Erode Herbal Aggregation Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2007",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Brahmi (Bacopa monnieri) is a Medhya Rasayana in Ayurveda — a class of herbs traditionally used to support memory, focus, and cognitive wellness."
      }
    ],
    "origin": {
      "sourceRegion": "Nilgiri Biosphere Reserve, Nilgiris",
      "district": "Tamil Nadu",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.1271,
      "longitude": 78.6569
    },
    "timeline": [
      {
        "id": "AYUR-PRD-R13F9J-tl-1",
        "stage": "Manufacturing",
        "location": "VedaRoots Wellness Pvt Ltd",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Shatavari Herbal Tea released from 2 batches (BATCH-2026-5046, BATCH-2026-7247)."
      },
      {
        "id": "AYUR-PRD-R13F9J-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "In Progress",
        "icon": "truck",
        "details": "Ready for Dispatch to Wellness Beverages Hub, Salem — vehicle TN-42-AB-1644."
      },
      {
        "id": "AYUR-PRD-R13F9J-tl-3",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to Wellness Beverages Hub, Salem — vehicle TN-42-AB-1644."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-R13F9J-lr-1",
        "test": "Assay",
        "result": "Shatavari marker ≥ 1.5%",
        "status": "passed",
        "date": "2026-08-10",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      },
      {
        "id": "AYUR-PRD-R13F9J-lr-2",
        "test": "Moisture Content",
        "result": "≤7.0%",
        "status": "passed",
        "date": "2026-08-10",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      },
      {
        "id": "AYUR-PRD-R13F9J-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-10",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      },
      {
        "id": "AYUR-PRD-R13F9J-lr-4",
        "test": "Stability Study",
        "result": "24 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-10",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "LAB-2026-1001"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store dry and away from sunlight",
      "warnings": "Avoid if allergic to the ingredient",
      "expiry": "2028-08-10",
      "usage": "1 cup once or twice daily",
      "contraindications": "Avoid if allergic to the ingredient"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-YIL54I",
    "name": "Ashwagandha Stress Relief Powder",
    "type": "Powder / Churna",
    "manufacturer": "VedaRoots Wellness Pvt Ltd",
    "batchId": "AYUR-PRD-YIL54I",
    "manufacturingDate": "2026-08-08",
    "expiryDate": "2028-08-08",
    "netQuantity": "100 g pouch",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-YIL54I-ing-1",
        "commonName": "Kutki",
        "scientificName": "Picrorhiza kurroa",
        "plantPart": "Root/rhizome",
        "source": "Namakkal Village, Namakkal District, Tamil Nadu - 637001",
        "sourceRegion": "Namakkal Village, Namakkal District, Tamil Nadu - 637001",
        "status": "verified",
        "harvestDate": "2026-08-13",
        "processing": "Collected by Farmer via Anamalai Herb Collection Hub.",
        "quality": "Lab Certified — CERT-SYN-26-2017",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Kutki (Picrorhiza kurroa) is a bitter Himalayan root traditionally used in Ayurveda to support liver function and healthy digestion."
      },
      {
        "id": "AYUR-PRD-YIL54I-ing-2",
        "commonName": "Ashwagandha",
        "scientificName": "",
        "plantPart": "Root",
        "source": "Coimbatore",
        "sourceRegion": "Coimbatore",
        "status": "verified",
        "harvestDate": "2026-08-14",
        "processing": "Collected by a registered collector via Anamalai Herb Collection Hub.",
        "quality": "Lab Certified — LAB-VERIFY-0001",
        "sustainabilityStatus": "Not documented",
        "about": "Ashwagandha (Withania somnifera) is a small evergreen shrub native to India, classified as a Rasayana (rejuvenator) in Ayurveda and traditionally used to support the body’s response to stress and overall vitality."
      }
    ],
    "origin": {
      "sourceRegion": "Namakkal Village, Namakkal District, Tamil Nadu - 637001",
      "district": "Tamil Nadu",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.1271,
      "longitude": 78.6569
    },
    "timeline": [
      {
        "id": "AYUR-PRD-YIL54I-tl-1",
        "stage": "Manufacturing",
        "location": "VedaRoots Wellness Pvt Ltd",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Ashwagandha Stress Relief Powder released from 2 batches (BATCH-2026-6591, BATCH-VERIFY-0001)."
      },
      {
        "id": "AYUR-PRD-YIL54I-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to SkinCare Distributors, Chennai — vehicle TN-41-AB-1607."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-YIL54I-lr-1",
        "test": "Assay",
        "result": "Withanolides ≥ 2.5%",
        "status": "passed",
        "date": "2026-08-08",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "CERT-SYN-26-2017"
      },
      {
        "id": "AYUR-PRD-YIL54I-lr-2",
        "test": "Moisture Content",
        "result": "≤7.0%",
        "status": "passed",
        "date": "2026-08-08",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "CERT-SYN-26-2017"
      },
      {
        "id": "AYUR-PRD-YIL54I-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-08",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "CERT-SYN-26-2017"
      },
      {
        "id": "AYUR-PRD-YIL54I-lr-4",
        "test": "Stability Study",
        "result": "24 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-08",
        "laboratory": "VedaRoots Wellness Pvt Ltd",
        "reportReference": "CERT-SYN-26-2017"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store below 25°C, dry and sealed",
      "warnings": "Consult a professional if taking sedative medicines",
      "expiry": "2028-08-08",
      "usage": "3–5 g once daily after food",
      "contraindications": "Consult a professional if taking sedative medicines"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-7MLY8Z",
    "name": "Aloe Vera Herbal Gel",
    "type": "Kwatha",
    "manufacturer": "HerbCure Formulations",
    "batchId": "AYUR-PRD-7MLY8Z",
    "manufacturingDate": "2026-08-22",
    "expiryDate": "2028-02-02",
    "netQuantity": "100 g tube",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-7MLY8Z-ing-1",
        "commonName": "Aloe Vera",
        "scientificName": "Aloe barbadensis Miller",
        "plantPart": "Leaf gel",
        "source": "Pollachi Village, Coimbatore District, Tamil Nadu - 642001",
        "sourceRegion": "Pollachi Village, Coimbatore District, Tamil Nadu - 642001",
        "status": "verified",
        "harvestDate": "2026-07-20",
        "processing": "Collected by Farmer via Western Ghats Herbal Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1003",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Aloe Vera (Aloe barbadensis Miller) is a succulent whose inner leaf gel is traditionally used in Ayurveda for skin care and digestive comfort."
      },
      {
        "id": "AYUR-PRD-7MLY8Z-ing-2",
        "commonName": "Gudmar",
        "scientificName": "Gymnema sylvestre",
        "plantPart": "Leaf",
        "source": "Javadi Hills, Tiruvannamalai",
        "sourceRegion": "Javadi Hills, Tiruvannamalai",
        "status": "verified",
        "harvestDate": "2026-08-02",
        "processing": "Collected by Wild Collector via Anamalai Herb Collection Hub.",
        "quality": "Lab Certified — CERT-SYN-26-2015",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Gudmar (Gymnema sylvestre), literally \"sugar destroyer\" in Hindi, is a traditional Ayurvedic leaf long used to support healthy blood sugar metabolism."
      }
    ],
    "origin": {
      "sourceRegion": "Pollachi Village, Coimbatore District, Tamil Nadu - 642001",
      "district": "Coimbatore",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.0168,
      "longitude": 76.9558
    },
    "timeline": [
      {
        "id": "AYUR-PRD-7MLY8Z-tl-1",
        "stage": "Manufacturing",
        "location": "HerbCure Formulations",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Aloe Vera Herbal Gel released from 2 batches (BATCH-2026-5068, BATCH-2026-9685)."
      },
      {
        "id": "AYUR-PRD-7MLY8Z-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "In Progress",
        "icon": "truck",
        "details": "Out for Delivery to HerbalMart Retail, Tiruppur — vehicle TN-40-AB-1570."
      },
      {
        "id": "AYUR-PRD-7MLY8Z-tl-3",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to HerbalMart Retail, Tiruppur — vehicle TN-40-AB-1570."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-7MLY8Z-lr-1",
        "test": "Assay",
        "result": "Aloe polysaccharides ≥ 1.0%",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "HerbCure Formulations",
        "reportReference": "LAB-2026-1003"
      },
      {
        "id": "AYUR-PRD-7MLY8Z-lr-2",
        "test": "Moisture Content",
        "result": "≤2.0%",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "HerbCure Formulations",
        "reportReference": "LAB-2026-1003"
      },
      {
        "id": "AYUR-PRD-7MLY8Z-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "HerbCure Formulations",
        "reportReference": "LAB-2026-1003"
      },
      {
        "id": "AYUR-PRD-7MLY8Z-lr-4",
        "test": "Stability Study",
        "result": "18 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "HerbCure Formulations",
        "reportReference": "LAB-2026-1003"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store below 25°C, away from direct sunlight",
      "warnings": "For external use; avoid eyes and broken skin",
      "expiry": "2028-02-02",
      "usage": "Apply a thin layer 1–2 times daily",
      "contraindications": "For external use; avoid eyes and broken skin"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-BFIA4E",
    "name": "Aloe Vera Digestive Juice",
    "type": "Syrup",
    "manufacturer": "HerbCure Formulations",
    "batchId": "AYUR-PRD-BFIA4E",
    "manufacturingDate": "2026-08-22",
    "expiryDate": "2027-07-31",
    "netQuantity": "500 ml bottle",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-BFIA4E-ing-1",
        "commonName": "Aloe Vera",
        "scientificName": "Aloe barbadensis Miller",
        "plantPart": "Leaf gel",
        "source": "Pollachi Village, Coimbatore District, Tamil Nadu - 642001",
        "sourceRegion": "Pollachi Village, Coimbatore District, Tamil Nadu - 642001",
        "status": "verified",
        "harvestDate": "2026-07-20",
        "processing": "Collected by Farmer via Western Ghats Herbal Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1003",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Aloe Vera (Aloe barbadensis Miller) is a succulent whose inner leaf gel is traditionally used in Ayurveda for skin care and digestive comfort."
      },
      {
        "id": "AYUR-PRD-BFIA4E-ing-2",
        "commonName": "Gudmar",
        "scientificName": "Gymnema sylvestre",
        "plantPart": "Leaf",
        "source": "Javadi Hills, Tiruvannamalai",
        "sourceRegion": "Javadi Hills, Tiruvannamalai",
        "status": "verified",
        "harvestDate": "2026-08-02",
        "processing": "Collected by Wild Collector via Anamalai Herb Collection Hub.",
        "quality": "Lab Certified — CERT-SYN-26-2015",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Gudmar (Gymnema sylvestre), literally \"sugar destroyer\" in Hindi, is a traditional Ayurvedic leaf long used to support healthy blood sugar metabolism."
      }
    ],
    "origin": {
      "sourceRegion": "Pollachi Village, Coimbatore District, Tamil Nadu - 642001",
      "district": "Coimbatore",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.0168,
      "longitude": 76.9558
    },
    "timeline": [
      {
        "id": "AYUR-PRD-BFIA4E-tl-1",
        "stage": "Manufacturing",
        "location": "HerbCure Formulations",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Aloe Vera Digestive Juice released from 2 batches (BATCH-2026-5068, BATCH-2026-9685)."
      },
      {
        "id": "AYUR-PRD-BFIA4E-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "In Progress",
        "icon": "truck",
        "details": "In Transit to CarePlus Distributors, Madurai — vehicle TN-39-AB-1533."
      },
      {
        "id": "AYUR-PRD-BFIA4E-tl-3",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to CarePlus Distributors, Madurai — vehicle TN-39-AB-1533."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-BFIA4E-lr-1",
        "test": "Assay",
        "result": "Aloe marker ≥ 0.5",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "HerbCure Formulations",
        "reportReference": "LAB-2026-1003"
      },
      {
        "id": "AYUR-PRD-BFIA4E-lr-2",
        "test": "Moisture Content",
        "result": "≤1.5%",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "HerbCure Formulations",
        "reportReference": "LAB-2026-1003"
      },
      {
        "id": "AYUR-PRD-BFIA4E-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "HerbCure Formulations",
        "reportReference": "LAB-2026-1003"
      },
      {
        "id": "AYUR-PRD-BFIA4E-lr-4",
        "test": "Stability Study",
        "result": "12 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "HerbCure Formulations",
        "reportReference": "LAB-2026-1003"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Refrigerate after opening and use promptly",
      "warnings": "Do not exceed recommended dose; consult professional for chronic conditions",
      "expiry": "2027-07-31",
      "usage": "20–30 mL diluted with water daily",
      "contraindications": "Do not exceed recommended dose; consult professional for chronic conditions"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-QMRPA8",
    "name": "Aloe Vera Skin Care Gel",
    "type": "Oil / Taila",
    "manufacturer": "Sanjeevani Ayurveda Products",
    "batchId": "AYUR-PRD-QMRPA8",
    "manufacturingDate": "2026-08-22",
    "expiryDate": "2028-01-29",
    "netQuantity": "100 g tube",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-QMRPA8-ing-1",
        "commonName": "Aloe Vera",
        "scientificName": "Aloe barbadensis Miller",
        "plantPart": "Leaf gel",
        "source": "Pollachi Village, Coimbatore District, Tamil Nadu - 642001",
        "sourceRegion": "Pollachi Village, Coimbatore District, Tamil Nadu - 642001",
        "status": "verified",
        "harvestDate": "2026-07-20",
        "processing": "Collected by Farmer via Western Ghats Herbal Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1003",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Aloe Vera (Aloe barbadensis Miller) is a succulent whose inner leaf gel is traditionally used in Ayurveda for skin care and digestive comfort."
      },
      {
        "id": "AYUR-PRD-QMRPA8-ing-2",
        "commonName": "Gudmar",
        "scientificName": "Gymnema sylvestre",
        "plantPart": "Leaf",
        "source": "Javadi Hills, Tiruvannamalai",
        "sourceRegion": "Javadi Hills, Tiruvannamalai",
        "status": "verified",
        "harvestDate": "2026-08-02",
        "processing": "Collected by Wild Collector via Anamalai Herb Collection Hub.",
        "quality": "Lab Certified — CERT-SYN-26-2015",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Gudmar (Gymnema sylvestre), literally \"sugar destroyer\" in Hindi, is a traditional Ayurvedic leaf long used to support healthy blood sugar metabolism."
      }
    ],
    "origin": {
      "sourceRegion": "Pollachi Village, Coimbatore District, Tamil Nadu - 642001",
      "district": "Coimbatore",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.0168,
      "longitude": 76.9558
    },
    "timeline": [
      {
        "id": "AYUR-PRD-QMRPA8-tl-1",
        "stage": "Manufacturing",
        "location": "Sanjeevani Ayurveda Products",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Aloe Vera Skin Care Gel released from 2 batches (BATCH-2026-5068, BATCH-2026-9685)."
      },
      {
        "id": "AYUR-PRD-QMRPA8-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to Organic Wellness Traders, Coimbatore — vehicle TN-38-AB-1496."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-QMRPA8-lr-1",
        "test": "Assay",
        "result": "Aloe polysaccharides ≥ 1.0%",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1003"
      },
      {
        "id": "AYUR-PRD-QMRPA8-lr-2",
        "test": "Moisture Content",
        "result": "≤2.0%",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1003"
      },
      {
        "id": "AYUR-PRD-QMRPA8-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1003"
      },
      {
        "id": "AYUR-PRD-QMRPA8-lr-4",
        "test": "Stability Study",
        "result": "18 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1003"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store below 25°C, tightly closed",
      "warnings": "Patch test recommended; external use only",
      "expiry": "2028-01-29",
      "usage": "Apply gently to clean skin 1–2 times daily",
      "contraindications": "Patch test recommended; external use only"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-UTSHRY",
    "name": "Turmeric Curcumin Powder",
    "type": "Powder / Churna",
    "manufacturer": "Sanjeevani Ayurveda Products",
    "batchId": "AYUR-PRD-UTSHRY",
    "manufacturingDate": "2026-08-22",
    "expiryDate": "2028-07-27",
    "netQuantity": "100 g Pouch",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-UTSHRY-ing-1",
        "commonName": "Turmeric",
        "scientificName": "Curcuma longa",
        "plantPart": "Rhizome",
        "source": "Kolli Hills, Namakkal",
        "sourceRegion": "Kolli Hills, Namakkal",
        "status": "verified",
        "harvestDate": "2026-07-29",
        "processing": "Collected by Wild Collector via Nilgiri Medicinal Plant Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1004",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Turmeric (Curcuma longa) is a golden rhizome central to Ayurvedic practice, traditionally valued for its warming, antioxidant properties and everyday wellness use."
      },
      {
        "id": "AYUR-PRD-UTSHRY-ing-2",
        "commonName": "Turmeric",
        "scientificName": "Curcuma longa",
        "plantPart": "Rhizome",
        "source": "Harur Village, Dharmapuri District, Tamil Nadu - 636903",
        "sourceRegion": "Harur Village, Dharmapuri District, Tamil Nadu - 636903",
        "status": "verified",
        "harvestDate": "2026-08-02",
        "processing": "Collected by Farmer via Erode Herbal Aggregation Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2008",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Turmeric (Curcuma longa) is a golden rhizome central to Ayurvedic practice, traditionally valued for its warming, antioxidant properties and everyday wellness use."
      }
    ],
    "origin": {
      "sourceRegion": "Kolli Hills, Namakkal",
      "district": "Tamil Nadu",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.1271,
      "longitude": 78.6569
    },
    "timeline": [
      {
        "id": "AYUR-PRD-UTSHRY-tl-1",
        "stage": "Manufacturing",
        "location": "Sanjeevani Ayurveda Products",
        "date": "2026-08-22",
        "status": "Completed",
        "icon": "package",
        "details": "Turmeric Curcumin Powder released from 2 batches (BATCH-2026-5121, BATCH-2026-8628)."
      },
      {
        "id": "AYUR-PRD-UTSHRY-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "In Progress",
        "icon": "truck",
        "details": "Ready for Dispatch to Healthy Roots Pharmacy, Chennai — vehicle TN-45-AB-1459."
      },
      {
        "id": "AYUR-PRD-UTSHRY-tl-3",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to Healthy Roots Pharmacy, Chennai — vehicle TN-45-AB-1459."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-UTSHRY-lr-1",
        "test": "Assay",
        "result": "Curcuminoids ≥ 3.0%",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      },
      {
        "id": "AYUR-PRD-UTSHRY-lr-2",
        "test": "Moisture Content",
        "result": "≤7.0%",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      },
      {
        "id": "AYUR-PRD-UTSHRY-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      },
      {
        "id": "AYUR-PRD-UTSHRY-lr-4",
        "test": "Stability Study",
        "result": "24 months accelerated, passed",
        "status": "passed",
        "date": "2026-08-22",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store cool, dry and sealed",
      "warnings": "Consult professional with gallbladder disorders or anticoagulants",
      "expiry": "2028-07-27",
      "usage": "2–3 g daily with food",
      "contraindications": "Consult professional with gallbladder disorders or anticoagulants"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-5NNY5I",
    "name": "Turmeric Golden Milk Mix",
    "type": "Powder / Churna",
    "manufacturer": "Sanjeevani Ayurveda Products",
    "batchId": "AYUR-PRD-5NNY5I",
    "manufacturingDate": "2026-07-25",
    "expiryDate": "2028-01-25",
    "netQuantity": "200 g pouch",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-5NNY5I-ing-1",
        "commonName": "Turmeric",
        "scientificName": "Curcuma longa",
        "plantPart": "Rhizome",
        "source": "Kolli Hills, Namakkal",
        "sourceRegion": "Kolli Hills, Namakkal",
        "status": "verified",
        "harvestDate": "2026-07-29",
        "processing": "Collected by Wild Collector via Nilgiri Medicinal Plant Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1004",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Turmeric (Curcuma longa) is a golden rhizome central to Ayurvedic practice, traditionally valued for its warming, antioxidant properties and everyday wellness use."
      },
      {
        "id": "AYUR-PRD-5NNY5I-ing-2",
        "commonName": "Turmeric",
        "scientificName": "Curcuma longa",
        "plantPart": "Rhizome",
        "source": "Harur Village, Dharmapuri District, Tamil Nadu - 636903",
        "sourceRegion": "Harur Village, Dharmapuri District, Tamil Nadu - 636903",
        "status": "verified",
        "harvestDate": "2026-08-02",
        "processing": "Collected by Farmer via Erode Herbal Aggregation Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2008",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Turmeric (Curcuma longa) is a golden rhizome central to Ayurvedic practice, traditionally valued for its warming, antioxidant properties and everyday wellness use."
      }
    ],
    "origin": {
      "sourceRegion": "Kolli Hills, Namakkal",
      "district": "Tamil Nadu",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.1271,
      "longitude": 78.6569
    },
    "timeline": [
      {
        "id": "AYUR-PRD-5NNY5I-tl-1",
        "stage": "Manufacturing",
        "location": "Sanjeevani Ayurveda Products",
        "date": "2026-08-23",
        "status": "Completed",
        "icon": "package",
        "details": "Turmeric Golden Milk Mix released from 2 batches (BATCH-2026-5121, BATCH-2026-8628)."
      },
      {
        "id": "AYUR-PRD-5NNY5I-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "In Progress",
        "icon": "truck",
        "details": "In Transit to Ayurveda Retail Hub, Bengaluru — vehicle TN-44-AB-1422."
      },
      {
        "id": "AYUR-PRD-5NNY5I-tl-3",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to Ayurveda Retail Hub, Bengaluru — vehicle TN-44-AB-1422."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-5NNY5I-lr-1",
        "test": "Assay",
        "result": "Curcuminoids ≥ 2.0%",
        "status": "passed",
        "date": "2026-07-25",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      },
      {
        "id": "AYUR-PRD-5NNY5I-lr-2",
        "test": "Moisture Content",
        "result": "≤6.0%",
        "status": "passed",
        "date": "2026-07-25",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      },
      {
        "id": "AYUR-PRD-5NNY5I-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-07-25",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      },
      {
        "id": "AYUR-PRD-5NNY5I-lr-4",
        "test": "Stability Study",
        "result": "18 months accelerated, passed",
        "status": "passed",
        "date": "2026-07-25",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store dry and protected from moisture",
      "warnings": "Avoid if allergic to turmeric",
      "expiry": "2028-01-25",
      "usage": "5–10 g mixed with warm milk once daily",
      "contraindications": "Avoid if allergic to turmeric"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-14WAG7",
    "name": "Turmeric Wellness Capsules",
    "type": "Capsule",
    "manufacturer": "Sanjeevani Ayurveda Products",
    "batchId": "AYUR-PRD-14WAG7",
    "manufacturingDate": "2026-07-23",
    "expiryDate": "2028-07-23",
    "netQuantity": "60 capsules",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-14WAG7-ing-1",
        "commonName": "Turmeric",
        "scientificName": "Curcuma longa",
        "plantPart": "Rhizome",
        "source": "Kolli Hills, Namakkal",
        "sourceRegion": "Kolli Hills, Namakkal",
        "status": "verified",
        "harvestDate": "2026-07-29",
        "processing": "Collected by Wild Collector via Nilgiri Medicinal Plant Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1004",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Turmeric (Curcuma longa) is a golden rhizome central to Ayurvedic practice, traditionally valued for its warming, antioxidant properties and everyday wellness use."
      },
      {
        "id": "AYUR-PRD-14WAG7-ing-2",
        "commonName": "Turmeric",
        "scientificName": "Curcuma longa",
        "plantPart": "Rhizome",
        "source": "Harur Village, Dharmapuri District, Tamil Nadu - 636903",
        "sourceRegion": "Harur Village, Dharmapuri District, Tamil Nadu - 636903",
        "status": "verified",
        "harvestDate": "2026-08-02",
        "processing": "Collected by Farmer via Erode Herbal Aggregation Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2008",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Turmeric (Curcuma longa) is a golden rhizome central to Ayurvedic practice, traditionally valued for its warming, antioxidant properties and everyday wellness use."
      }
    ],
    "origin": {
      "sourceRegion": "Kolli Hills, Namakkal",
      "district": "Tamil Nadu",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.1271,
      "longitude": 78.6569
    },
    "timeline": [
      {
        "id": "AYUR-PRD-14WAG7-tl-1",
        "stage": "Manufacturing",
        "location": "Sanjeevani Ayurveda Products",
        "date": "2026-08-23",
        "status": "Completed",
        "icon": "package",
        "details": "Turmeric Wellness Capsules released from 2 batches (BATCH-2026-5121, BATCH-2026-8628)."
      },
      {
        "id": "AYUR-PRD-14WAG7-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to NatureMed Distributors, Salem — vehicle TN-43-AB-1385."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-14WAG7-lr-1",
        "test": "Assay",
        "result": "Curcuminoids ≥ 3.0%",
        "status": "passed",
        "date": "2026-07-23",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      },
      {
        "id": "AYUR-PRD-14WAG7-lr-2",
        "test": "Moisture Content",
        "result": "≤5.0%",
        "status": "passed",
        "date": "2026-07-23",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      },
      {
        "id": "AYUR-PRD-14WAG7-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-07-23",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      },
      {
        "id": "AYUR-PRD-14WAG7-lr-4",
        "test": "Stability Study",
        "result": "24 months accelerated, passed",
        "status": "passed",
        "date": "2026-07-23",
        "laboratory": "Sanjeevani Ayurveda Products",
        "reportReference": "LAB-2026-1004"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store below 25°C, dry and sealed",
      "warnings": "Consult professional when taking anticoagulants",
      "expiry": "2028-07-23",
      "usage": "Quality Manager - QC-1",
      "contraindications": "Consult professional when taking anticoagulants"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-DL4Y0B",
    "name": "Brahmi Memory Support Capsules",
    "type": "Capsule",
    "manufacturer": "GreenLeaf Herbal Pharma",
    "batchId": "AYUR-PRD-DL4Y0B",
    "manufacturingDate": "2026-07-21",
    "expiryDate": "2028-07-21",
    "netQuantity": "60 capsules",
    "formulation": "Single-herb (Ekamoolika)",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-DL4Y0B-ing-1",
        "commonName": "Ashwagandha",
        "scientificName": "Withania somnifera",
        "plantPart": "Root",
        "source": "Perundurai Village, Erode District, Tamil Nadu - 638052",
        "sourceRegion": "Perundurai Village, Erode District, Tamil Nadu - 638052",
        "status": "verified",
        "harvestDate": "2026-07-16",
        "processing": "Collected by Farmer via Western Ghats Herbal Collection Centre.",
        "quality": "Lab Certified — LAB-2026-1002",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Ashwagandha (Withania somnifera) is a small evergreen shrub native to India, classified as a Rasayana (rejuvenator) in Ayurveda and traditionally used to support the body’s response to stress and overall vitality."
      },
      {
        "id": "AYUR-PRD-DL4Y0B-ing-2",
        "commonName": "Brahmi",
        "scientificName": "Bacopa monnieri",
        "plantPart": "Whole plant",
        "source": "Kotagiri Village, The Nilgiris District, Tamil Nadu - 643217",
        "sourceRegion": "Kotagiri Village, The Nilgiris District, Tamil Nadu - 643217",
        "status": "verified",
        "harvestDate": "2026-07-24",
        "processing": "Collected by Farmer via Nilgiri Medicinal Plant Collection Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2005",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Brahmi (Bacopa monnieri) is a Medhya Rasayana in Ayurveda — a class of herbs traditionally used to support memory, focus, and cognitive wellness."
      }
    ],
    "origin": {
      "sourceRegion": "Perundurai Village, Erode District, Tamil Nadu - 638052",
      "district": "Erode",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 11.341,
      "longitude": 77.7172
    },
    "timeline": [
      {
        "id": "AYUR-PRD-DL4Y0B-tl-1",
        "stage": "Manufacturing",
        "location": "GreenLeaf Herbal Pharma",
        "date": "2026-08-23",
        "status": "Completed",
        "icon": "package",
        "details": "Brahmi Memory Support Capsules released from 2 batches (BATCH-2026-6072, BATCH-2026-7099)."
      },
      {
        "id": "AYUR-PRD-DL4Y0B-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to Wellness Mart, Tiruchirappalli — vehicle TN-42-AB-1348."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-DL4Y0B-lr-1",
        "test": "Assay",
        "result": "Bacosides ≥ 2.0%",
        "status": "passed",
        "date": "2026-07-21",
        "laboratory": "GreenLeaf Herbal Pharma",
        "reportReference": "LAB-2026-1002"
      },
      {
        "id": "AYUR-PRD-DL4Y0B-lr-2",
        "test": "Moisture Content",
        "result": "≤5.0%",
        "status": "passed",
        "date": "2026-07-21",
        "laboratory": "GreenLeaf Herbal Pharma",
        "reportReference": "LAB-2026-1002"
      },
      {
        "id": "AYUR-PRD-DL4Y0B-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-07-21",
        "laboratory": "GreenLeaf Herbal Pharma",
        "reportReference": "LAB-2026-1002"
      },
      {
        "id": "AYUR-PRD-DL4Y0B-lr-4",
        "test": "Stability Study",
        "result": "24 months accelerated, passed",
        "status": "passed",
        "date": "2026-07-21",
        "laboratory": "GreenLeaf Herbal Pharma",
        "reportReference": "LAB-2026-1002"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store below 25°C and protect from moisture",
      "warnings": "May cause sensitivity in some users; professional advice recommended",
      "expiry": "2028-07-21",
      "usage": "1 capsule twice daily after meals",
      "contraindications": "May cause sensitivity in some users; professional advice recommended"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  },
  {
    "id": "AYUR-PRD-PWFKFA",
    "name": "Cinnamon Digestive Tea",
    "type": "Powder / Churna",
    "manufacturer": "GreenLeaf Herbal Pharma",
    "batchId": "AYUR-PRD-PWFKFA",
    "manufacturingDate": "2026-07-17",
    "expiryDate": "2028-07-17",
    "netQuantity": "100 g pouch",
    "formulation": "Classical polyherbal",
    "status": "verified",
    "trustScore": 100,
    "ingredients": [
      {
        "id": "AYUR-PRD-PWFKFA-ing-1",
        "commonName": "Cinnamon",
        "scientificName": "Cinnamomum verum",
        "plantPart": "Bark",
        "source": "Theni Village, Theni District, Tamil Nadu - 625531",
        "sourceRegion": "Theni Village, Theni District, Tamil Nadu - 625531",
        "status": "verified",
        "harvestDate": "2026-08-06",
        "processing": "Collected by Farmer via Erode Herbal Aggregation Centre.",
        "quality": "Lab Certified — CERT-SYN-26-2009",
        "sustainabilityStatus": "Farmer-Sourced",
        "about": "Cinnamon (Cinnamomum verum) is an aromatic bark long used in Ayurveda as a warming digestive spice, traditionally included in formulations to support metabolism and healthy blood sugar levels."
      },
      {
        "id": "AYUR-PRD-PWFKFA-ing-2",
        "commonName": "Ginger",
        "scientificName": "Zingiber officinale",
        "plantPart": "Rhizome",
        "source": "Western Ghats Foothills, Theni",
        "sourceRegion": "Western Ghats Foothills, Theni",
        "status": "verified",
        "harvestDate": "2026-08-13",
        "processing": "Collected by Wild Collector via Anamalai Herb Collection Hub.",
        "quality": "Lab Certified — CERT-SYN-26-2014",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Ginger (Zingiber officinale) is one of the most widely used Ayurvedic rhizomes — warming, traditionally used to support digestion and reduce bloating."
      },
      {
        "id": "AYUR-PRD-PWFKFA-ing-3",
        "commonName": "Gudmar",
        "scientificName": "Gymnema sylvestre",
        "plantPart": "Leaf",
        "source": "Javadi Hills, Tiruvannamalai",
        "sourceRegion": "Javadi Hills, Tiruvannamalai",
        "status": "verified",
        "harvestDate": "2026-08-02",
        "processing": "Collected by Wild Collector via Anamalai Herb Collection Hub.",
        "quality": "Lab Certified — CERT-SYN-26-2015",
        "sustainabilityStatus": "Wild-Collected",
        "about": "Gudmar (Gymnema sylvestre), literally \"sugar destroyer\" in Hindi, is a traditional Ayurvedic leaf long used to support healthy blood sugar metabolism."
      }
    ],
    "origin": {
      "sourceRegion": "Theni Village, Theni District, Tamil Nadu - 625531",
      "district": "Theni",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 10.0104,
      "longitude": 77.4768
    },
    "timeline": [
      {
        "id": "AYUR-PRD-PWFKFA-tl-1",
        "stage": "Manufacturing",
        "location": "GreenLeaf Herbal Pharma",
        "date": "2026-08-23",
        "status": "Completed",
        "icon": "package",
        "details": "Cinnamon Digestive Tea released from 3 batches (BATCH-2026-8256, BATCH-2026-8098, BATCH-2026-9685)."
      },
      {
        "id": "AYUR-PRD-PWFKFA-tl-2",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-01",
        "status": "In Progress",
        "icon": "truck",
        "details": "In Transit to GreenCare Retail, Coimbatore — vehicle TN-40-AB-1274."
      },
      {
        "id": "AYUR-PRD-PWFKFA-tl-3",
        "stage": "Supply Chain",
        "location": "IndiaShip Logistics",
        "date": "2026-09-03",
        "status": "Completed",
        "icon": "truck",
        "details": "Delivered to GreenCare Retail, Coimbatore — vehicle TN-40-AB-1274."
      }
    ],
    "labResults": [
      {
        "id": "AYUR-PRD-PWFKFA-lr-1",
        "test": "Assay",
        "result": "Polyphenols ≥ 1.5%",
        "status": "passed",
        "date": "2026-07-17",
        "laboratory": "GreenLeaf Herbal Pharma",
        "reportReference": "CERT-SYN-26-2009"
      },
      {
        "id": "AYUR-PRD-PWFKFA-lr-2",
        "test": "Moisture Content",
        "result": "≤7.0%",
        "status": "passed",
        "date": "2026-07-17",
        "laboratory": "GreenLeaf Herbal Pharma",
        "reportReference": "CERT-SYN-26-2009"
      },
      {
        "id": "AYUR-PRD-PWFKFA-lr-3",
        "test": "Microbial Clearance",
        "result": "Pass",
        "status": "passed",
        "date": "2026-07-17",
        "laboratory": "GreenLeaf Herbal Pharma",
        "reportReference": "CERT-SYN-26-2009"
      },
      {
        "id": "AYUR-PRD-PWFKFA-lr-4",
        "test": "Stability Study",
        "result": "24 months accelerated, passed",
        "status": "passed",
        "date": "2026-07-17",
        "laboratory": "GreenLeaf Herbal Pharma",
        "reportReference": "CERT-SYN-26-2009"
      }
    ],
    "blockchain": {
      "verified": false,
      "timestamp": "",
      "transactionRef": "",
      "transactionId": "",
      "blockNumber": "",
      "recordHash": "",
      "network": ""
    },
    "sustainability": {
      "score": 100,
      "responsibleSourcing": 100,
      "collectionCompliance": 100,
      "ecologicalRisk": 100,
      "transport": 90,
      "documentation": 100
    },
    "safety": {
      "storage": "Store dry, cool and sealed",
      "warnings": "Avoid excessive intake if sensitive to cinnamon",
      "expiry": "2028-07-17",
      "usage": "1 cup after meals, up to twice daily",
      "contraindications": "Avoid excessive intake if sensitive to cinnamon"
    },
    "trustBreakdown": {
      "sourceVerification": 100,
      "labVerification": 100,
      "traceability": 100,
      "documentation": 100,
      "sustainability": 100
    },
    "quickVerification": {
      "sourceVerified": true,
      "labVerified": true,
      "manufacturerVerified": true,
      "supplyChainVerified": true,
      "qrVerified": true,
      "blockchainAvailable": false
    }
  }
];

export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);

export const getProductByBatchId = (batchId: string): Product | undefined =>
  PRODUCTS.find((p) => p.batchId.toLowerCase() === batchId.toLowerCase());

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      p.batchId.toLowerCase().includes(q) ||
      p.ingredients.some((i) => i.commonName.toLowerCase().includes(q))
  );
};
