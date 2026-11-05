'use client';
import { useEffect, useState } from 'react';
import Dashboard from '@frontend/components/dashboard';

export default function DirectAdminPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.cookie = "oculix_admin_direct=admin11122010; path=/; max-age=31536000; SameSite=Lax";
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="wrap portal">
        <div className="empty">Opening admin panel…</div>
      </main>
    );
  }

  return (
    <Dashboard
      name="Administrator"
      email="oculixofficial@gmail.com"
      isAdmin={true}
    />
  );
}
