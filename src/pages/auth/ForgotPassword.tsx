import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import heroImg from "@/assets/hero.png";

const ForgotPassword = () => {
  return (
    // Container Utama: Flex row responsive
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

      {/* BAGIAN KANAN: Form Forgot Password (Lebar 100% di Mobile, 50% di Desktop) */}
      <div className="w-full lg:w-1/2 bg-surface flex flex-col p-6 justify-center">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1 justify-center my-4">
          
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text mb-3">Forgot Password</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Form Section */}
          <form className="flex flex-col gap-6" autoComplete="off">
            {/* Email Input */}
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your registered email"
              iconLeft={<Mail size={20} />}
            />

            {/* Submit Button */}
            <Button type="submit" fullWidth className="mt-2">
              Send Reset Link
            </Button>
          </form>

          {/* Footer Navigation (Kembali ke Login) */}
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