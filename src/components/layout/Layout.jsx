import React, { useState, useEffect } from 'react';
import { T, SANS, SERIF, inputStyle } from '../../utils/theme';
import { makeToken, makeHash, renderPattern } from '../../utils/helpers';
import { DashboardPage, GeneratePage, HistoryPage, IssuesPage, MasterPage, VerifyPage, JournalsPage } from '../../pages';
import { UsersPage } from '../../pages/UsersPage';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import { 
  LayoutDashboardIcon, 
  FileCheck2Icon, 
  HistoryIcon, 
  LayersIcon, 
  BookMarkedIcon, 
  ShieldCheckIcon, 
  UsersIcon, 
  Building2Icon,
  AwardIcon,
  LogOutIcon,
  MenuIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from 'lucide-react';

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { key: "terbitkan", label: "Terbitkan LOA", icon: FileCheck2Icon },
  { key: "riwayat", label: "Riwayat", icon: HistoryIcon },
  { key: "edisi", label: "Edisi", icon: LayersIcon },
  { key: "master", label: "Master jurnal", icon: BookMarkedIcon },
  { key: "verifikasi", label: "Halaman verifikasi", icon: ShieldCheckIcon },
];

const ADMIN_NAV = [
  { key: "pengguna", label: "Manajemen Pengguna", icon: UsersIcon },
  { key: "jurnal", label: "Manajemen Jurnal", icon: Building2Icon },
];

