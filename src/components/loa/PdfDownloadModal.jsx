import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoaDocument } from './LoaDocument';
import { Loader2, DownloadIcon, CheckCircle2Icon, FileTextIcon } from 'lucide-react';
import { toast } from 'sonner';

export function PdfDownloadModal({ open, onClose, loa, journal, issue, signer }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Menyiapkan dokumen...');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const documentRef = useRef(null);

  useEffect(() => {
    if (open && loa) {
      setProgress(10);
      setStatusText('Menyiapkan template A4 portrait...');
      setIsCompleted(false);
      setIsGenerating(true);

      const timer1 = setTimeout(() => {
        setProgress(40);
        setStatusText('Menderivasi spesimen TTD, stempel & QR code...');
      }, 300);

      const timer2 = setTimeout(() => {
        setProgress(75);
        setStatusText('Mengonversi dokumen ke format PDF...');
      }, 700);

      const timer3 = setTimeout(async () => {
        try {
          await generateAndDownloadPdf();
          setProgress(100);
          setStatusText('Dokumen PDF berhasil diunduh!');
          setIsCompleted(true);
          setIsGenerating(false);
          toast.success(`PDF LOA ${loa.number} berhasil diunduh.`);
        } catch (err) {
          console.error(err);
          setStatusText('Gagal mengonversi PDF. Silakan coba lagi.');
          setIsGenerating(false);
          toast.error('Gagal membuat berkas PDF.');
        }
      }, 1200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [open, loa]);

  const sanitizeCss = (str) => {
    if (!str) return str;
    let prev;
    let curr = str;
    do {
      prev = curr;
      curr = curr.replace(/(oklch|oklab|color-mix|light-dark|var)\([^()]*\)/gi, 'inherit');
    } while (curr !== prev);
    return curr;
  };

  const generateAndDownloadPdf = async () => {
    if (!documentRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = documentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 794,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Convert all unsupported color expressions in <style> tags and inline style attributes to standard inherit
          clonedDoc.querySelectorAll('style').forEach((style) => {
            if (style.textContent) {
              style.textContent = sanitizeCss(style.textContent);
            }
          });
          clonedDoc.querySelectorAll('*').forEach((el) => {
            const styleAttr = el.getAttribute('style');
            if (styleAttr && /(oklch|oklab|color-mix|light-dark)/i.test(styleAttr)) {
              el.setAttribute('style', sanitizeCss(styleAttr));
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `LOA_${(loa?.number || 'DOCUMENT').replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      throw err;
    }
  };

  if (!open || !loa) return null;

  const docData = {
    title: loa.title || '',
    authors: loa.authors || [],
    acceptedDate: loa.acceptedDate || '',
    letterDate: loa.letterDate || '',
    language: loa.language || 'id',
    notes: loa.notes || ''
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <FileTextIcon className="size-5 text-blue-600" />
            <span>Unduh Dokumen PDF LOA</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Dokumen resmi {loa.number} sedang diproses untuk diunduh.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Progress Bar Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">{statusText}</span>
              <span className="text-blue-600 font-bold">{progress}%</span>
            </div>
            
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Status Indicator Box */}
          <div className="p-3.5 rounded-lg border bg-slate-50 flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle2Icon className="size-6 text-emerald-500 shrink-0" />
            ) : (
              <Loader2 className="size-6 text-blue-600 animate-spin shrink-0" />
            )}
            <div className="text-xs">
              <div className="font-bold text-slate-900">
                {isCompleted ? 'Unduhan Selesai' : 'Menerbitkan Berkas PDF'}
              </div>
              <div className="text-slate-500 mt-0.5">
                {isCompleted
                  ? 'Berkas PDF telah tersimpan di folder unduhan Anda.'
                  : 'Mohon tunggu sebentar, sistem sedang merender spesimen resmi A4 portrait.'}
              </div>
            </div>
          </div>
        </div>

        {/* Mounted DOM Target for crisp canvas capture */}
        <div style={{ position: 'fixed', left: '-9999px', top: '0px', opacity: 1, pointerEvents: 'none', zIndex: -9999, width: '794px', background: '#ffffff' }}>
          <div ref={documentRef} style={{ width: '794px', background: '#ffffff', color: '#0f172a' }}>
            <LoaDocument
              journal={journal}
              issue={issue}
              signer={signer}
              data={docData}
              number={loa.number}
              token={loa.token}
              preview={false}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isGenerating}>
            {isCompleted ? 'Tutup' : 'Batal'}
          </Button>
          {isCompleted && (
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={generateAndDownloadPdf}
            >
              <DownloadIcon className="size-4" />
              <span>Unduh Ulang</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
