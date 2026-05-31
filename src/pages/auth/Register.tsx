import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Eye, EyeOff, Image, Send, Loader2, AlertCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import heroImg from "@/assets/hero.png"; 
import { cn } from "@/utils/cn";

import { authService } from "@/services/authService";

const Register = () => {
  const navigate = useNavigate();

  // STATE UNTUK FORM
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarName, setAvatarName] = useState<string>("");
  
  // STATE UI
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarName(e.target.files[0].name);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      // Karena endpoint Golang lu nerima multipart/form-data, kita pake FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      
      if (telegramId) {
        formData.append("telegram_id", telegramId);
      }
      
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      // Tembak API Register
      const result = await authService.register(formData);

      // Golang balikin status "success" (201 Created)
      if (result.status === "success") {
        // Langsung lempar ke halaman Verify OTP bawa KTP (state) type "register"
        navigate("/verify-otp", {
          state: {
            email: email,
            type: "register",
            message: result.message || "Registration successful! Please check your email for the activation code."
          }
        });
      }
    } catch (error: any) {
      // Tangkep error (misal email udah kepake -> 409 Conflict)
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* BAGIAN KIRI: Ilustrasi */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50/50 flex-col justify-center items-center p-12 border-r border-gray-100">
        <div className="max-w-lg text-center">
          <img 
            src={heroImg} 
            alt="Money Saver Illustration" 
            className="w-full h-auto mb-10 object-contain drop-shadow-md"
          />
          <h2 className="text-3xl font-bold text-text mb-4">Turn your ideas into reality.</h2>
          <p className="text-gray-500 text-lg">Start for free and get attractive offers from the community</p>
        </div>
      </div>

      {/* BAGIAN KANAN: Form Register */}
      <div className="w-full lg:w-1/2 bg-surface flex flex-col p-6 justify-center overflow-y-auto">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1 justify-center my-4">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text mb-3">Create Account</h1>
            <p className="text-gray-500 text-sm">Join us today and start managing your financial balance</p>
          </div>

          {/* Notifikasi Error */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in">
              <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-danger">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5" autoComplete="off">
            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              iconLeft={<User size={20} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              iconLeft={<Mail size={20} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <div className="flex flex-col gap-1">
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Create a secure password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-primary transition-colors cursor-pointer"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            </div>

            <Input
              type="text"
              label="Telegram ID (Optional)"
              placeholder="e.g. 123456789"
              autoComplete="off"
              iconLeft={<Send size={20} />}
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              disabled={isLoading}
            />

            {/* Custom Avatar Upload Field */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-text">Avatar Profile (Optional)</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-gray-400 flex items-center justify-center pointer-events-none">
                  <Image size={20} />
                </div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="avatar-upload"
                  className={cn(
                    "w-full rounded-xl border bg-surface pl-11 pr-4 py-3 text-sm flex items-center justify-between transition-colors",
                    isLoading ? "opacity-50 cursor-not-allowed border-gray-100" : "cursor-pointer border-gray-200 hover:border-primary",
                    avatarName ? "text-text" : "text-gray-400"
                  )}
                >
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">
                    {avatarName || "Choose profile picture"}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium shrink-0">
                    Browse
                  </span>
                </label>
              </div>
            </div>

            <Button type="submit" fullWidth className="mt-4" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" /> Creating Account...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400 font-medium">Or sign up with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Register */}
          <div className="flex flex-col gap-4">
            <Button variant="outline" fullWidth className="gap-3 text-text border-gray-300">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 pb-4">
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;