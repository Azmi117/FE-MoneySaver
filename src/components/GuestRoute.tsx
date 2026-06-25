import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/services/api";

const GuestRoute = () => {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    let isMounted = true;

    // Nembak profile buat ngecek token. 
    // Kalau access_token mati, interceptor lu otomatis nyoba refresh token di background!
    api.get('/auth/profile')
      .then(() => {
        if (isMounted) setStatus('authorized'); // Berarti dia masih login
      })
      .catch(() => {
        if (isMounted) setStatus('unauthorized'); // Berarti dia beneran guest
      });

    return () => { isMounted = false; };
  }, []);

  if (status === 'loading') {
    return <div className="h-screen flex items-center justify-center text-gray-500 font-bold">Checking session...</div>;
  }

  // LOGIC UTAMA: Kalau authorized (udah login), paksa tendang ke dashboard. Kalau belum, biarin masuk (Outlet).
  return status === 'authorized' ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default GuestRoute;