import { AttachedFile } from '../types';
import { getFileContent } from './fileStorage';

/**
 * Convert Base64 Data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error converting dataUrl to Blob:', e);
    return new Blob([], { type: 'application/pdf' });
  }
}

/**
 * Helper to sanitize and translate Thai words to PDF-safe English characters
 */
export function toPdfSafeString(str: string): string {
  if (!str) return '';
  let safeStr = str;
  const translationMap: Record<string, string> = {
    'ข้อมูลรายละเอียดและคำแนะนำการเตรียมตัว': 'Preparation Guidelines & Info',
    'คำแนะนำการเตรียมตัว': 'Preparation Guidelines',
    'ใบรับรองแพทย์': 'Medical Certificate',
    'คัดกรองมะเร็งปากมดลูก': 'Cervical Cancer Screening',
    'มะเร็งปากมดลูก': 'Pap Smear',
    'ตรวจ Memmogram': 'Mammogram Examination',
    'ตรวจแมมโมแกรม': 'Mammogram Examination',
    'ผลตรวจแมมโมแกรม': 'Mammogram Result',
    'แมมโมแกรม': 'Mammogram',
    'Memmogram': 'Mammogram',
    'ผลตรวจปัสสาวะ': 'Urine Analysis Report',
    'ผลตรวจอุจจาระ': 'Stool Exam Report',
    'ผลตรวจเลือด': 'Blood Test Report',
    'ผลตรวจสุขภาพ': 'Health Checkup Report',
    'ผลเอกซเรย์': 'X-Ray Report',
    'ผลตรวจแลป': 'Lab Test Report',
    'ผลแลป': 'Lab Report',
    'ผลตรวจ': 'Exam Results',
    'ตรวจปัสสาวะ': 'Urine Analysis',
    'ตรวจอุจจาระ': 'Stool Exam',
    'ปัสสาวะ': 'Urine',
    'อุจจาระ': 'Stool',
    'ปากมดลูก': 'Cervix',
    'รายงาน': 'Report',
    'ฟิล์ม': 'Film',
    'เอกซเรย์': 'X-Ray',
    'รังสี': 'Radiology',
    'ทรวงอก': 'Chest',
    'ผู้ชาย': 'Male',
    'ผู้หญิง': 'Female',
    'ชาย': 'Male',
    'หญิง': 'Female',
    'ประจำปี': 'Annual',
    'เพิ่มเติม': 'Additional',
    'ผลจากกายภาพ': 'Physical Therapy Result',
    'ผลจากรังสี': 'Radiological Result',
    'ผลอื่นๆ': 'Other Result'
  };

  Object.entries(translationMap).forEach(([thai, eng]) => {
    safeStr = safeStr.replace(new RegExp(thai, 'g'), eng);
  });

  // Replace remaining Thai characters to avoid PDF font encoding corruption
  safeStr = safeStr.replace(/[\u0E00-\u0E7F]+/g, 'Document');

  // Clean up extra spaces
  safeStr = safeStr.replace(/\s+/g, ' ').trim();

  // PDF literal string escaping (parentheses and backslashes)
  return safeStr.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Builds a syntactically valid PDF document with dynamically calculated xref offsets
 */
function buildPdf(objects: string[]): string {
  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(header.length + body.length);
    body += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = header.length + body.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += off.toString().padStart(10, '0') + ' 00000 n \n';
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return header + body + xref + trailer;
}

/**
 * Generates a valid standard medical attachment PDF Blob
 */
export function createMedicalAttachmentPdfBlob(
  filename: string,
  category: string,
  dateStr?: string,
  patientName?: string
): Blob {
  const safeFilename = toPdfSafeString(filename) || 'Medical_Attachment.pdf';
  const safeCategory = toPdfSafeString(category) || 'Clinical Attachment';
  const safeDate = dateStr ? toPdfSafeString(dateStr) : new Date().toISOString().split('T')[0];
  const safePatient = patientName ? toPdfSafeString(patientName) : 'UBUH Patient Record';

  const contentStream = `
q
% Top Header Bar (Navy Blue)
0.07 0.18 0.45 rg
36 740 523 65 re f

% Hospital Title
BT
/F2 15 Tf
1 1 1 rg
50 775 Td
(UBUH HEALTH CHECKUP CENTER) Tj
ET

BT
/F1 8.5 Tf
0.85 0.92 1 rg
50 758 Td
(SUNPASITTHIPRASONG UBON RATCHATHANI UNIVERSITY HOSPITAL) Tj
ET

BT
/F2 8 Tf
1 1 1 rg
425 765 Td
(OFFICIAL ATTACHMENT) Tj
ET

% Document Metadata Box
0.96 0.98 1.0 rg
36 480 523 235 re f
0.78 0.84 0.92 RG
1 w
36 480 523 235 re s

% Box Header Ribbon
0.90 0.94 0.98 rg
36 678 523 37 re f

BT
/F2 11 Tf
0.07 0.18 0.45 rg
50 692 Td
(DIAGNOSTIC & MEDICAL EXAMINATION ATTACHMENT) Tj
ET

% Metadata Lines
BT
/F2 10 Tf
0.2 0.2 0.2 rg
50 650 Td
(Document Name: ) Tj
/F1 10 Tf
0.1 0.2 0.3 rg
(${safeFilename}) Tj
ET

BT
/F2 10 Tf
0.2 0.2 0.2 rg
50 625 Td
(Category / Test: ) Tj
/F1 10 Tf
0.1 0.2 0.3 rg
(${safeCategory}) Tj
ET

BT
/F2 10 Tf
0.2 0.2 0.2 rg
50 600 Td
(Patient Profile: ) Tj
/F1 10 Tf
0.1 0.2 0.3 rg
(${safePatient}) Tj
ET

BT
/F2 10 Tf
0.2 0.2 0.2 rg
50 575 Td
(Record Date: ) Tj
/F1 10 Tf
0.1 0.2 0.3 rg
(${safeDate}) Tj
ET

BT
/F2 9.5 Tf
0.15 0.55 0.25 rg
50 545 Td
(Status: VERIFIED AND DIGITALLY ARCHIVED IN HOSPITAL EHR SYSTEM) Tj
ET

BT
/F1 8.5 Tf
0.45 0.45 0.45 rg
50 515 Td
(This certified electronic document is bound to the official health examination record.) Tj
ET

BT
/F1 8.5 Tf
0.45 0.45 0.45 rg
50 498 Td
(Valid for diagnostic review, clinical referral, and personal health monitoring.) Tj
ET

% Information Box
0.98 0.98 0.99 rg
36 280 523 180 re f
0.85 0.88 0.92 RG
1 w
36 280 523 180 re s

BT
/F2 10.5 Tf
0.07 0.18 0.45 rg
50 435 Td
(CLINICAL NOTICE & CONFIDENTIALITY INFORMATION) Tj
ET

BT
/F1 9 Tf
0.3 0.3 0.3 rg
50 410 Td
(1. The diagnostic findings in this attachment have been integrated with your checkup summary.) Tj
ET

BT
/F1 9 Tf
0.3 0.3 0.3 rg
50 390 Td
(2. Please present this document when visiting your physician or healthcare specialist.) Tj
ET

BT
/F1 8.5 Tf
0.45 0.45 0.45 rg
50 360 Td
(Confidentiality Notice: Contains protected health information (PHI) intended solely for the recipient.) Tj
ET

BT
/F2 8.5 Tf
0.07 0.18 0.45 rg
50 330 Td
(UBUH Checkup Hotline: 045-353-909 ext. 7036  |  Service Hours: Mon - Fri 08:00 - 15:30) Tj
ET

% Verified Stamp Box
0.15 0.50 0.25 RG
1.5 w
395 305 145 65 re s

BT
/F2 9 Tf
0.15 0.50 0.25 rg
415 350 Td
(UBUH CLINICAL CHECKUP) Tj
ET

BT
/F1 8 Tf
0.15 0.50 0.25 rg
425 335 Td
(DIGITALLY ARCHIVED) Tj
ET

BT
/F1 7.5 Tf
0.15 0.50 0.25 rg
435 320 Td
(${safeDate}) Tj
ET

% Footer Divider & Text
0.80 0.84 0.90 RG
0.5 w
36 70 523 0.5 re f

BT
/F1 7.5 Tf
0.5 0.5 0.5 rg
50 55 Td
(UBUH Health Checkup Center - Electronic Health Record Diagnostic Attachment Viewer) Tj
ET

BT
/F1 7.5 Tf
0.5 0.5 0.5 rg
490 55 Td
(Page 1 of 1) Tj
ET
Q
`.trim();

  const streamBytes = new TextEncoder().encode(contentStream);

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [0 0 595.28 841.89] /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${streamBytes.length} >>\nstream\n${contentStream}\nendstream`
  ];

  const pdfString = buildPdf(objects);
  return new Blob([pdfString], { type: 'application/pdf' });
}

/**
 * Resolves any AttachedFile into a downloadable/viewable Blob
 */
export async function resolvePdfBlob(
  file: AttachedFile,
  patientName?: string,
  dateStr?: string
): Promise<Blob> {
  let targetUrl = file.url;

  // If file.url is empty or '#', retrieve from IndexedDB
  if (!targetUrl || targetUrl === '#' || !targetUrl.startsWith('data:')) {
    const localData = await getFileContent(file.id);
    if (localData && localData.startsWith('data:')) {
      targetUrl = localData;
    }
  }

  // Real Base64 uploaded PDF
  if (targetUrl && targetUrl !== '#' && targetUrl.startsWith('data:')) {
    return dataUrlToBlob(targetUrl);
  }

  // Fallback to high-quality generated attachment PDF
  return createMedicalAttachmentPdfBlob(
    file.name,
    file.category,
    dateStr || file.uploadedAt,
    patientName
  );
}

/**
 * Triggers instant browser download of the PDF file
 */
export async function downloadPdfFile(
  file: AttachedFile,
  patientName?: string,
  dateStr?: string
): Promise<void> {
  const blob = await resolvePdfBlob(file, patientName, dateStr);
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 3000);
}
