import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Eye, EyeOff } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import heroImg from "@/assets/hero.png"; // <-- Import aset hero lu di sini

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    // Container Utama: Flex row
    <div className="min-h-screen bg-background flex">
      
      {/* BAGIAN KIRI: Ilustrasi (Hidden di Mobile, Tampil di Desktop/lg) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50/50 flex-col justify-center items-center p-12 border-r border-gray-100">
        <div className="max-w-lg text-center">
          <img 
            src={heroImg} 
            alt="Money Saver Illustration" 
            className="w-full h-auto mb-10 object-contain drop-shadow-md"
          />
          <h2 className="text-3xl font-bold text-text mb-4">
            Turn your ideas into reality.
          </h2>
          <p className="text-gray-500 text-lg">
            Start for free and get attractive offers from the community
          </p>
        </div>
      </div>

      {/* BAGIAN KANAN: Form Login (Lebar 100% di Mobile, 50% di Desktop) */}
      <div className="w-full lg:w-1/2 bg-surface flex flex-col p-6 justify-center">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1 justify-center">

          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-text mb-3">Welcome Back</h1>
            <p className="text-gray-500 text-sm">
              Please sign in to your account to continue
            </p>
          </div>

          {/* Form Section */}
          <form className="flex flex-col gap-5">
            <Input
              type="email"
              label="Email Address"
              iconLeft={<Mail size={20} />}
            />
            
            <div className="flex flex-col gap-1">
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                autoComplete="new-password"
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-primary transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth className="mt-4">
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400 font-medium">Or sign in with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Login */}
          <div className="flex flex-col gap-4">
            <Button variant="outline" fullWidth className="gap-3 text-text border-gray-300">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 pb-4">
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;