import React, { useState, useEffect } from 'react';
import { T, SERIF } from '../utils/theme';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  SearchIcon, 
  XIcon, 
  CheckCircle2Icon, 
  PencilIcon, 
  Trash2Icon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ShieldAlertIcon,
  FileTextIcon,
  DownloadIcon
} from 'lucide-react';
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
import { tanggalPanjang } from '../utils/helpers';
import { EditLoaDialog } from '../components/loa/EditLoaDialog';
import { PdfDownloadModal } from '../components/loa/PdfDownloadModal';

export function HistoryPage({ journal, loas, onRevoke, onGoVerify, refreshData }) {
  const [isRevoking, setIsRevoking] = useState(null);
  const [editingLoa, setEditingLoa] = useState(null);
  const [pdfTargetLoa, setPdfTargetLoa] = useState(null);
  
  // URL Query synchronized search state
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sync search state with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set('q', search);
    } else {
      params.delete('q');
    }
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
    setCurrentPage(1);
  }, [search]);

  // Filter LOAs by active journal & query search
  const filteredRows = loas
    .filter((l) => l.journalId === journal.id)
    .filter((l) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const issue = journal.issues?.find((i) => i.id === l.issueId);
      const issueText = issue ? `vol ${issue.volume} no ${issue.number}` : '';
      
      return (
        l.number.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q) ||
        (l.token && l.token.toLowerCase().includes(q)) ||
        (l.status && (l.status === 'issued' ? 'terbit' : 'dicabut').includes(q)) ||
        issueText.toLowerCase().includes(q) ||
        l.authors?.some((a) => 
          (a.name && a.name.toLowerCase().includes(q)) || 
          (a.email && a.email.toLowerCase().includes(q)) ||
          (a.affiliation && a.affiliation.toLowerCase().includes(q))
        )
      );
    });

  // Calculate pagination
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  const handleRevoke = async (id) => {
    setIsRevoking(id);
    await onRevoke(id);
    setIsRevoking(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold">Riwayat LOA — {journal.code}</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              Menampilkan {totalRows} dokumen LOA yang diterbitkan untuk jurnal ini.
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input 
              type="text" 
              placeholder="Cari nomor, judul, penulis, email..." 
              className="pl-9 pr-9 h-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
        </CardHeader>

        <CardContent className="pt-4">
          {totalRows === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed rounded-lg">
              <FileTextIcon className="size-10 mx-auto mb-3 text-muted-foreground/50" />
              {search ? (
                <div>
                  Tidak ada LOA yang cocok dengan pencarian &ldquo;<strong>{search}</strong>&rdquo;.
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                      Bersihkan pencarian
                    </Button>
                  </div>
                </div>
              ) : (
                <div>Belum ada LOA untuk jurnal ini. Mulai dari halaman <strong>Terbitkan LOA</strong>.</div>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {paginatedRows.map((l) => {
                const issue = journal.issues?.find((i) => i.id === l.issueId);
                return (
                  <div
                    key={l.id}
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-4 hover:bg-muted/20 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-base tracking-tight text-foreground font-serif">
                          {l.number}
                        </span>
                        <Badge 
                          className={
                            l.status === 'issued' 
                              ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-300 dark:text-emerald-400 font-medium px-2.5 py-0.5 text-xs' 
                              : 'bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-300 dark:text-red-400 font-medium px-2.5 py-0.5 text-xs'
                          }
                        >
                          {l.status === 'issued' ? 'Terbit' : 'Dicabut'}
                        </Badge>
                      </div>

                      <div className="text-sm font-semibold text-foreground/90 line-clamp-2 leading-snug">
                        {l.title}
                      </div>

                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground/80">
                          {l.authors?.map((a) => a.name).filter(Boolean).join("; ")}
                        </span>
                        <span> — diterima {tanggalPanjang(l.acceptedDate)}</span>
                        {issue && (
                          <span className="font-medium text-primary ml-1">
                            — Vol. {issue.volume} No. {issue.number} ({issue.year})
                          </span>
                        )}
                      </div>

                      {l.revokeReason && (
                        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-900/50 flex items-center gap-1.5 mt-2">
                          <ShieldAlertIcon className="size-3.5 shrink-0" />
                          <span>Alasan pencabutan: {l.revokeReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons with clear, standardized sizing */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0 pt-2 lg:pt-0">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onGoVerify(l.token)} 
                        title="Verifikasi LOA"
                        className="h-9 px-3.5 gap-1.5 font-medium border-slate-300 hover:bg-slate-100 dark:border-slate-700"
                      >
                        <CheckCircle2Icon className="size-4 text-emerald-600" />
                        <span>Verifikasi</span>
                      </Button>

                      {l.status === "issued" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setPdfTargetLoa(l)} 
                            title="Unduh Berkas PDF Resmi"
                            className="h-9 px-3.5 gap-1.5 font-medium border-slate-300 hover:bg-slate-100 dark:border-slate-700 text-blue-600 dark:text-blue-400"
                          >
                            <DownloadIcon className="size-4" />
                            <span>Download PDF</span>
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingLoa(l)} 
                            title="Edit LOA"
                            className="h-9 px-3.5 gap-1.5 font-medium border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            <PencilIcon className="size-4" />
                            <span>Edit</span>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isRevoking === l.id}
                                title="Cabut LOA"
                                className="h-9 px-3.5 gap-1.5 font-medium bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Trash2Icon className="size-4" />
                                <span>{isRevoking === l.id ? "Mencabut..." : "Cabut"}</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent size="default" className="sm:max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                                  <ShieldAlertIcon className="size-5" />
                                  Cabut LOA?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm pt-2">
                                  Apakah Anda yakin ingin mencabut surat <strong>{l.number}</strong> secara permanen? LOA ini akan ditandai tidak berlaku, namun rekam jejaknya tetap tersimpan di sistem.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-4 flex flex-row justify-end gap-3">
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRevoke(l.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white font-medium"
                                >
                                  Ya, Cabut LOA
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalRows > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t">
              <div className="text-xs text-muted-foreground">
                Menampilkan <span className="font-semibold text-foreground">{startIndex + 1}</span>–
                <span className="font-semibold text-foreground">{endIndex}</span> dari{' '}
                <span className="font-semibold text-foreground">{totalRows}</span> LOA
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Baris per halaman:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px] text-xs">
                      <span>{pageSize}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
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
          )}
        </CardContent>

        {editingLoa && (
          <EditLoaDialog 
            open={!!editingLoa}
            onClose={() => setEditingLoa(null)}
            loa={editingLoa}
            journal={journal}
            refreshData={refreshData}
          />
        )}

        {pdfTargetLoa && (
          <PdfDownloadModal
            open={!!pdfTargetLoa}
            onClose={() => setPdfTargetLoa(null)}
            loa={pdfTargetLoa}
            journal={journal}
            issue={journal.issues?.find((i) => i.id === pdfTargetLoa.issueId)}
            signer={journal.signers?.find((s) => s.id === pdfTargetLoa.signerId)}
          />
        )}
      </Card>
    </div>
  );
}
