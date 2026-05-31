import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import heroImg from "@/assets/hero.png";
import { authService } from "@/services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, code } = location.state || {}; // Ngambil dari VerifyOTP
  
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Kalau user langsung ketik URL reset-password tanpa OTP, tendang balik
  if (!email || !code) {
    navigate("/forgot-password");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.resetPassword({ email, code, new_password: newPassword });
      navigate("/login", { state: { message: "Password reset successful! Please login." } });
    } catch (e) {
      alert("Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50/50 flex-col justify-center items-center p-12 border-r border-gray-100">
         <img src={heroImg} alt="Illustration" className="max-w-xs" />
      </div>

      <div className="w-full lg:w-1/2 bg-surface flex flex-col p-6 justify-center">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">New Password</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input type="password" label="New Password" iconLeft={<Lock size={20} />} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <Button fullWidth disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : "Update Password"}</Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;