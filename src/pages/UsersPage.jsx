import React, { useState, useEffect } from 'react';
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
import { UserSheetDialog } from '../components/users/UserSheetDialog';
import { 
  PlusIcon, 
  PencilIcon, 
  Trash2Icon, 
  ShieldCheckIcon, 
  UserIcon, 
  SearchIcon, 
  XIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from 'lucide-react';
import { toast } from "sonner";

export function UsersPage({ journals = [], refreshData }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sheet Drawer state
  const [userSheetOpen, setUserSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('siloa_token')}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil daftar pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Users
  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const roleText = u.isSuperAdmin ? 'super admin' : 'pengguna user';
    const journalText = u.journals?.map(j => `${j.journal.code} ${j.journal.name} ${j.role}`).join(' ') || '';
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      roleText.includes(q) ||
      journalText.toLowerCase().includes(q)
    );
  });

  // Calculate pagination
  const totalRows = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleDeleteUser = async (id) => {
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('siloa_token')}` }
      });

      if (res.ok) {
        toast.success('Pengguna berhasil dihapus.');
        fetchUsers();
        if (refreshData) refreshData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Gagal menghapus pengguna.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan sistem saat menghapus pengguna.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="animate-spin size-8 border-2 border-slate-300 border-t-slate-900 rounded-full mb-3" />
        <div className="text-sm">Memuat daftar pengguna...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold">Manajemen Pengguna</CardTitle>
            <CardDescription className="text-sm mt-1">
              Daftar akun pengguna terdaftar dan hak akses dalam sistem SILOA. Total: {users.length} akun.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Cari nama, email, role, jurnal..."
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
                setEditingUser(null);
                setUserSheetOpen(true);
              }}
              className="gap-2 shrink-0 h-10 px-4"
            >
              <PlusIcon className="size-4" />
              <span className="hidden sm:inline">Tambah Pengguna</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {totalRows === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              <UserIcon className="size-10 mx-auto mb-3 text-muted-foreground/40" />
              {search ? (
                <div>
                  Tidak ada pengguna yang cocok dengan pencarian &ldquo;<strong>{search}</strong>&rdquo;.
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                      Bersihkan pencarian
                    </Button>
                  </div>
                </div>
              ) : (
                <div>Belum ada pengguna terdaftar. Klik <strong>Tambah Pengguna</strong> untuk membuat akun baru.</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Alamat Email</TableHead>
                    <TableHead>Role Hak Akses</TableHead>
                    <TableHead>Akses Jurnal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-semibold text-slate-900">{u.name}</TableCell>
                      <TableCell className="text-slate-600">{u.email}</TableCell>
                      <TableCell>
                        {u.isSuperAdmin ? (
                          <Badge className="bg-[#14213A] text-white hover:bg-[#1f3154] gap-1.5 font-semibold px-3 py-1 text-xs shadow-2xs">
                            <ShieldCheckIcon className="size-4 text-amber-400" />
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-700 bg-slate-100/80 border-slate-300 gap-1.5 font-medium px-3 py-1 text-xs">
                            <UserIcon className="size-4 text-slate-500" />
                            Pengguna Jurnal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.isSuperAdmin ? (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 font-medium">
                            Akses Semua Jurnal
                          </Badge>
                        ) : u.journals && u.journals.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {u.journals.map((j) => (
                              <Badge key={j.journal.id} variant="outline" className="bg-slate-50 border-slate-300 text-xs px-2.5 py-0.5 font-medium text-slate-800">
                                <span className="font-bold text-slate-900 mr-1">{j.journal.code}</span>
                                <span className="text-[10px] text-slate-500">
                                  ({j.role === 'journal_owner' ? 'Owner' : 'Editor'})
                                </span>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum terhubung</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(u);
                              setUserSheetOpen(true);
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
                                disabled={isDeleting === u.id}
                                className="h-8 px-2.5 text-xs gap-1.5"
                              >
                                <Trash2Icon className="size-3.5" />
                                {isDeleting === u.id ? 'Menghapus...' : 'Hapus'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Akun Pengguna?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus akun <strong>{u.name}</strong> ({u.email})? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(u.id)}>
                                  Hapus Pengguna
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
                  <strong className="text-foreground">{totalRows}</strong> pengguna
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

      <UserSheetDialog
        open={userSheetOpen}
        onClose={() => setUserSheetOpen(false)}
        user={editingUser}
        journals={journals}
        refreshData={() => {
          fetchUsers();
          if (refreshData) refreshData();
        }}
      />
    </div>
  );
}
