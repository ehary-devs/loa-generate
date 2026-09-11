import React, { useState } from 'react';
import { T, SANS, SERIF } from '../utils/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { tanggalPanjang } from '../utils/helpers';

export function VerifyPage({ loas, journals, initialToken }) {
  const [input, setInput] = useState(initialToken || "");
  const [checked, setChecked] = useState(initialToken ? initialToken : null);

  const found = checked
    ? loas.find((l) => l.token.toUpperCase() === checked.trim().toUpperCase())
    : null;
  const journal = found ? journals.find((j) => j.id === found.journalId) : null;
  const signer = journal ? journal.signers.find((s) => s.id === found.signerId) : null;
  const issue = journal ? journal.issues.find((i) => i.id === found.issueId) : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-xl font-bold">Verifikasi Letter of Acceptance (LOA)</CardTitle>
          <CardDescription className="text-sm mt-1">
            Periksa keaslian dokumen LOA dengan memasukkan 10 karakter kode unik yang tercetak di bawah QR code.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                style={{ fontFamily: SERIF, fontSize: 17, letterSpacing: 2 }}
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="7H2QK9XM4T"
                className="max-w-xs h-10"
              />
              <Button onClick={() => setChecked(input)} className="h-10 px-5">Periksa</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Akses publik: <span className="font-mono text-foreground">loa.devs.web.id/v/[TOKEN]</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {checked ? (
        found ? (
          <section
            className="p-5"
            style={{
              background: "#fff",
              border: `1px solid ${found.status === "issued" ? T.seal : T.revoked}`,
              borderRadius: 6,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  style={{
                    color: found.status === "issued" ? T.seal : T.revoked,
                    fontFamily: SERIF,
                    fontSize: 20,
                  }}
                >
                  {found.status === "issued" ? "Dokumen sah" : "Dokumen telah dicabut"}
                </div>
                <div className="text-sm" style={{ color: T.inkSoft, marginTop: 2 }}>
                  {found.status === "issued"
                    ? "Data di bawah diambil dari arsip penerbitan, bukan dari berkas yang Anda pegang."
                    : "Surat ini pernah diterbitkan, namun sudah dinyatakan tidak berlaku."}
                </div>
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  border: `2px solid ${found.status === "issued" ? T.seal : T.revoked}`,
                  color: found.status === "issued" ? T.seal : T.revoked,
                  fontFamily: SERIF,
                  fontSize: 11,
                  textAlign: "center",
                  lineHeight: 1.15,
                  flexShrink: 0,
                }}
              >
                {found.status === "issued" ? "TER-\nVERIFIKASI" : "DICABUT"}
              </div>
            </div>

            <table style={{ width: "100%", marginTop: 18, fontSize: 14, borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Nomor LOA", found.number],
                  ["Jurnal", `${journal.name} — ISSN ${journal.issn}`],
                  ["Judul artikel", found.title],
                  ["Penulis", found.authors.map((a) => a.name).filter(Boolean).join("; ")],
                  ["Tanggal diterima", tanggalPanjang(found.acceptedDate)],
                  [
                    "Rencana terbit",
                    issue ? `Vol. ${issue.volume} No. ${issue.number} (${issue.year})` : "belum ditentukan",
                  ],
                  ["Penandatangan", signer ? `${signer.name} — ${signer.position}` : "—"],
                  ["SHA-256 berkas", found.hash],
                  found.revokeReason ? ["Alasan pencabutan", found.revokeReason] : null,
                ]
                  .filter(Boolean)
                  .map(([k, v]) => (
                    <tr key={k} style={{ borderTop: `1px solid ${T.line}` }}>
                      <td
                        style={{ padding: "9px 12px 9px 0", color: T.muted, width: 160, verticalAlign: "top" }}
                      >
                        {k}
                      </td>
                      <td
                        style={{
                          padding: "9px 0",
                          color: T.ink,
                          verticalAlign: "top",
                          wordBreak: k === "SHA-256 berkas" ? "break-all" : "normal",
                          fontFamily: k === "SHA-256 berkas" ? SERIF : SANS,
                        }}
                      >
                        {v}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="flex gap-2" style={{ marginTop: 16 }}>
              <Button size="sm" variant="outline">Lihat PDF arsip</Button>
              <Button size="sm" variant="outline">Laporkan kejanggalan</Button>
            </div>
          </section>
        ) : (
          <section
            className="p-5"
            style={{ background: "#fff", border: `1px solid ${T.revoked}`, borderRadius: 6 }}
          >
            <div style={{ color: T.revoked, fontFamily: SERIF, fontSize: 20 }}>
              Kode tidak ditemukan
            </div>
            <p className="text-sm" style={{ color: T.inkSoft, marginTop: 6 }}>
              Tidak ada LOA dengan kode {checked.trim().toUpperCase()} di arsip. Periksa kembali
              ketikannya, atau hubungi redaksi jurnal yang tercantum pada surat. Coba{" "}
              <span style={{ fontFamily: SERIF }}>7H2QK9XM4T</span> untuk contoh dokumen sah dan{" "}
              <span style={{ fontFamily: SERIF }}>R4TNP8ZC2K</span> untuk contoh yang dicabut.
            </p>
          </section>
        )
      ) : null}
    </div>
  );
}
