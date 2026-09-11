import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { VerifyPage } from './pages/VerifyPage';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { user, loading } = useAuth();
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocation = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  // Public verify route
  if (pathname.startsWith('/v/') || pathname === '/verify') {
    const token = pathname.startsWith('/v/') ? pathname.split('/v/')[1] : null;
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#E8EAE4', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px' }}>
         <VerifyPage initialToken={token} loas={[]} journals={[]} publicMode={true} />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Layout />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
