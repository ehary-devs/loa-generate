import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function JournalSheetDialog({ open, onClose, journal, refreshData }) {
  const isEdit = Boolean(journal);
  const [form, setForm] = useState({
    name: '',
    nameEn: '',
    code: '',
    issn: '',
    pattern: '',
    counter: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (journal) {
      setForm({
        name: journal.name || '',
        nameEn: journal.nameEn || '',
        code: journal.code || '',
        issn: journal.issn || '',
        pattern: journal.pattern || `LOA-{tahun}{n:4}-${journal.code || 'CODE'}`,
        counter: journal.counter ?? 0,
      });
    } else {
      setForm({
        name: '',
        nameEn: '',
        code: '',
        issn: '',
        pattern: 'LOA-{tahun}{n:4}-{code}',
        counter: 0,
      });
    }
  }, [journal, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.code.trim() || !form.issn.trim()) {
      toast.error('Nama Jurnal, Kode, dan ISSN wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('siloa_token');

    try {
      const url = isEdit ? `/api/journals/${journal.id}` : '/api/journals';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = {
        name: form.name.trim(),
        nameEn: form.nameEn.trim(),
        code: form.code.trim().toUpperCase(),
        issn: form.issn.trim(),
        pattern: form.pattern.trim(),
        counter: Number(form.counter),
      };

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
          isEdit ? 'Profil jurnal berhasil diperbarui.' : 'Jurnal baru berhasil ditambahkan.'
        );
        if (refreshData) await refreshData();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Gagal menyimpan jurnal.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan sistem saat menyimpan jurnal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="flex flex-col h-full p-0 gap-0 data-[side=right]:sm:max-w-md sm:max-w-md w-full">
        <SheetHeader className="p-6 pb-4 border-b shrink-0 bg-background">
          <SheetTitle className="text-xl font-bold">
            {isEdit ? 'Edit Jurnal' : 'Tambah Jurnal Baru'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="journal-name" className="font-medium">
                Nama Jurnal (Bahasa Indonesia) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="journal-name"
                required
                placeholder="Contoh: Jurnal Teknologi Informasi dan Komunikasi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="journal-name-en" className="font-medium">
                Nama Jurnal (Bahasa Inggris)
              </Label>
              <Input
                id="journal-name-en"
                placeholder="Contoh: Journal of Information and Communication Technology"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="journal-code" className="font-medium">
                  Kode Jurnal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="journal-code"
                  required
                  placeholder="Contoh: JTIK"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="journal-issn" className="font-medium">
                  ISSN <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="journal-issn"
                  required
                  placeholder="2723-1178 (online)"
                  value={form.issn}
                  onChange={(e) => setForm({ ...form, issn: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="journal-pattern" className="font-medium">
                Pola Nomor LOA
              </Label>
              <Input
                id="journal-pattern"
                placeholder="{n:3}/LOA/{journal.code}/{bulan_romawi}/{tahun}"
                value={form.pattern}
                onChange={(e) => setForm({ ...form, pattern: e.target.value })}
              />
              <span className="text-[11px] text-muted-foreground">
                Variabel tersedia: &#123;n:3&#125;, &#123;bulan_romawi&#125;, &#123;tahun&#125;, &#123;code&#125;
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="journal-counter" className="font-medium">
                Urutan Nomor Terakhir (Counter)
              </Label>
              <Input
                id="journal-counter"
                type="number"
                min="0"
                value={form.counter}
                onChange={(e) => setForm({ ...form, counter: e.target.value })}
              />
            </div>
          </div>

          <SheetFooter className="p-4 px-6 border-t flex flex-row justify-end gap-3 shrink-0 bg-background">
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
                <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Jurnal'}</span>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
