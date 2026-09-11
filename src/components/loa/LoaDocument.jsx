import React from 'react';
import { T, SANS, SERIF } from '../../utils/theme';
import { QrCode } from '../ui';
import { tanggalPanjang, longDateEn } from '../../utils/helpers';

export function LoaDocument({ journal, issue, signer, data, number, token, preview }) {
  const en = data.language === "en";

  // Build authors and affiliations list
  const validAuthors = data.authors.filter((a) => a.name.trim());
  const authorsLine = validAuthors.map((a) => a.name.trim()).join(", ");
  
  const affiliationsList = Array.from(
    new Set(validAuthors.map((a) => a.affiliation?.trim()).filter(Boolean))
  ).join("; ");

  const verifyUrl = `loa.devs.web.id/v/${token || "XXXXXXXXXX"}`;

  return (
    <article
      className="relative bg-white border border-slate-300 shadow-md mx-auto text-slate-900 overflow-hidden select-none rounded-sm"
      style={{
        width: "100%",
        maxWidth: "680px",
        minHeight: "880px",
        fontFamily: SERIF,
        padding: "36px 44px 36px",
        lineHeight: 1.5,
        fontSize: "12.5px",
      }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.035] font-black text-6xl sm:text-7xl rotate-[-25deg] uppercase tracking-widest text-slate-900 z-0">
        STEKOM
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[808px]">
        <div>
          {/* Header Kop Surat */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-[#D97706] pb-3">
            <div className="flex items-center gap-3">
              {/* Circular Logo */}
              <div className="size-13 rounded-full bg-[#14213A] border-2 border-[#D97706] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 font-sans">
                ST
              </div>
              <div>
                <div className="text-xs font-bold text-[#14213A] tracking-wider uppercase font-serif">
                  UNIVERSITAS SAINS DAN TEKNOLOGI KOMPUTER
                </div>
                <div className="text-[11px] text-slate-600 font-sans mt-0.5">
                  Lembaga Penelitian dan Pengabdian kepada Masyarakat
                </div>
                <div className="text-xs font-bold text-[#D97706] font-serif mt-0.5">
                  {en ? (journal?.nameEn || journal?.name) : journal?.name}
                </div>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-500 font-sans leading-tight shrink-0 hidden sm:block">
              <div>Jl. Majapahit No.605, Semarang,</div>
              <div>Jawa Tengah</div>
              <div className="text-slate-600 font-medium mt-0.5">jurnal@stekom.ac.id</div>
              <div className="text-slate-600 font-medium">jurnal.stekom.ac.id</div>
            </div>
          </div>

          {/* Letter Title & Badge */}
          <div className="text-center mt-5 mb-4">
            <div className="inline-block bg-[#D9531E] text-white font-sans font-bold text-xs sm:text-sm px-4 py-1 tracking-[0.2em] uppercase rounded-xs shadow-2xs">
              LETTER OF ACCEPTANCE
            </div>
            <div className="text-[11px] text-slate-500 font-serif italic mt-1">
              Surat Pernyataan Penerimaan Artikel Jurnal
            </div>
            <div className="text-xs font-semibold text-slate-800 font-serif mt-2">
              Nomor: <span className={number ? "text-slate-900" : "text-slate-700 font-semibold"}>{number || "1732/LOA-MAHASISWA/UNIV.STEKOM/I-2026"}</span>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-3 text-xs sm:text-[12.5px] leading-relaxed text-slate-800">
            <div>
              <span className="font-serif">Kepada Yth.</span>
            </div>

            <div className="grid grid-cols-[75px_1fr] gap-x-1 gap-y-1 mt-1">
              <span className="font-bold text-slate-900">Penulis</span>
              <span>: <strong className="font-bold text-slate-900">{authorsLine || (en ? "Christine Adriani Puspito, Kunto Adi Wibowo, Detta Rahmawan" : "Christine Adriani Puspito, Kunto Adi Wibowo, Detta Rahmawan")}</strong></span>
              
              <span className="font-bold text-slate-900">Afiliasi</span>
              <span>: <strong className="font-bold text-slate-900">{affiliationsList || "Program Studi Ilmu Komunikasi, Fakultas Ilmu Komunikasi, Universitas Padjadjaran, Indonesia"}</strong></span>
            </div>

            <p className="mt-3">
              {en
                ? `Thank you for submitting your manuscript to ${journal?.nameEn || journal?.name}. Following a thorough peer-review process, we are pleased to inform you that your manuscript titled:`
                : `Terima kasih telah mengirimkan artikel jurnal melalui redaksi ${journal?.name}. Setelah melalui proses review sejawat (peer review), kami menyampaikan bahwa artikel dengan judul:`}
            </p>

            {/* Article Title */}
            <div className="my-3 text-center px-4 py-1">
              <div className="font-extrabold text-slate-900 text-xs sm:text-sm leading-relaxed font-serif uppercase tracking-wide">
                &ldquo;{data.title ? data.title.toUpperCase() : "DAMSEL IN DISTRESS: ANALISIS REPRESENTASI GENDER PADA POSTER FILM DISNEY UNTUK ANAK-ANAK"}&rdquo;
              </div>
            </div>

            <p className="text-center text-xs text-slate-700">
              dinyatakan dengan status sebagai berikut:
            </p>

            {/* Editorial Decision */}
            <div className="mt-3 pt-2 border-t border-slate-200/80 text-center">
              <div className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase font-sans">
                KEPUTUSAN REDAKSI
              </div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-700 tracking-wider uppercase my-1 font-serif">
                DITERIMA (ACCEPTED)
              </div>
              <div className="border-b border-slate-200/80 mt-2 mb-3" />
            </div>

            {/* Publication Issue Info */}
            <div>
              <p className="text-xs font-serif text-slate-800">
                Artikel akan diterbitkan pada:
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 my-2 text-xs font-serif text-slate-900 max-w-xs">
                <div>Volume : <strong className="font-bold">{issue?.volume || '8'}</strong></div>
                <div>Bulan : <strong className="font-bold">{issue?.month || (issue?.label ? issue.label.split(' ')[0] : 'Juni')}</strong></div>
                <div>Nomor : <strong className="font-bold">{issue?.number || '2'}</strong></div>
                <div>Tahun : <strong className="font-bold">{issue?.year || '2026'}</strong></div>
              </div>
            </div>

            <p className="mt-3 text-xs font-serif text-slate-800">
              Demikian surat ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>
        </div>

        {/* Footer: Signer & QR Code */}
        <div className="flex items-end justify-between mt-6 pt-4 border-t border-slate-100">
          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            <div className="p-1 bg-white border border-slate-200 rounded-md shadow-2xs">
              <QrCode value={token || "PREVIEW"} px={68} />
            </div>
            <div className="text-[9.5px] text-slate-500 font-sans mt-1 text-center leading-tight">
              {verifyUrl}
              <br />
              <span className="font-mono text-slate-700 font-semibold">
                {token || "QR akan dibuat setelah terbit"}
              </span>
            </div>
          </div>

          {/* Signature Block */}
          <div className="text-right text-xs font-serif text-slate-900 min-w-[200px]">
            <div>Semarang, {data.letterDate ? (en ? longDateEn(data.letterDate) : tanggalPanjang(data.letterDate)) : "20 Juni 2026"}</div>
            <div className="text-slate-800 mt-0.5">{signer?.position || "Editor in Chief,"}</div>
            
            {/* Signature Image / Cursive Representation */}
            <div className="h-14 flex items-center justify-end my-1">
              {signer?.signatureImage ? (
                <img src={signer.signatureImage} alt="Tanda tangan" className="h-12 max-w-[160px] object-contain" />
              ) : (
                <div className="text-xl font-bold italic text-blue-900 font-serif tracking-tight pr-2">
                  {signer?.name || "Ahmad Riyanto"}
                </div>
              )}
            </div>

            <div className="font-bold text-xs text-slate-900 underline font-serif">
              {signer?.name || "Dr. Ahmad Riyanto, M.Kom."}
            </div>
            <div className="text-[11px] text-slate-600 font-serif mt-0.5">
              NIDN. {signer?.nidn || "0612058501"}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
