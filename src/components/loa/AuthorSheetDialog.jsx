import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AuthorSheetDialog({ open, onClose, author, onSaveAuthor }) {
  const isEdit = author && typeof author.index === 'number';
  const [form, setForm] = useState({
    name: '',
    affiliation: '',
    email: '',
    corresponding: false,
  });

  useEffect(() => {
    if (author) {
      setForm({
        name: author.name || '',
        affiliation: author.affiliation || '',
        email: author.email || '',
        corresponding: Boolean(author.corresponding),
      });
    } else {
      setForm({
        name: '',
        affiliation: '',
        email: '',
        corresponding: false,
      });
    }
  }, [author, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    onSaveAuthor({
      index: isEdit ? author.index : null,
      authorData: {
        name: form.name.trim(),
        affiliation: form.affiliation.trim(),
        email: form.email.trim(),
        corresponding: form.corresponding,
      },
    });

    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="flex flex-col h-full p-0 gap-0 data-[side=right]:sm:max-w-md sm:max-w-md w-full">
        <SheetHeader className="p-6 pb-4 border-b shrink-0 bg-background">
          <SheetTitle className="text-xl font-bold">
            {isEdit ? 'Edit Data Penulis' : 'Tambah Penulis Baru'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="author-name" className="font-medium">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author-name"
                required
                placeholder="Contoh: Christine Adriani Puspito"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="author-affiliation" className="font-medium">
                Afiliasi / Instansi
              </Label>
              <Input
                id="author-affiliation"
                placeholder="Contoh: Universitas Padjadjaran, Indonesia"
                value={form.affiliation}
                onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="author-email" className="font-medium">
                Alamat Email
              </Label>
              <Input
                id="author-email"
                type="email"
                placeholder="Contoh: christine@unpad.ac.id"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 p-3 border rounded-lg bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 size-4"
                  checked={form.corresponding}
                  onChange={(e) => setForm({ ...form, corresponding: e.target.checked })}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Penulis Korespondensi
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Tandai sebagai kontak korespondensi utama untuk artikel ini.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <SheetFooter className="p-4 px-6 border-t flex flex-row justify-end gap-3 shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="gap-2">
              {isEdit ? 'Simpan Perubahan' : 'Tambah Penulis'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
