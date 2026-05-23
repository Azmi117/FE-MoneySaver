import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

const VerifyOTP = () => {
  // State buat 6 kotak OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  // Ref buat ngatur auto-focus antar kotak
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Validasi: Cuma boleh masukin angka
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Ambil karakter terakhir (kalau user ngetik cepet)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // UX: Pindah fokus ke kotak selanjutnya kalau udah keisi (batas index 5)
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // UX: Pindah fokus ke kotak sebelumnya kalau pencet backspace di kotak kosong
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    // Container Utama: Menjaga konten selalu di tengah layar (Vertikal & Horizontal)
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      
      {/* Card Form OTP: Otomatis menyesuaikan lebar max-w-md di mobile & desktop */}
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
        
        {/* Header Section */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6 shadow-xs">
            <Mail size={30} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-3">Verify your email</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            We've sent a 6-digit verification code to <br/>
            <span className="font-semibold text-text">your registered email</span>
          </p>
        </div>

        {/* Form Section */}
        <form className="flex flex-col gap-8" autoComplete="off">
          
          {/* 6 Kotak Input OTP */}
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

          {/* Submit Button */}
          <Button type="submit" fullWidth>
            Verify & Proceed
          </Button>
        </form>

        {/* Resend Code */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the email?{" "}
            <button type="button" className="font-semibold text-primary hover:underline cursor-pointer focus:outline-none">
              Click to resend
            </button>
          </p>
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-text transition-all group"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;