function SidebarNavigation({ mainNavList, adminNavList, page, setPage, setIsMobileMenuOpen, user, logout }) {
  return (
    <div className="flex flex-col h-full bg-[#14213A] text-white">
      {/* Header Branding */}
      <div className="p-5 border-b border-[#202f4d] flex items-center gap-3 shrink-0">
        <div className="size-10 rounded-xl bg-[#1e2e4a] border border-[#2c3f63] flex items-center justify-center shrink-0 overflow-hidden p-1">
          <img src="/images/logo.png" alt="SILOA Logo" className="size-full object-contain" />
        </div>
        <div className="overflow-hidden">
          <div className="font-extrabold text-lg text-white tracking-wider flex items-center gap-1.5 font-serif">
            SILOA
          </div>
          <div className="text-[11px] text-[#A2B1CC] font-medium truncate">
            Penerbitan &amp; Verifikasi LOA
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 py-5 px-3 space-y-6 overflow-y-auto min-h-0">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-[#8697B7] tracking-wider uppercase">
            Menu Utama
          </div>
          <nav className="space-y-1">
            {mainNavList.map((n) => {
              const active = page === n.key;
              const Icon = n.icon;
              return (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => {
                    setPage(n.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                    active
                      ? 'bg-[#223558] text-white font-semibold shadow-xs'
                      : 'text-[#C5D1E6] hover:text-white hover:bg-[#1b2b48]'
                  }`}
                >
                  <Icon className={`size-4.5 shrink-0 ${active ? 'text-white' : 'text-[#8697B7]'}`} />
                  <span className="truncate">{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {adminNavList.length > 0 && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-[#8697B7] tracking-wider uppercase">
              Administrator
            </div>
            <nav className="space-y-1">
              {adminNavList.map((n) => {
                const active = page === n.key;
                const Icon = n.icon;
                return (
                  <button
                    key={n.key}
                    type="button"
                    onClick={() => {
                      setPage(n.key);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                      active
                        ? 'bg-[#223558] text-white font-semibold shadow-xs'
                        : 'text-[#C5D1E6] hover:text-white hover:bg-[#1b2b48]'
                    }`}
                  >
                    <Icon className={`size-4.5 shrink-0 ${active ? 'text-white' : 'text-[#8697B7]'}`} />
                    <span className="truncate">{n.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User profile & Logout footer */}
      <div className="p-3.5 border-t border-[#202f4d] bg-[#0e182b] shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between p-1.5 -m-1.5 rounded-lg hover:bg-[#182846] transition-colors group">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="size-8 rounded-full bg-[#1e2e4a] border border-[#2c3f63] text-[#E8EAE4] font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-[#A2B1CC] truncate">
                  {user?.isSuperAdmin ? 'Super Admin' : 'User'}
                </div>
              </div>
            </div>
            <ChevronDownIcon className="size-4 text-[#8697B7] group-hover:text-white transition-colors" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" side="top" className="w-56 p-1 bg-[#14213A] border-[#202f4d] text-white">
            <div className="px-3 py-2 bg-[#1c2c4c] rounded-lg mb-1">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-[#A2B1CC] truncate mt-0.5">
                {user?.username ? `@${user.username} • ` : ''}{user?.isSuperAdmin ? 'Super Admin' : 'User'}
              </div>
            </div>
            <DropdownMenuSeparator className="bg-[#202f4d]" />
            <DropdownMenuItem
              destructive
              onClick={logout}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300"
            >
              <LogOutIcon className="size-4" />
              <span>Keluar (Logout)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loas, setLoas] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [verifyToken, setVerifyToken] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchAppData = async () => {
    const token = localStorage.getItem('siloa_token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const [resJournals, resLoas] = await Promise.all([
        fetch('/api/journals', { headers }),
        fetch('/api/loas', { headers })
      ]);
      const dataJournals = await resJournals.json();
      const dataLoas = await resLoas.json();
      
      setJournals(dataJournals);
      setLoas(dataLoas);
      if (dataJournals.length > 0 && !activeId) setActiveId(dataJournals[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  const journal = journals.find((j) => j.id === activeId);

  const issueLoa = async (payload) => {
    const sequence = journal.counter + 1;
    const number = renderPattern(journal.pattern, {
      n: sequence,
      journal,
      issue: payload.issue,
      date: new Date(payload.letterDate + "T00:00:00"),
    });
    const token = makeToken();
    const loa = {
      id: Date.now(),
      journalId: journal.id,
      number,
      token,
      title: payload.title,
      authors: payload.authors,
      issueId: payload.issue?.id ?? null,
      signerId: payload.signer?.id ?? null,
      acceptedDate: payload.acceptedDate,
      letterDate: payload.letterDate,
      language: payload.language,
      status: "issued",
      hash: makeHash(),
      sequence
    };

    const res = await fetch('/api/loas', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('siloa_token')}`
      },
      body: JSON.stringify(loa)
    });
    
    if (res.ok) {
      const savedLoa = await res.json();
      setLoas((prev) => [savedLoa, ...prev]);
      setJournals((prev) => prev.map((j) => (j.id === journal.id ? { ...j, counter: sequence } : j)));
      return { number, token, sequence };
    }
  };

  const revokeLoa = async (id) => {
    const res = await fetch(`/api/loas/${id}/revoke`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('siloa_token')}`
      },
      body: JSON.stringify({ reason: "Dicabut dari UI" })
    });
    
    if (res.ok) {
      const updated = await res.json();
      setLoas((prev) => prev.map((l) => (l.id === id ? updated : l)));
    }
  };

  const goVerify = (token) => {
    setVerifyToken(token);
    setPage("verifikasi");
  };

  const setPattern = (pattern) =>
    setJournals((prev) => prev.map((j) => (j.id === journal.id ? { ...j, pattern } : j)));

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        backgroundColor: T.canvas, 
        fontFamily: SANS 
      }}>
        <div className="animate-spin" style={{ 
          width: 40, height: 40, 
          border: `3px solid ${T.shell}`, 
          borderTopColor: T.ink, 
          borderRadius: '50%',
          marginBottom: 16
        }} />
        <div style={{ color: T.ink, fontSize: 16, fontWeight: 500, letterSpacing: '0.02em' }}>Memuat Sistem SILOA...</div>
        <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Mohon tunggu sebentar</div>
      </div>
    );
  }

  const mainNavList = [...NAV];
  const adminNavList = user?.isSuperAdmin ? [...ADMIN_NAV] : [];

  const currentPageLabel = [...mainNavList, ...adminNavList].find((n) => n.key === page)?.label;

  return (
    <div
      style={{ background: T.shell, fontFamily: SANS, color: T.ink }}
      className="flex h-screen max-h-screen w-screen overflow-hidden"
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-[#202f4d] flex-col h-screen select-none z-20">
        <SidebarNavigation
          mainNavList={mainNavList}
          adminNavList={adminNavList}
          page={page}
          setPage={setPage}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          user={user}
          logout={logout}
        />
      </aside>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 border-r border-[#202f4d] w-72 bg-[#14213A] sm:max-w-xs">
          <SidebarNavigation
            mainNavList={mainNavList}
            adminNavList={adminNavList}
            page={page}
            setPage={setPage}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            user={user}
            logout={logout}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }} className="h-screen overflow-hidden">
        <header 
          className="flex items-center justify-between shrink-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 md:px-8 py-3.5 gap-3 flex-wrap sm:flex-nowrap" 
          style={{ minHeight: 72 }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Hamburger Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0 h-9 w-9 text-slate-700 hover:bg-slate-100"
              onClick={() => setIsMobileMenuOpen(true)}
              title="Buka menu navigasi"
            >
              <MenuIcon className="w-5 h-5" />
            </Button>

            {/* Breadcrumb Header Trail */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
              <span className="hover:text-slate-900 transition-colors">Aplikasi</span>
              <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {currentPageLabel}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap justify-end ml-auto">
            {/* Active Journal Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden sm:inline">Jurnal:</span>
              <Select
                value={activeId ? String(activeId) : ""}
                onValueChange={(val) => {
                  setActiveId(Number(val));
                  setFormKey((k) => k + 1);
                }}
              >
                <SelectTrigger className="w-[180px] sm:w-[280px] md:w-[320px] h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs font-medium rounded-lg px-3">
                  <SelectValue placeholder="Pilih Jurnal">
                    {journal ? `${journal.code} — ${journal.name}` : "Tidak ada akses"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {journals.map((j) => (
                    <SelectItem key={j.id} value={String(j.id)}>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 mr-1.5">{j.code}</span>
                      <span className="text-muted-foreground">— {j.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                <div className="size-8 rounded-full bg-[#14213A] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0 ring-2 ring-transparent group-hover:ring-slate-300 dark:group-hover:ring-slate-700 transition-all">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                    {user?.name}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {user?.isSuperAdmin ? 'Super Admin' : 'Pengguna'}
                  </span>
                </div>
                <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors ml-0.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1">
                <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user?.username ? `@${user.username} • ` : ''}{user?.isSuperAdmin ? 'Super Admin' : 'Pengguna'}
                  </div>
                </div>
                <DropdownMenuSeparator />
                {user?.isSuperAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => setPage('pengguna')}>
                      <UsersIcon className="size-4 text-slate-500" />
                      <span>Manajemen Pengguna</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPage('jurnal')}>
                      <Building2Icon className="size-4 text-slate-500" />
                      <span>Manajemen Jurnal</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem destructive onClick={logout}>
                  <LogOutIcon className="size-4" />
                  <span>Keluar (Logout)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main style={{ flex: 1 }} className="overflow-y-auto p-4 sm:p-6 md:p-8 pb-16">
          {/* Page Header inside Content */}
          <div className="mb-6 pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 style={{ fontFamily: SERIF, fontSize: 26 }} className="font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {currentPageLabel}
              </h1>
              {journal ? (
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{journal.name} ({journal.code})</span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-xs">
                    Pola nomor: {journal.pattern}
                  </span>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-500 mt-1">
                  Kelola penerbitan, verifikasi, dan arsip dokumen LOA.
                </div>
              )}
            </div>
          </div>

          {(!journal && page !== 'pengguna' && page !== 'jurnal') ? (
            <div>Anda belum memiliki akses ke jurnal manapun.</div>
          ) : (
            <>
              {page === "dashboard" ? <DashboardPage journal={journal} loas={loas} /> : null}
              {page === "terbitkan" ? (
                <GeneratePage
                  key={`${journal.id}-${formKey}`}
                  journal={journal}
                  loas={loas}
                  onIssue={issueLoa}
                  onGoVerify={goVerify}
                  onGoHistory={() => setPage("riwayat")}
                />
              ) : null}
              {page === "riwayat" ? (
                <HistoryPage journal={journal} loas={loas} onRevoke={revokeLoa} onGoVerify={goVerify} refreshData={fetchAppData} />
              ) : null}
              {page === "edisi" ? <IssuesPage journal={journal} loas={loas} refreshData={fetchAppData} /> : null}
              {page === "master" ? <MasterPage journal={journal} onPattern={setPattern} refreshData={fetchAppData} /> : null}
              {page === "verifikasi" ? (
                <VerifyPage key={verifyToken} loas={loas} journals={journals} initialToken={verifyToken} />
              ) : null}
            </>
          )}
          
          {page === "pengguna" && user?.isSuperAdmin ? (
            <UsersPage journals={journals} refreshData={fetchAppData} />
          ) : null}
          
          {page === "jurnal" && user?.isSuperAdmin ? (
            <JournalsPage journals={journals} refreshData={fetchAppData} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
