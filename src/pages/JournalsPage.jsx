import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
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
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { JournalSheetDialog } from '../components/journals/JournalSheetDialog';
import { 
  PlusIcon, 
  PencilIcon, 
  Trash2Icon, 
  BookMarkedIcon, 
  SearchIcon, 
  XIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from 'lucide-react';
import { toast } from "sonner";

export function JournalsPage({ journals = [], refreshData }) {
  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sheet Drawer State
  const [journalSheetOpen, setJournalSheetOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  // Filter Journals by Search Query
  const filteredJournals = journals.filter((j) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      j.name.toLowerCase().includes(q) ||
      (j.nameEn && j.nameEn.toLowerCase().includes(q)) ||
      j.code.toLowerCase().includes(q) ||
      (j.issn && j.issn.toLowerCase().includes(q)) ||
      (j.pattern && j.pattern.toLowerCase().includes(q))
    );
  });

  // Calculate pagination
  const totalRows = filteredJournals.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const paginatedJournals = filteredJournals.slice(startIndex, endIndex);

  const handleDeleteJournal = async (id) => {
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/journals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('siloa_token')}` }
      });

      if (res.ok) {
        toast.success('Jurnal berhasil dihapus.');
        if (refreshData) await refreshData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Gagal menghapus jurnal.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan sistem saat menghapus jurnal.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold">Manajemen Jurnal</CardTitle>
            <CardDescription className="text-sm mt-1">
              Daftar seluruh jurnal terdaftar dalam sistem penerbitan LOA SILOA. Total: {journals.length} jurnal.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Cari nama, kode, ISSN..."
                className="pl-9 pr-9 h-10 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                  title="Hapus pencarian"
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>

            <Button
              onClick={() => {
                setEditingJournal(null);
                setJournalSheetOpen(true);
              }}
              className="gap-2 shrink-0 h-10 px-4"
            >
              <PlusIcon className="size-4" />
              <span className="hidden sm:inline">Tambah Jurnal</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {totalRows === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              <BookMarkedIcon className="size-10 mx-auto mb-3 text-muted-foreground/40" />
              {search ? (
                <div>
                  Tidak ada jurnal yang cocok dengan pencarian &ldquo;<strong>{search}</strong>&rdquo;.
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                      Bersihkan pencarian
                    </Button>
                  </div>
                </div>
              ) : (
                <div>Belum ada jurnal terdaftar. Klik <strong>Tambah Jurnal</strong> untuk mendaftarkan jurnal baru.</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Jurnal</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>ISSN</TableHead>
                    <TableHead>Pola Nomor LOA</TableHead>
                    <TableHead>Urutan Terakhir</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJournals.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{j.name}</span>
                          {j.nameEn && <span className="text-xs text-muted-foreground italic">{j.nameEn}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold border-slate-300">
                          {j.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{j.issn || '-'}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-700">{j.pattern || '-'}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{j.counter ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingJournal(j);
                              setJournalSheetOpen(true);
                            }}
                            className="h-8 px-2.5 text-xs gap-1.5"
                          >
                            <PencilIcon className="size-3.5" />
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isDeleting === j.id}
                                className="h-8 px-2.5 text-xs gap-1.5"
                              >
                                <Trash2Icon className="size-3.5" />
                                {isDeleting === j.id ? 'Menghapus...' : 'Hapus'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Jurnal?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus jurnal <strong>{j.name}</strong> ({j.code})? Jika jurnal sudah memiliki LOA terbit, penghapusan akan ditolak demi keamanan arsip.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteJournal(j.id)}>
                                  Hapus Jurnal
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t text-xs text-muted-foreground">
                <div>
                  Menampilkan <strong className="text-foreground">{startIndex + 1}</strong> –{' '}
                  <strong className="text-foreground">{endIndex}</strong> dari{' '}
                  <strong className="text-foreground">{totalRows}</strong> jurnal
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>Tampilkan per halaman:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(val) => {
                        setPageSize(Number(val));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-16 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs gap-1 font-medium"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftIcon className="size-3.5" />
                      <span>Sebelumnya</span>
                    </Button>

                    <div className="text-xs font-semibold px-2">
                      {currentPage} / {totalPages}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs gap-1 font-medium"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span>Selanjutnya</span>
                      <ChevronRightIcon className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <JournalSheetDialog
        open={journalSheetOpen}
        onClose={() => setJournalSheetOpen(false)}
        journal={editingJournal}
        refreshData={refreshData}
      />
    </div>
  );
}
