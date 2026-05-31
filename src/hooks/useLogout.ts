// src/hooks/useLogout.ts
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authService.logout(); // Nembak backend lu
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      // Apapun yang terjadi (sukses/gagal di backend), 
      // tendang user ke login biar aman
      navigate("/login");
    }
  };

  return logout;
};