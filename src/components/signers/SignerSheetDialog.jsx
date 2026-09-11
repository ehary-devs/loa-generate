import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileImage, X, Loader2 } from 'lucide-react';

export function SignerSheetDialog({ open, onClose, signer, journalId, refreshData }) {
  const isEdit = Boolean(signer);
  const [form, setForm] = useState({
    name: '',
    position: '',
    signatureImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (signer) {
      setForm({
        name: signer.name || '',
        position: signer.position || '',
        signatureImage: signer.signatureImage || null,
      });
      setPreviewUrl(signer.signatureImage || null);
    } else {
      setForm({
        name: '',
        position: '',
        signatureImage: null,
      });
      setPreviewUrl(null);
    }
  }, [signer, open]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setForm((prev) => ({ ...prev, signatureImage: result }));
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, signatureImage: null }));
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.position.trim()) {
      toast.error('Nama dan Jabatan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('siloa_token');

    try {
      const url = isEdit ? `/api/signers/${signer.id}` : '/api/signers';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit
        ? { name: form.name, position: form.position, signatureImage: form.signatureImage }
        : { journalId, name: form.name, position: form.position, signatureImage: form.signatureImage };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isEdit ? 'Data penandatangan berhasil diperbarui.' : 'Penandatangan baru berhasil ditambahkan.'
        );
        if (refreshData) await refreshData();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Gagal menyimpan data penandatangan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan sistem saat menyimpan penandatangan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="flex flex-col h-full p-0 gap-0 data-[side=right]:sm:max-w-md sm:max-w-md w-full">
        <SheetHeader className="p-6 pb-4 border-b shrink-0 bg-background">
          <SheetTitle className="text-xl font-bold">
            {isEdit ? 'Edit Penandatangan' : 'Tambah Penandatangan Baru'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="signer-name" className="font-medium">
                Nama Lengkap & Gelar
              </Label>
              <Input
                id="signer-name"
                required
                placeholder="Contoh: Dr. Arif Nugroho, S.Kom., M.Kom."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="signer-position" className="font-medium">
                Jabatan / Peran
              </Label>
              <Input
                id="signer-position"
                required
                placeholder="Contoh: Editor in Chief / Managing Editor"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>

            {/* Combined Signature + Stamp Upload */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium">
                Berkas Tanda Tangan + Stempel (Gabung Jadi 1)
              </Label>
              <p className="text-xs text-muted-foreground">
                Unggah 1 gambar transparan (PNG/SVG) yang sudah menggabungkan spesimen tanda tangan dan stempel resmi.
              </p>

              {previewUrl ? (
                <div className="relative border rounded-lg p-4 bg-slate-50 flex flex-col items-center justify-center gap-2 group">
                  <img
                    src={previewUrl}
                    alt="Preview Tanda Tangan & Stempel"
                    className="max-h-32 max-w-full object-contain rounded border bg-white p-2 shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="gap-1 mt-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                    <span>Hapus Berkas</span>
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 rounded-lg p-6 cursor-pointer transition-colors text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Pilih / Unggah Berkas</span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG, SVG, WebP (Maks 5 MB)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          <SheetFooter className="p-4 px-6 border-t flex flex-row justify-end gap-3 shrink-0 bg-background sticky bottom-0 z-10">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Penandatangan'}</span>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
