import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore"; // Sesuaikan path import-nya

const ProtectedRoute = () => {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  
  // Panggil fungsi dari Zustand
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    let isMounted = true;

    api.get('/auth/profile')
      .then((res) => {
        if (isMounted) {
          // Tangkep data user dari Golang lu. 
          // (Sesuaikan "res.data.data" dengan struktur JSON Golang lu)
          const userData = res.data.data || res.data; 
          setUser(userData); // Simpen ke Zustand
          
          setStatus('authorized');
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Auth Check failed:", err);
          clearAuth(); // Bersihin data user kalau gagal
          setStatus('unauthorized');
        }
      });

    return () => { isMounted = false; };
  }, [setUser, clearAuth]);

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