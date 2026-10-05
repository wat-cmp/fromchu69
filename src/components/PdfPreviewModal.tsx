import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Printer,
  FileText,
  Loader2,
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { AttachedFile } from '../types';
import { resolvePdfBlob, downloadPdfFile } from '../lib/pdfHelper';

interface PdfPreviewModalProps {
  isOpen: boolean;
  file: AttachedFile | null;
  patientName?: string;
  examDate?: string;
  onClose: () => void;
}

export default function PdfPreviewModal({
  isOpen,
  file,
  patientName,
  examDate,
  onClose
}: PdfPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close on Escape key and prevent background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Load and resolve the PDF Blob
  useEffect(() => {
    if (!isOpen || !file) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    let isMounted = true;
    let createdUrl: string | null = null;

    async function loadPdf() {
      setIsLoading(true);
      setError(null);
      try {
        if (!file) return;
        const blob = await resolvePdfBlob(file, patientName, examDate);
        if (!isMounted) return;

        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error resolving PDF preview:', err);
        setError('ไม่สามารถเปิดดูไฟล์เอกสารได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, file, patientName, examDate]);

  if (!isOpen || !file) return null;

  const handleDownload = async () => {
    if (!file) return;
    setIsDownloading(true);
    try {
      await downloadPdfFile(file, patientName, examDate);
    } catch (err) {
      console.error('Download error:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } catch (e) {
        console.warn('Direct iframe print failed, opening in new tab for printing:', e);
        handleOpenNewTab();
      }
    } else {
      handleOpenNewTab();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Dialog Window */}
      <div
        className="relative w-full max-w-5xl h-[92vh] max-h-[950px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 border-b border-sky-800/50 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="bg-red-500/20 text-red-300 p-2 rounded-xl border border-red-400/30 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  id="modal-title"
                  className="text-sm sm:text-base font-bold text-white truncate max-w-[260px] sm:max-w-md"
                  title={file.name}
                >
                  {file.name}
                </h3>
                <span className="hidden sm:inline-flex bg-sky-500/20 text-sky-200 border border-sky-400/30 text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0">
                  {file.category}
                </span>
              </div>
              <p className="text-[11px] text-sky-200/80 font-mono truncate">
                {file.size} • เอกสารทางการแพทย์ (In-App PDF Viewer)
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading || isLoading}
              className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="ดาวน์โหลดไฟล์ PDF ลงเครื่อง"
            >
              <Download className="h-3.5 w-3.5 text-sky-300" />
              <span className="hidden md:inline">ดาวน์โหลด</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={isLoading || !!error}
              className="hidden sm:flex bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="สั่งพิมพ์เอกสาร"
            >
              <Printer className="h-3.5 w-3.5 text-sky-300" />
              <span className="hidden md:inline">พิมพ์</span>
            </button>

            {/* Open in New Tab Button */}
            <button
              onClick={handleOpenNewTab}
              disabled={isLoading || !blobUrl}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="เปิดในแท็บใหม่ / ขยายเต็มหน้าต่าง"
            >
              <ExternalLink className="h-3.5 w-3.5 text-sky-300" />
              <span className="hidden lg:inline">เปิดแท็บใหม่</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="bg-white/15 hover:bg-rose-600/90 text-white p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ml-1"
              title="ปิดหน้าต่าง (Esc)"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Viewport */}
        <div className="relative flex-1 w-full h-full bg-slate-100 flex flex-col items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="text-center p-8 space-y-3">
              <Loader2 className="h-9 w-9 text-blue-800 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">กำลังเปิดตัวอย่างเอกสาร PDF...</p>
              <p className="text-xs text-slate-400">กรุณารอสักครู่ ระบบกำลังเรนเดอร์เอกสารสำหรับท่าน</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-white p-6 max-w-md rounded-2xl border border-rose-200 shadow-sm text-center space-y-3 mx-4">
              <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">{error}</h4>
              <p className="text-xs text-slate-500">
                หากตัวแสดงผลในเว็บไม่สามารถโหลดได้ ท่านยังคงสามารถกดดาวน์โหลดไฟล์เพื่อเปิดอ่านบนเครื่องได้ตามปกติ
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={handleDownload}
                  className="bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>ดาวน์โหลดไฟล์แทน</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && blobUrl && (
            <div className="w-full h-full relative">
              <object
                data={`${blobUrl}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full"
              >
                {/* Fallback to iframe if object is not preferred */}
                <iframe
                  ref={iframeRef}
                  src={`${blobUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-full border-0 bg-slate-50"
                  title={file.name}
                >
                  <div className="p-8 text-center space-y-4">
                    <p className="text-sm text-slate-600">เบราว์เซอร์ของท่านไม่รองรับการแสดงตัวอย่าง PDF ในหน้านี้โดยตรง</p>
                    <button
                      onClick={handleDownload}
                      className="bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      ดาวน์โหลดเพื่อเปิดดู
                    </button>
                  </div>
                </iframe>
              </object>
            </div>
          )}
        </div>

        {/* Bottom Helper Bar for Mobile/Touch Users */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-slate-600">
              UBUH PDF Viewer • เอกสารรับรองจากระบบศูนย์ตรวจสุขภาพ
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="hidden sm:inline text-slate-400">
              กดปุ่ม <span className="font-mono font-bold text-slate-600">Esc</span> เพื่อปิด
            </span>
            <button
              onClick={handleOpenNewTab}
              className="text-blue-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Maximize2 className="h-3 w-3" />
              <span>เปิดดูแบบเต็มจอ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
