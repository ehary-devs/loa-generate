import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function UserSheetDialog({ open, onClose, user, journals = [], refreshData }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    isSuperAdmin: false,
  });
  
  // Object of { [journalId]: role }
  const [assignedJournals, setAssignedJournals] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        isSuperAdmin: Boolean(user.isSuperAdmin),
      });

      const initialMap = {};
      if (user.journals && Array.isArray(user.journals)) {
        user.journals.forEach((j) => {
          if (j.journal && j.journal.id) {
            initialMap[j.journal.id] = j.role || 'journal_editor';
          }
        });
      }
      setAssignedJournals(initialMap);
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        isSuperAdmin: false,
      });
      setAssignedJournals({});
    }
  }, [user, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Nama dan Email wajib diisi.');
      return;
    }

    if (!isEdit && !form.password.trim()) {
      toast.error('Password wajib diisi untuk pengguna baru.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('siloa_token');

    // Build journalAssignments array
    const journalAssignments = Object.entries(assignedJournals).map(([journalId, role]) => ({
      journalId: Number(journalId),
      role,
    }));

    try {
      const url = isEdit ? `/api/users/${user.id}` : '/api/users';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        isSuperAdmin: form.isSuperAdmin,
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
        journalAssignments: form.isSuperAdmin ? [] : journalAssignments,
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
          isEdit ? 'Data pengguna berhasil diperbarui.' : 'Pengguna baru berhasil ditambahkan.'
        );
        if (refreshData) await refreshData();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Gagal menyimpan pengguna.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan sistem saat menyimpan pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="flex flex-col h-full p-0 gap-0 data-[side=right]:sm:max-w-md sm:max-w-md w-full">
        <SheetHeader className="p-6 pb-4 border-b shrink-0 bg-background">
          <SheetTitle className="text-xl font-bold">
            {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-name" className="font-medium">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="user-name"
                required
                placeholder="Contoh: Liza Rahma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="user-email" className="font-medium">
                Alamat Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="user-email"
                type="email"
                required
                placeholder="liza@stekom.ac.id"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="user-password" className="font-medium">
                {isEdit ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Sementara *'}
              </Label>
              <Input
                id="user-password"
                type="password"
                placeholder="••••••••"
                required={!isEdit}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2.5 p-3 border rounded-lg bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 size-4"
                  checked={form.isSuperAdmin}
                  onChange={(e) => setForm({ ...form, isSuperAdmin: e.target.checked })}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Akses Super Admin
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Super Admin memiliki akses penuh ke seluruh jurnal dan manajemen sistem.
                  </span>
                </div>
              </label>
            </div>

            {/* Multiple Journal Selection */}
            {!form.isSuperAdmin && journals.length > 0 && (
              <div className="pt-3 border-t space-y-3">
                <div className="flex flex-col">
                  <Label className="text-sm font-bold text-slate-800">
                    Hak Akses Jurnal (Pilih Jurnal)
                  </Label>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    Centang satu atau beberapa jurnal yang dapat diakses oleh pengguna ini.
                  </span>
                </div>

                <div className="space-y-2.5">
                  {journals.map((j) => {
                    const isChecked = Boolean(assignedJournals[j.id]);
                    const currentRole = assignedJournals[j.id] || 'journal_editor';

                    return (
                      <div
                        key={j.id}
                        className={`p-3 border rounded-lg transition-colors flex flex-col gap-2.5 ${
                          isChecked ? 'bg-slate-50 border-slate-300 dark:bg-slate-900/50' : 'bg-white border-slate-200'
                        }`}
                      >
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 size-4"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setAssignedJournals((prev) => {
                                  const updated = { ...prev };
                                  if (checked) {
                                    updated[j.id] = currentRole;
                                  } else {
                                    delete updated[j.id];
                                  }
                                  return updated;
                                });
                              }}
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {j.code}
                              </span>
                              <span className="text-xs text-slate-500 truncate max-w-[240px]">
                                {j.name}
                              </span>
                            </div>
                          </div>
                        </label>

                        {isChecked && (
                          <div className="pl-6 pt-1 flex items-center gap-2 border-t border-slate-200/60">
                            <span className="text-xs text-slate-600 font-medium shrink-0">Peran:</span>
                            <Select
                              value={currentRole}
                              onValueChange={(val) => {
                                setAssignedJournals((prev) => ({
                                  ...prev,
                                  [j.id]: val,
                                }));
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs bg-white flex-1">
                                <SelectValue placeholder="Pilih Peran">
                                  {currentRole === 'journal_owner'
                                    ? 'Journal Owner (Pengelola Utama)'
                                    : 'Journal Editor (Editor Penerbit)'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="journal_owner">Journal Owner (Pengelola Utama)</SelectItem>
                                <SelectItem value="journal_editor">Journal Editor (Editor Penerbit)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}</span>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
