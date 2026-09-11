import React from 'react';
import { QrCode } from '../ui';
import { tanggalPanjang, longDateEn } from '../../utils/helpers';

export function LoaDocument({ journal, issue, signer, data, number, token, preview }) {
  const en = data.language === "en";

  // Build authors and affiliations list
  const validAuthors = (data.authors || []).filter((a) => a.name?.trim());
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
        fontFamily: "'Times New Roman', Times, serif",
        padding: "36px 44px 36px",
        lineHeight: 1.5,
        fontSize: "12.5px",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        color: "#0f172a"
      }}
    >
      {/* Background Watermark */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-25deg)',
          opacity: 0.035,
          fontWeight: 900,
          fontSize: '64px',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#0f172a',
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          zIndex: 0
        }}
      >
        STEKOM
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '808px' }}>
        <div>
          {/* Header Kop Surat */}
          <div style={{ borderBottom: '2px solid #D97706', paddingBottom: '12px', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '56px', verticalAlign: 'middle', paddingRight: '12px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      backgroundColor: '#14213A', 
                      border: '2px solid #D97706', 
                      color: '#ffffff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold', 
                      fontSize: '16px',
                      fontFamily: 'sans-serif'
                    }}>
                      ST
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#14213A', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Times New Roman', serif" }}>
                      UNIVERSITAS SAINS DAN TEKNOLOGI KOMPUTER
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'sans-serif', marginTop: '2px' }}>
                      Lembaga Penelitian dan Pengabdian kepada Masyarakat
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#D97706', fontFamily: "'Times New Roman', serif", marginTop: '2px' }}>
                      {en ? (journal?.nameEn || journal?.name) : journal?.name}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'middle', fontSize: '10px', color: '#64748b', fontFamily: 'sans-serif', lineHeight: 1.35, whiteSpace: 'nowrap' }}>
                    <div>Jl. Majapahit No.605, Semarang,</div>
                    <div>Jawa Tengah</div>
                    <div style={{ color: '#475569', fontWeight: 500, marginTop: '2px' }}>jurnal@stekom.ac.id</div>
                    <div style={{ color: '#475569', fontWeight: 500 }}>jurnal.stekom.ac.id</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Letter Title & Badge */}
          <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
            <div style={{ 
              display: 'inline-block', 
              backgroundColor: '#D9531E', 
              color: '#ffffff', 
              fontFamily: 'sans-serif', 
              fontWeight: 'bold', 
              fontSize: '13px', 
              padding: '4px 16px', 
              letterSpacing: '0.2em', 
              textTransform: 'uppercase', 
              borderRadius: '2px' 
            }}>
              LETTER OF ACCEPTANCE
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>
              Surat Pernyataan Penerimaan Artikel Jurnal
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginTop: '6px' }}>
              Nomor: <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{number || "1732/LOA-MAHASISWA/UNIV.STEKOM/I-2026"}</span>
            </div>
          </div>

          {/* Body Content */}
          <div style={{ fontSize: '12.5px', lineHeight: 1.6, color: '#1e293b' }}>
            <div style={{ marginBottom: '8px' }}>
              Kepada Yth.
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '75px', fontWeight: 'bold', color: '#0f172a', verticalAlign: 'top', padding: '2px 0' }}>Penulis</td>
                  <td style={{ verticalAlign: 'top', padding: '2px 0' }}>: <strong style={{ fontWeight: 'bold', color: '#0f172a' }}>{authorsLine || (en ? "Christine Adriani Puspito, Kunto Adi Wibowo, Detta Rahmawan" : "Christine Adriani Puspito, Kunto Adi Wibowo, Detta Rahmawan")}</strong></td>
                </tr>
                <tr>
                  <td style={{ width: '75px', fontWeight: 'bold', color: '#0f172a', verticalAlign: 'top', padding: '2px 0' }}>Afiliasi</td>
                  <td style={{ verticalAlign: 'top', padding: '2px 0' }}>: <strong style={{ fontWeight: 'bold', color: '#0f172a' }}>{affiliationsList || "Program Studi Ilmu Komunikasi, Fakultas Ilmu Komunikasi, Universitas Padjadjaran, Indonesia"}</strong></td>
                </tr>
              </tbody>
            </table>

            <p style={{ margin: '12px 0 8px 0' }}>
              {en
                ? `Thank you for submitting your manuscript to ${journal?.nameEn || journal?.name}. Following a thorough peer-review process, we are pleased to inform you that your manuscript titled:`
                : `Terima kasih telah mengirimkan artikel jurnal melalui redaksi ${journal?.name}. Setelah melalui proses review sejawat (peer review), kami menyampaikan bahwa artikel dengan judul:`}
            </p>

            {/* Article Title */}
            <div style={{ margin: '12px 0', textAlign: 'center', padding: '4px 12px' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                &ldquo;{data.title ? data.title.toUpperCase() : "DAMSEL IN DISTRESS: ANALISIS REPRESENTASI GENDER PADA POSTER FILM DISNEY UNTUK ANAK-ANAK"}&rdquo;
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#334155', margin: '8px 0 12px 0' }}>
              dinyatakan dengan status sebagai berikut:
            </p>

            {/* Editorial Decision Box */}
            <div style={{ margin: '14px 0', padding: '10px 0', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.25em', color: '#64748b', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                KEPUTUSAN REDAKSI
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#047857', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '4px 0' }}>
                DITERIMA (ACCEPTED)
              </div>
            </div>

            {/* Publication Issue Info */}
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '12px', color: '#1e293b', margin: '0 0 6px 0' }}>
                Artikel akan diterbitkan pada:
              </p>
              <table style={{ width: '280px', borderCollapse: 'collapse', fontSize: '12px', color: '#0f172a' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '140px', padding: '2px 0' }}>Volume : <strong>{issue?.volume || '8'}</strong></td>
                    <td style={{ padding: '2px 0' }}>Bulan : <strong>{issue?.month || (issue?.label ? issue.label.split(' ')[0] : 'Juni')}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0' }}>Nomor : <strong>{issue?.number || '2'}</strong></td>
                    <td style={{ padding: '2px 0' }}>Tahun : <strong>{issue?.year || '2026'}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: '14px', fontSize: '12px', color: '#1e293b' }}>
              Demikian surat ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>
        </div>

        {/* Footer: Signer & QR Code */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          {/* QR Code Container */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ padding: '4px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
              <QrCode value={token || "PREVIEW"} px={68} />
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b', fontFamily: 'sans-serif', marginTop: '4px', textAlign: 'center', lineHeight: 1.3 }}>
              {verifyUrl}
              <br />
              <span style={{ fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>
                {token || "QR akan dibuat setelah terbit"}
              </span>
            </div>
          </div>

          {/* Signature Block */}
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#0f172a', minWidth: '220px' }}>
            <div>Semarang, {data.letterDate ? (en ? longDateEn(data.letterDate) : tanggalPanjang(data.letterDate)) : "20 Juni 2026"}</div>
            <div style={{ color: '#334155', marginTop: '2px' }}>{signer?.position || "Editor in Chief,"}</div>
            
            {/* Signature Image / Spacing */}
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', margin: '4px 0' }}>
              {signer?.signatureImage ? (
                <img src={signer.signatureImage} alt="Tanda tangan" style={{ height: '48px', maxWidth: '160px', objectFit: 'contain', marginLeft: 'auto' }} />
              ) : (
                <div style={{ height: '48px' }} />
              )}
            </div>

            <div style={{ fontWeight: 'bold', fontSize: '12.5px', color: '#0f172a', textDecoration: 'underline' }}>
              {signer?.name || "Dr. Ahmad Riyanto, M.Kom."}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
              NIDN. {signer?.nidn || "0612058501"}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
