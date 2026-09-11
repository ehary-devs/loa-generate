import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileTextIcon } from 'lucide-react';

export function DashboardPage({ journal, loas }) {
  if (!journal) return null;

  const journalLoas = loas.filter(l => l.journalId === journal.id && l.status === "issued");
  const totalLoa = journalLoas.length;
  const recentLoas = [...journalLoas].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total LOA Diterbitkan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLoa}</div>
            <p className="text-xs text-muted-foreground mt-1">
              LOA resmi untuk {journal.code}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Edisi Terdaftar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{journal.issues?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Edisi siap menampung artikel
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Penandatangan Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{journal.signers?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pejabat penandatangan surat
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LOA Terakhir Diterbitkan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor LOA</TableHead>
                <TableHead>Penulis Utama</TableHead>
                <TableHead>Judul Artikel</TableHead>
                <TableHead>Tanggal Surat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLoas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                      <FileTextIcon className="size-10 mb-2 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Belum ada LOA yang diterbitkan</p>
                      <p className="text-xs text-muted-foreground mt-1">Mulai terbitkan surat LOA baru dari menu Terbitkan LOA.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentLoas.map(loa => {
                  const author = loa.authors[0]?.name || '-';
                  return (
                    <TableRow key={loa.id}>
                      <TableCell className="font-medium">{loa.number}</TableCell>
                      <TableCell>{author}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={loa.title}>
                        {loa.title}
                      </TableCell>
                      <TableCell>{loa.letterDate}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
