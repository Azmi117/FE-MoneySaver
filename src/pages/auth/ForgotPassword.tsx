import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import heroImg from "@/assets/hero.png";
import { authService } from "@/services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      // Panggil endpoint backend buat minta kirim OTP Forgot Password
      const result = await authService.forgotPasswordRequest(email);
      
      // Lempar ke halaman OTP dengan type 'forgot_password'
      navigate("/verify-otp", {
        state: { 
          email, 
          type: "forgot_password", 
          message: result.message || "OTP sent! Please check your email." 
        }
      });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* BAGIAN KIRI: Ilustrasi */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50/50 flex-col justify-center items-center p-12 border-r border-gray-100">
        <div className="max-w-lg text-center">
          <img src={heroImg} alt="Money Saver Illustration" className="w-full h-auto mb-10 object-contain drop-shadow-md" />
          <h2 className="text-3xl font-bold text-text mb-4">Turn your ideas into reality.</h2>
          <p className="text-gray-500 text-lg">Start for free and get attractive offers from the community</p>
        </div>
      </div>

      {/* BAGIAN KANAN: Form */}
      <div className="w-full lg:w-1/2 bg-surface flex flex-col p-6 justify-center">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1 justify-center my-4">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text mb-3">Forgot Password</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Enter your email address and we'll send you an OTP code to reset your password
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-danger">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" autoComplete="off">
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your registered email"
              iconLeft={<Mail size={20} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <Button type="submit" fullWidth className="mt-2" disabled={isLoading}>
              {isLoading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20}/> Sending...</span> : "Send OTP"}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-all group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;