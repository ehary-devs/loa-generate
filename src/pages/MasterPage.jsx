import React, { useState, useEffect } from 'react';
import { T, SERIF } from '../utils/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { renderPattern } from '../utils/helpers';
import { toast } from 'sonner';
import { Save, Loader2, Plus, Pencil, Trash2, FileCheck } from 'lucide-react';
import { SignerSheetDialog } from '@/components/signers/SignerSheetDialog';

export function MasterPage({ journal, onPattern, refreshData }) {
  const [formData, setFormData] = useState({
    name: journal?.name || '',
    nameEn: journal?.nameEn || '',
    code: journal?.code || '',
    issn: journal?.issn || '',
    pattern: journal?.pattern || '',
    reset: journal?.reset || 'never',
    counter: journal?.counter ?? 0,
  });

  const [savingSection, setSavingSection] = useState(null); // 'profile' | 'format' | null
  const [isSignerSheetOpen, setIsSignerSheetOpen] = useState(false);
  const [editingSigner, setEditingSigner] = useState(null);

  useEffect(() => {
    if (journal) {
      setFormData({
        name: journal.name || '',
        nameEn: journal.nameEn || '',
        code: journal.code || '',
        issn: journal.issn || '',
        pattern: journal.pattern || '',
        reset: journal.reset || 'never',
        counter: journal.counter ?? 0,
      });
    }
  }, [journal]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePatternChange = (newPattern) => {
    handleChange('pattern', newPattern);
    if (onPattern) {
      onPattern(newPattern);
    }
  };

  const handleSaveSection = async (sectionKey, successMsg) => {
    if (!journal?.id) {
      toast.error('Jurnal tidak ditemukan.');
      return;
    }

    setSavingSection(sectionKey);
    try {
      const token = localStorage.getItem('siloa_token');
      const res = await fetch(`/api/journals/${journal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          nameEn: formData.nameEn,
          code: formData.code,
          issn: formData.issn,
          pattern: formData.pattern,
          reset: formData.reset,
          counter: Number(formData.counter),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menyimpan perubahan.');
      }

      toast.success(successMsg);
      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan sistem saat menyimpan.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleOpenAddSigner = () => {
    setEditingSigner(null);
    setIsSignerSheetOpen(true);
  };

  const handleOpenEditSigner = (signer) => {
    setEditingSigner(signer);
    setIsSignerSheetOpen(true);
  };

  const handleDeleteSigner = async (signerId) => {
    try {
      const token = localStorage.getItem('siloa_token');
      const res = await fetch(`/api/signers/${signerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Penandatangan berhasil dihapus.');
        if (refreshData) {
          await refreshData();
        }
      } else {
        toast.error(data.error || 'Gagal menghapus penandatangan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan sistem saat menghapus penandatangan.');
    }
  };

  const sampleIssue = journal?.issues?.[0];
  const sample = renderPattern(formData.pattern, {
    n: Number(formData.counter) + 1,
    journal: { ...journal, code: formData.code, name: formData.name },
    issue: sampleIssue,
    date: new Date(),
  });

  const tokens = [
    ['{n:3}', 'urutan dengan padding'],
    ['{tahun}', '2026'],
    ['{tahun2}', '26'],
    ['{bulan}', '09'],
    ['{bulan_romawi}', 'IX'],
    ['{kode}', formData.code || 'KODE'],
    ['{vol}', 'volume edisi'],
    ['{no}', 'nomor edisi'],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Profil Jurnal Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold">Profil Jurnal</CardTitle>
            <CardDescription className="text-sm mt-1">
              Pengaturan nama resmi, kode singkatan, dan nomor ISSN jurnal.
            </CardDescription>
          </div>
          <Button
            onClick={() => handleSaveSection('profile', 'Profil jurnal berhasil disimpan.')}
            disabled={savingSection !== null}
            className="gap-2 shadow-sm font-semibold h-10 px-5 text-sm shrink-0"
          >
            {savingSection === 'profile' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Profil</span>
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="journal-name">Nama jurnal</Label>
              <Input
                id="journal-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Masukkan nama jurnal"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="journal-nameEn">Nama (Inggris)</Label>
              <Input
                id="journal-nameEn"
                value={formData.nameEn}
                onChange={(e) => handleChange('nameEn', e.target.value)}
                placeholder="Masukkan nama bahasa Inggris"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="journal-code">Kode jurnal</Label>
              <Input
                id="journal-code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="misal: JTIK"
              />
              <span className="text-[11px] text-muted-foreground">
                Dipakai token {'{kode}'} di pola nomor LOA.
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="journal-issn">ISSN</Label>
              <Input
                id="journal-issn"
                value={formData.issn}
                onChange={(e) => handleChange('issn', e.target.value)}
                placeholder="misal: 2723-1178 (online)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Format Nomor LOA Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold">Format Nomor LOA</CardTitle>
            <CardDescription className="text-sm mt-1">
              Atur pola penomoran otomatis dan strategi pencacahan reset urutan.
            </CardDescription>
          </div>
          <Button
            onClick={() => handleSaveSection('format', 'Format nomor LOA berhasil disimpan.')}
            disabled={savingSection !== null}
            className="gap-2 shadow-sm font-semibold h-10 px-5 text-sm shrink-0"
          >
            {savingSection === 'format' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Format</span>
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="journal-pattern">Pola</Label>
              <Input
                id="journal-pattern"
                style={{ fontFamily: SERIF, fontSize: 15 }}
                value={formData.pattern}
                onChange={(e) => handlePatternChange(e.target.value)}
                placeholder="{n:3}/LOA/{kode}/{bulan_romawi}/{tahun}"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {tokens.map(([tk, desc]) => (
                <button
                  key={tk}
                  type="button"
                  onClick={() => handlePatternChange(formData.pattern + tk)}
                  title={desc}
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13,
                    color: T.brass,
                    background: '#fff',
                    border: `1px solid ${T.line}`,
                    borderRadius: 4,
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                  className="hover:border-slate-400 transition-colors"
                >
                  {tk}
                </button>
              ))}
            </div>
            <div className="p-3 bg-slate-50 border rounded-md">
              <div className="text-xs text-muted-foreground font-medium">
                Contoh hasil untuk nomor berikutnya
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }} className="mt-1 font-semibold">
                {sample}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="journal-reset">Reset urutan</Label>
                <Select
                  value={formData.reset}
                  onValueChange={(val) => handleChange('reset', val)}
                >
                  <SelectTrigger id="journal-reset">
                    <SelectValue placeholder="Pilih strategi reset">
                      {{
                        never: 'Tidak pernah',
                        yearly: 'Setiap tahun',
                        monthly: 'Setiap bulan',
                        per_issue: 'Setiap edisi',
                      }[formData.reset] || 'Pilih strategi reset'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Tidak pernah</SelectItem>
                    <SelectItem value="yearly">Setiap tahun</SelectItem>
                    <SelectItem value="monthly">Setiap bulan</SelectItem>
                    <SelectItem value="per_issue">Setiap edisi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="journal-counter">Urutan terakhir terpakai</Label>
                <Input
                  id="journal-counter"
                  type="number"
                  value={formData.counter}
                  onChange={(e) => handleChange('counter', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Penandatangan Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold">Penandatangan</CardTitle>
            <CardDescription className="text-sm mt-1">
              Daftar pejabat penandatangan resmi yang berwenang pada surat LOA.
            </CardDescription>
          </div>
          <Button
            onClick={handleOpenAddSigner}
            variant="outline"
            className="gap-2 shadow-sm font-semibold h-10 px-5 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Penandatangan</span>
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            {(!journal?.signers || journal.signers.length === 0) && (
              <div className="text-sm text-muted-foreground italic py-2">
                Belum ada penandatangan terdaftar. Klik "+ Tambah Penandatangan" untuk menambah data.
              </div>
            )}
            {journal?.signers?.map((s, idx) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-3 px-4 border rounded-lg hover:border-slate-300 transition-colors bg-white"
              >
                <div className="flex items-center gap-3">
                  {s.signatureImage ? (
                    <img
                      src={s.signatureImage}
                      alt="TDD & Stempel"
                      className="w-10 h-10 object-contain border rounded bg-slate-50 p-1"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-slate-100 border flex items-center justify-center text-slate-500">
                      <FileCheck className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{s.name}</span>
                      {idx === 0 && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          Aktif / Utama
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.position} — {s.signatureImage ? 'Berkas TDD + Stempel tersimpan' : 'Tanpa berkas'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    onClick={() => handleOpenEditSigner(s)}
                    title="Edit Penandatangan"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Hapus Penandatangan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Penandatangan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus <strong>{s.name}</strong> ({s.position})?
                          Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSigner(s.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Hapus Penandatangan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tim Pengelola Card */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-xl font-bold">Tim Pengelola</CardTitle>
          <CardDescription className="text-sm mt-1">
            Daftar pengelola jurnal dan perannya dalam penerbitan LOA.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="flex flex-col gap-2 text-sm text-foreground">
            {journal?.members?.map((m) => (
              <li key={m} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Peran disimpan per pasangan user–jurnal, jadi satu orang bisa jadi editor di satu jurnal dan staff di jurnal lain.
          </p>
        </CardContent>
      </Card>

      {/* Sheet Drawer for Add & Edit Signer */}
      <SignerSheetDialog
        open={isSignerSheetOpen}
        onClose={() => setIsSignerSheetOpen(false)}
        signer={editingSigner}
        journalId={journal?.id}
        refreshData={refreshData}
      />
    </div>
  );
}
