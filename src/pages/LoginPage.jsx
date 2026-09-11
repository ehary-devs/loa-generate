import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AwardIcon, 
  MailIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  LogInIcon,
  CheckCircle2Icon
} from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Email atau kata sandi tidak valid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-100 font-sans">
      {/* Left Column: Desktop only (lg:flex), clean & professional branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#14213A] text-white p-12 xl:p-16 flex-col justify-between select-none">
        {/* Header Logo */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#1e2e4a] border border-[#2c3f63] flex items-center justify-center shrink-0 overflow-hidden p-1">
            <img src="/images/logo.png" alt="SILOA Logo" className="size-full object-contain" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-wider font-serif">SILOA</div>
            <div className="text-xs text-slate-400">Penerbitan &amp; Verifikasi LOA</div>
          </div>
        </div>

        {/* Concise Information */}
        <div className="my-auto py-12 space-y-6 max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif leading-tight text-white tracking-tight">
            Sistem Penerbitan &amp; Verifikasi Surat Penerimaan Artikel
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Platform resmi pengelolaan dan pengamanan dokumen Letter of Acceptance (LOA) berbasis penomoran otomatis dan verifikasi QR Code real-time.
          </p>

          <div className="pt-4 border-t border-[#202f4d] space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2Icon className="size-4 text-emerald-400 shrink-0" />
              <span>Standardisasi Format A4 Resmi &amp; Spesimen TTD</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2Icon className="size-4 text-emerald-400 shrink-0" />
              <span>Pengkodean Token Unik &amp; Verifikasi QR Code Publik</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2Icon className="size-4 text-emerald-400 shrink-0" />
              <span>Manajemen Edisi Terbitan &amp; Pejabat Penandatangan</span>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Universitas Sains dan Teknologi Komputer
        </div>
      </div>

      {/* Main Login Form Area (Centered on Mobile & Desktop) */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm sm:max-w-md space-y-6">
          {/* Mobile Header Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-2">
            <div className="size-10 rounded-xl bg-[#14213A] flex items-center justify-center shrink-0 overflow-hidden p-1">
              <img src="/images/logo.png" alt="SILOA Logo" className="size-full object-contain" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-xl tracking-wider font-serif text-slate-900">SILOA</div>
              <div className="text-[11px] text-slate-500 font-medium">Penerbitan &amp; Verifikasi LOA</div>
            </div>
          </div>

          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
              Masuk ke Akun
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Masukkan alamat email dan kata sandi Anda untuk mengakses portal SILOA.
            </p>
          </div>

          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login-email" className="text-xs font-semibold text-slate-700">
                    Alamat Email
                  </Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-2.5 size-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="login-email"
                      type="email"
                      required
                      placeholder="admin@stekom.ac.id"
                      className="pl-9 text-sm h-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                    Kata Sandi
                  </Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-2.5 size-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="pl-9 pr-10 text-sm h-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded"
                      title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 text-sm font-semibold bg-[#14213A] hover:bg-[#1c2e50] text-white gap-2 mt-2 shadow-xs transition-colors"
                >
                  <LogInIcon className="size-4" />
                  <span>{isSubmitting ? 'Memproses...' : 'Masuk ke Sistem'}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Demo Credentials */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-white/80 space-y-2">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Akun Demo</span>
              <span className="text-[10px] text-slate-400 font-normal">Klik untuk mengisi</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium justify-center"
              onClick={() => handleFillDemo('admin@stekom.ac.id', 'admin123')}
            >
              Super Admin (admin@stekom.ac.id)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
