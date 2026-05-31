import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/services/api";

const ProtectedRoute = () => {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    let isMounted = true; // Biar gak update state pas komponen udah di-unmount

    api.get('/auth/profile')
      .then(() => {
        if (isMounted) setStatus('authorized');
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Auth Check failed:", err);
          setStatus('unauthorized'); // <-- Pastiin ini jalan
        }
      });

    return () => { isMounted = false; };
  }, []);

  // Tambahin ini: Kalau stuck lebih dari 5 detik, paksa unauthorized!
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') setStatus('unauthorized');
    }, 5000);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'loading') {
    return <div className="h-screen flex items-center justify-center">Validating session...</div>;
  }

  return status === 'authorized' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;