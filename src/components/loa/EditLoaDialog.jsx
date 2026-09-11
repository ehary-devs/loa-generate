import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';

export function EditLoaDialog({ loa, journal, open, onClose, refreshData }) {
  const [form, setForm] = useState({
    title: loa?.title || "",
    authors: loa?.authors ? JSON.parse(JSON.stringify(loa.authors)) : [],
    issueId: loa?.issueId || null,
    signerId: loa?.signerId || null,
    acceptedDate: loa?.acceptedDate || "",
    letterDate: loa?.letterDate || "",
    language: loa?.language || "id"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loa || !journal) return null;

  const setAuthor = (idx, patch) =>
    setForm((f) => ({
      ...f,
      authors: f.authors.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }));

  const setCorresponding = (idx) =>
    setForm((f) => ({
      ...f,
      authors: f.authors.map((a, i) => ({ ...a, corresponding: i === idx })),
    }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/loas/${loa.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('siloa_token')}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("LOA berhasil diupdate.");
        if (refreshData) refreshData();
        onClose();
      } else {
        toast.error("Gagal mengupdate LOA.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const issue = journal.issues.find((i) => String(i.id) === String(form.issueId));
  const signer = journal.signers.find((s) => String(s.id) === String(form.signerId));

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="flex flex-col h-full p-0 gap-0 data-[side=right]:sm:max-w-2xl sm:max-w-2xl w-full">
        <SheetHeader className="p-6 pb-4 border-b shrink-0 bg-background">
          <SheetTitle className="text-xl font-bold">Edit LOA - {loa.number}</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-foreground">Judul artikel</Label>
            <Textarea
              rows={3}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="resize-y"
            />
          </div>

          <div className="space-y-3">
            <Label className="font-medium text-foreground">Penulis</Label>
            <div className="flex flex-col gap-3">
              {form.authors.map((a, i) => (
                <div key={i} className="p-4 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 relative space-y-3">
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Nama Lengkap</Label>
                      <Input
                        placeholder="Nama lengkap"
                        value={a.name}
                        onChange={(e) => setAuthor(i, { name: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Afiliasi</Label>
                      <Input
                        placeholder="Afiliasi"
                        value={a.affiliation}
                        onChange={(e) => setAuthor(i, { affiliation: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-1">
                    <div className="flex-1 w-full flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <Input
                        placeholder="Email"
                        value={a.email}
                        onChange={(e) => setAuthor(i, { email: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-4 h-10 px-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap font-medium select-none">
                        <input
                          type="radio"
                          className="h-4 w-4 text-primary accent-primary"
                          checked={!!a.corresponding}
                          onChange={() => setCorresponding(i)}
                        />
                        Korespondensi
                      </label>
                      {form.authors.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                          onClick={() => setForm(f => ({ ...f, authors: f.authors.filter((_, x) => x !== i) }))}
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  authors: [...f.authors, { name: "", affiliation: "", email: "", corresponding: false }],
                }))
              }
            >
              + Tambah penulis
            </Button>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-foreground">Tanggal diterima</Label>
              <DatePicker
                value={form.acceptedDate}
                onChange={(date) => setForm({ ...form, acceptedDate: date })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-foreground">Tanggal surat</Label>
              <DatePicker
                value={form.letterDate}
                onChange={(date) => setForm({ ...form, letterDate: date })}
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-foreground">Edisi tujuan</Label>
              <Select
                value={form.issueId ? String(form.issueId) : ""}
                onValueChange={(val) => setForm({ ...form, issueId: val || null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Belum ditentukan">
                    {form.issueId && issue
                      ? `Vol. ${issue.volume} No. ${issue.number} (${issue.year})` 
                      : "Belum ditentukan"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Belum ditentukan</SelectItem>
                  {journal.issues.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      Vol. {i.volume} No. {i.number} ({i.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-foreground">Penandatangan</Label>
              <Select
                value={form.signerId ? String(form.signerId) : ""}
                onValueChange={(val) => setForm({ ...form, signerId: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih...">
                    {form.signerId && signer ? signer.name : "Pilih..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {journal.signers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-medium text-foreground">Bahasa surat</Label>
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
        </div>
        
        <SheetFooter className="p-4 px-6 border-t flex flex-row justify-end gap-3 shrink-0 bg-background sticky bottom-0 z-10">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
