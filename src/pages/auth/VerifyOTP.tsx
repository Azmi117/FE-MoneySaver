import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { authService } from "@/services/authService";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const type = location.state?.type || "login";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(location.state?.message || "");
  
  // State baru buat handle cooldown
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  // Logic countdown buat timer resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    
    if (code.length < 6) {
      setErrorMsg("Please complete the 6-digit code.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (type === "login") {
        await authService.verifyLoginOTP({ email, code });
        navigate("/dashboard");
      } else if (type === "register") {
        await authService.verifyRegisterOTP({ email, code });
        navigate("/login", { state: { message: "Account verified! Please login." } });
      } else if (type === "forgot_password") {
        navigate("/reset-password", { state: { email, code } });
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      const result = await authService.resendOTP({ email, type });
      setSuccessMsg(result.message || "New OTP has been sent!");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      // Set cooldown 60 detik agar sinkron dengan rate limiter backend
      setCooldown(60); 
    } catch (error: any) {
      // Error handling yang nangkep pesan dari backend kalau kena rate limit (429)
      setErrorMsg(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        )}

        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6 shadow-xs">
            <Mail size={30} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-3">
            {type === 'register' ? 'Activate Account' : 'Verify your email'}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            We've sent a 6-digit verification code to <br/>
            <span className="font-semibold text-text">{email}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-danger">{errorMsg}</p>
          </div>
        )}
        {successMsg && !errorMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle size={20} className="text-success shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-success">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8" autoComplete="off">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-text bg-background border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-150"
              />
            ))}
          </div>

          <Button type="submit" fullWidth disabled={otp.join("").length < 6 || isLoading}>
            Verify & Proceed
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the email?{" "}
            <button 
                onClick={handleResend} 
                disabled={cooldown > 0 || isLoading}
                type="button" 
                className={`font-semibold ${cooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:underline'} focus:outline-none`}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Click to resend"}
            </button>
          </p>
        </div>

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-text transition-all group">
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;