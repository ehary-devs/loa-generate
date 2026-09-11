import React, { useState } from 'react';
import { T, SANS, inputStyle } from '../utils/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaDocument } from '../components/loa/LoaDocument';
import { AuthorSheetDialog } from '../components/loa/AuthorSheetDialog';
import { PdfDownloadModal } from '../components/loa/PdfDownloadModal';
import { renderPattern, today } from '../utils/helpers';
import {
  SendIcon,
  SaveIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  DownloadIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  HistoryIcon,
  FileTextIcon,
  ArrowLeftIcon
} from 'lucide-react';

export function GeneratePage({ journal, loas, onIssue, onGoVerify, onGoHistory }) {
  const [form, setForm] = useState({
    issueId: journal.issues[0]?.id ?? null,
    signerId: journal.signers[0]?.id ?? null,
    title: "",
    authors: [{ name: "", affiliation: "", email: "", corresponding: true }],
    submittedDate: "",
    acceptedDate: today(),
    letterDate: today(),
    language: journal.code === "IJCSE" ? "en" : "id",
    notes: "",
  });
  const [justIssued, setJustIssued] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfTargetLoa, setPdfTargetLoa] = useState(null);

  // Author Sheet state
  const [authorSheetOpen, setAuthorSheetOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);

  const issue = journal.issues.find((i) => String(i.id) === String(form.issueId)) || null;
  const signer = journal.signers.find((s) => String(s.id) === String(form.signerId)) || null;

  const nextNumber = renderPattern(journal.pattern, {
    n: journal.counter + 1,
    journal,
    issue,
    date: new Date(form.letterDate + "T00:00:00"),
  });

  const ready = form.title.trim() && form.authors.some((a) => a.name.trim()) && signer;

  const handleSaveAuthor = ({ index, authorData }) => {
    setForm((prev) => {
      let updatedAuthors = [...prev.authors];

      if (authorData.corresponding) {
        updatedAuthors = updatedAuthors.map((a) => ({ ...a, corresponding: false }));
      }

      if (index !== null && index !== undefined) {
        updatedAuthors[index] = authorData;
      } else {
        if (updatedAuthors.length === 0) {
          authorData.corresponding = true;
        }
        updatedAuthors.push(authorData);
      }

      if (!updatedAuthors.some((a) => a.corresponding) && updatedAuthors.length > 0) {
        updatedAuthors[0].corresponding = true;
      }

      return { ...prev, authors: updatedAuthors };
    });
  };

  const handleIssue = async () => {
    setIsSubmitting(true);
    const result = await onIssue({ ...form, issue, signer });
    setIsSubmitting(false);
    setJustIssued(result);
  };

  // --- DEDICATED LOA RESULT PAGE VIEW ---
  if (justIssued) {
    const publishedLoaData = {
      title: justIssued.title || form.title,
      authors: justIssued.authors || form.authors,
      acceptedDate: justIssued.acceptedDate || form.acceptedDate,
      letterDate: justIssued.letterDate || form.letterDate,
      language: justIssued.language || form.language,
      notes: justIssued.notes || form.notes,
      number: justIssued.number,
      token: justIssued.token,
    };

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Success Header & Action Card */}
        <Card className="border-emerald-200 bg-emerald-50/50 shadow-xs">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 shadow-xs">
                  <CheckCircle2Icon className="size-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-0.5">
                      LOA Berhasil Diterbitkan
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">Urutan #{justIssued.sequence}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
                    {justIssued.number}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Dokumen resmi Letter of Acceptance telah diterbitkan dan dibekukan di database. Kode verifikasi: <code className="bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono text-emerald-800 font-bold text-xs">{justIssued.token}</code>
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold"
                  onClick={() => setPdfTargetLoa(publishedLoaData)}
                >
                  <DownloadIcon className="size-4" />
                  <span>Download PDF</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="gap-2 bg-white hover:bg-slate-50 border-slate-300 text-slate-700 font-medium"
                  onClick={() => onGoVerify(justIssued.token)}
                >
                  <ShieldCheckIcon className="size-4 text-emerald-600" />
                  <span>Halaman Verifikasi</span>
                </Button>

                {onGoHistory && (
                  <Button
                    variant="outline"
                    className="gap-2 bg-white hover:bg-slate-50 border-slate-300 text-slate-700 font-medium"
                    onClick={onGoHistory}
                  >
                    <HistoryIcon className="size-4 text-slate-600" />
                    <span>Ke Riwayat</span>
                  </Button>
                )}

                <Button
                  variant="secondary"
                  className="gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium"
                  onClick={() => {
                    setJustIssued(null);
                    setForm({
                      issueId: journal.issues[0]?.id ?? null,
                      signerId: journal.signers[0]?.id ?? null,
                      title: "",
                      authors: [{ name: "", affiliation: "", email: "", corresponding: true }],
                      submittedDate: "",
                      acceptedDate: today(),
                      letterDate: today(),
                      language: journal.code === "IJCSE" ? "en" : "id",
                      notes: "",
                    });
                  }}
                >
                  <PlusIcon className="size-4" />
                  <span>Terbitkan LOA Lain</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dedicated Full LOA Document Presentation */}
        <div className="bg-slate-100 p-4 sm:p-8 rounded-xl border border-slate-200 shadow-inner flex flex-col items-center">
          <div className="w-full max-w-[794px] flex items-center justify-between mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-blue-600" />
              <span>Dokumen Resmi LOA Diterbitkan (A4 Portrait)</span>
            </div>
            <span>Status: Active / Verified</span>
          </div>

          <div className="bg-white shadow-2xl rounded-sm overflow-hidden max-w-[794px] w-full border border-slate-300">
            <LoaDocument
              journal={journal}
              issue={issue}
              signer={signer}
              data={publishedLoaData}
              number={justIssued.number}
              token={justIssued.token}
              preview={false}
            />
          </div>
        </div>

        {pdfTargetLoa && (
          <PdfDownloadModal
            open={!!pdfTargetLoa}
            onClose={() => setPdfTargetLoa(null)}
            loa={pdfTargetLoa}
            journal={journal}
            issue={issue}
            signer={signer}
          />
        )}
      </div>
    );
  }

  // --- FORM VIEW (BEFORE ISSUE) ---
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-6 items-start">
      <div className="flex flex-col gap-5 w-full min-w-0">
        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl font-bold">Artikel</CardTitle>
            <CardDescription className="text-sm mt-1">
              Formulir judul naskah, daftar penulis, dan tanggal penerbitan surat.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Judul artikel</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Tulis judul sesuai naskah final"
              />
            </div>

            {/* Author List & Drawer trigger */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-800">Daftar Penulis</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setEditingAuthor(null);
                    setAuthorSheetOpen(true);
                  }}
                >
                  <PlusIcon className="size-3.5" />
                  Tambah Penulis
                </Button>
              </div>

              <div className="space-y-2 mt-1">
                {form.authors.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {i + 1}. {a.name || <span className="italic text-slate-400">Belum diisi (Klik Edit)</span>}
                        </span>
                        {a.corresponding && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0 font-medium border-amber-200">
                            Korespondensi
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {a.affiliation && <span>{a.affiliation}</span>}
                        {a.affiliation && a.email && <span> &bull; </span>}
                        {a.email && <span>{a.email}</span>}
                        {!a.affiliation && !a.email && <span className="italic">Tanpa detail tambahan</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        onClick={() => {
                          setEditingAuthor({ index: i, ...a });
                          setAuthorSheetOpen(true);
                        }}
                        title="Edit Penulis"
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      {form.authors.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setForm((f) => ({
                              ...f,
                              authors: f.authors.filter((_, idx) => idx !== i),
                            }));
                          }}
                          title="Hapus Penulis"
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {form.authors.length === 0 && (
                  <div
                    onClick={() => {
                      setEditingAuthor(null);
                      setAuthorSheetOpen(true);
                    }}
                    className="p-4 border border-dashed rounded-lg text-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-xs text-slate-500">Belum ada penulis. Klik untuk menambah penulis.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Tanggal submit</Label>
                <DatePicker
                  value={form.submittedDate}
                  onChange={(date) => setForm({ ...form, submittedDate: date })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tanggal diterima</Label>
                <DatePicker
                  value={form.acceptedDate}
                  onChange={(date) => setForm({ ...form, acceptedDate: date })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tanggal surat</Label>
                <DatePicker
                  value={form.letterDate}
                  onChange={(date) => setForm({ ...form, letterDate: date })}
                />
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2 border rounded-lg bg-slate-50"
            >
              <div>
                <div className="text-xs text-muted-foreground">
                  Nomor yang akan dipakai
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 16, color: T.ink }} className="font-semibold">{nextNumber}</div>
              </div>
              <div className="text-xs text-muted-foreground sm:text-right">
                pola {journal.pattern}
                <br />
                urutan terakhir {journal.counter}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={handleIssue} disabled={!ready || isSubmitting} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                <SendIcon className="size-4" />
                {isSubmitting ? "Menerbitkan..." : "Terbitkan LOA"}
              </Button>
              <Button variant="outline" disabled={!ready || isSubmitting} className="gap-2">
                <SaveIcon className="size-4" />
                Simpan draf
              </Button>
              {!ready ? (
                <span className="text-xs text-muted-foreground w-full sm:w-auto">
                  Judul dan minimal satu nama penulis wajib diisi.
                </span>
              ) : null}
            </div>
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl font-bold">Penerbitan</CardTitle>
            <CardDescription className="text-sm mt-1">
              Pilihan edisi penerbitan, pejabat penandatangan, dan bahasa dokumen.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Edisi tujuan</Label>
                <Select
                  value={form.issueId ? String(form.issueId) : ""}
                  onValueChange={(val) => setForm({ ...form, issueId: val || null })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Belum ditentukan">
                      {form.issueId && issue 
                        ? `Vol. ${issue.volume} No. ${issue.number} (${issue.year}) — ${issue.label}` 
                        : "Belum ditentukan"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Belum ditentukan</SelectItem>
                    {journal.issues.map((i) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        Vol. {i.volume} No. {i.number} ({i.year}) — {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Penandatangan</Label>
                <Select
                  value={form.signerId ? String(form.signerId) : ""}
                  onValueChange={(val) => setForm({ ...form, signerId: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih penandatangan...">
                      {form.signerId && signer
                        ? `${signer.name} — ${signer.position}`
                        : "Pilih..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {journal.signers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — {s.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Bahasa surat</Label>
                <Select
                  value={form.language}
                  onValueChange={(val) => setForm({ ...form, language: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih bahasa">
                      {form.language === "id" ? "Indonesia" : "Inggris"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Indonesia</SelectItem>
                    <SelectItem value="en">Inggris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Catatan tambahan</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="mis. Artikel dijadwalkan terbit pada halaman 45–58."
                />
                <span className="text-[11px] text-muted-foreground">Opsional, muncul sebagai paragraf di surat.</span>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

        <p className="text-xs" style={{ color: T.muted }}>
          Nomor baru dialokasikan saat tombol terbitkan ditekan, bukan saat draf dibuat, jadi draf
          yang dibatalkan tidak meninggalkan nomor kosong. Setelah terbit, data dibekukan — perbaikan
          dilakukan dengan mencabut lalu menerbitkan ulang.
        </p>
      </div>

      <div style={{ minWidth: 0 }}>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 10 }}>
          <h2 className="text-base font-medium" style={{ color: T.ink }}>
            Pratinjau dokumen
          </h2>
          <span className="text-xs" style={{ color: T.muted }}>
            A4 · template {form.language === "en" ? "English" : "Indonesia"}
          </span>
        </div>
        <LoaDocument
          journal={journal}
          issue={issue}
          signer={signer}
          data={form}
          number={justIssued?.number || null}
          token={justIssued?.token || null}
          preview
        />
        <div className="text-xs" style={{ color: T.muted, marginTop: 10 }}>
          Di produksi, HTML yang sama dirender jadi PDF lewat headless Chromium, lalu di-hash
          SHA-256 dan disimpan di storage privat.
        </div>
      </div>

      <AuthorSheetDialog
        open={authorSheetOpen}
        onClose={() => setAuthorSheetOpen(false)}
        author={editingAuthor}
        onSaveAuthor={handleSaveAuthor}
      />
    </div>
  );
}
