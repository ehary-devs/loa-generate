import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IssueSheetDialog } from '@/components/issues/IssueSheetDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusIcon, PencilIcon, Trash2Icon, AlertCircleIcon, CheckCircle2Icon, ClockIcon, LockIcon } from 'lucide-react';
import { toast } from 'sonner';

export function IssuesPage({ journal, loas = [], refreshData }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!journal) {
    return <div className="p-6 text-muted-foreground">Tidak ada jurnal aktif.</div>;
  }

  const handleOpenAdd = () => {
    setSelectedIssue(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (issue) => {
    setSelectedIssue(issue);
    setSheetOpen(true);
  };

  const handlePromptDelete = (issue) => {
    // Check if issue is used by any LOAs
    const usedCount = loas.filter((l) => Number(l.issueId) === Number(issue.id)).length;
    if (usedCount > 0) {
      toast.error(`Edisi Vol. ${issue.volume} No. ${issue.number} sedang digunakan oleh ${usedCount} LOA dan tidak dapat dihapus.`);
      return;
    }

    setIssueToDelete(issue);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!issueToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('siloa_token');

    try {
      const res = await fetch(`/api/issues/${issueToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success('Edisi berhasil dihapus.');
        if (refreshData) refreshData();
        setDeleteDialogOpen(false);
        setIssueToDelete(null);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal menghapus edisi.');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan sistem saat menghapus edisi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-300 dark:text-emerald-400 font-medium px-3 py-1 gap-1 text-xs">
            <CheckCircle2Icon className="size-3.5" /> Buka (Open)
          </Badge>
        );
      case 'planned':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-300 dark:text-amber-400 font-medium px-3 py-1 gap-1 text-xs">
            <ClockIcon className="size-3.5" /> Rencana (Planned)
          </Badge>
        );
      case 'closed':
      default:
        return (
          <Badge className="bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-300 dark:text-slate-300 font-medium px-3 py-1 gap-1 text-xs">
            <LockIcon className="size-3.5" /> Diterbitkan (Closed)
          </Badge>
        );
    }
  };

  const issuesList = journal.issues || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold">Edisi Jurnal ({journal.code})</CardTitle>
            <CardDescription className="text-sm mt-1">
              Kelola nomor volume, issue, dan status penerbitan edisi jurnal.
            </CardDescription>
          </div>
          <Button onClick={handleOpenAdd} size="default" className="gap-2 font-medium px-4 h-10 shadow-xs">
            <PlusIcon className="size-4" />
            Tambah edisi
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {issuesList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              Belum ada edisi untuk jurnal ini. Klik <strong>Tambah edisi</strong> untuk membuat edisi baru.
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {issuesList.map((issue) => {
                const usedLoasCount = loas.filter((l) => Number(l.issueId) === Number(issue.id)).length;
                const isUsed = usedLoasCount > 0;

                return (
                  <div
                    key={issue.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-base text-foreground">
                          Vol. {issue.volume} No. {issue.number} ({issue.year})
                        </span>
                        {getStatusBadge(issue.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{issue.label || `Periode ${issue.year}`}</span>
                        <span>•</span>
                        {isUsed ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {usedLoasCount} LOA diterbitkan
                          </span>
                        ) : (
                          <span>Belum ada LOA</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(issue)}
                        className="gap-1.5 h-9 px-3 font-medium"
                      >
                        <PencilIcon className="size-3.5" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromptDelete(issue)}
                        disabled={isUsed}
                        title={isUsed ? `Tidak dapat dihapus karena sedang digunakan oleh ${usedLoasCount} LOA` : 'Hapus edisi'}
                        className={`gap-1.5 h-9 px-3 font-medium ${
                          isUsed
                            ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30'
                        }`}
                      >
                        <Trash2Icon className="size-3.5" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-6 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-lg border flex items-start gap-2">
            <AlertCircleIcon className="size-4 shrink-0 text-muted-foreground mt-0.5" />
            <span>
              Edisi berstatus <strong>Buka (Open)</strong> atau <strong>Rencana (Planned)</strong> bisa dipilih sebagai target LOA. Edisi yang sudah terbit dikunci agar tidak ada LOA baru masuk ke nomor yang sudah dicetak. Edisi yang sudah terikat ke LOA tidak dapat dihapus demi menjaga integritas dokumen.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Sheet Drawer for Add/Edit Issue */}
      <IssueSheetDialog
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        issue={selectedIssue}
        journalId={journal?.id}
        refreshData={refreshData}
      />

      {/* AlertDialog for Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent size="default" className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Trash2Icon className="size-5" />
              Hapus Edisi Jurnal
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm pt-2">
              Apakah Anda yakin ingin menghapus <strong>Vol. {issueToDelete?.volume} No. {issueToDelete?.number} ({issueToDelete?.year})</strong>?
              Tindakan ini akan menghapus edisi dari sistem dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex flex-row justify-end gap-3">
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isDeleting ? 'Menghapus...' : 'Setuju / Hapus'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
