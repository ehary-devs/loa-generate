import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function IssueSheetDialog({ open, onClose, issue, journalId, refreshData }) {
  const isEdit = Boolean(issue);
  const [form, setForm] = useState({
    volume: 1,
    number: 1,
    year: new Date().getFullYear(),
    label: '',
    status: 'planned'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (issue) {
      setForm({
        volume: issue.volume || 1,
        number: issue.number || 1,
        year: issue.year || new Date().getFullYear(),
        label: issue.label || '',
        status: issue.status || 'planned'
      });
    } else {
      setForm({
        volume: 1,
        number: 1,
        year: new Date().getFullYear(),
        label: '',
        status: 'planned'
      });
    }
  }, [issue, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('siloa_token');

    try {
      const url = isEdit ? `/api/issues/${issue.id}` : '/api/issues';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit ? form : { ...form, journalId };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(isEdit ? 'Edisi berhasil diperbarui.' : 'Edisi baru berhasil ditambahkan.');
        if (refreshData) refreshData();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal menyimpan edisi.');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="flex flex-col h-full p-0 gap-0 data-[side=right]:sm:max-w-md sm:max-w-md w-full">
        <SheetHeader className="p-6 pb-4 border-b shrink-0 bg-background">
          <SheetTitle className="text-xl font-bold">
            {isEdit ? `Edit Edisi - Vol. ${issue?.volume} No. ${issue?.number}` : 'Tambah Edisi Baru'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Volume</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-medium">Nomor (Issue)</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-medium">Tahun</Label>
              <Input
                type="number"
                min="2000"
                max="2100"
                required
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-medium">Periode / Label</Label>
              <Input
                placeholder="Contoh: Juli–Desember 2026"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-medium">Status Edisi</Label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm({ ...form, status: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih status edisi">
                    {form.status === 'open' && 'Buka (Open)'}
                    {form.status === 'planned' && 'Rencana (Planned)'}
                    {form.status === 'closed' && 'Diterbitkan / Dikunci (Closed)'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Buka (Open)</SelectItem>
                  <SelectItem value="planned">Rencana (Planned)</SelectItem>
                  <SelectItem value="closed">Diterbitkan / Dikunci (Closed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="p-4 px-6 border-t flex flex-row justify-end gap-3 shrink-0 bg-background sticky bottom-0 z-10">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Edisi'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
