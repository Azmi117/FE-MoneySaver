import { Link, useLocation } from "react-router-dom";
import { Home, Briefcase, Receipt, User, Wallet } from "lucide-react";
import { cn } from "@/utils/cn";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/transactions", label: "Transaction", icon: Wallet },
    // Menu Workspace sekarang masuk ke mari
    { path: "/workspaces", label: "Workspace", icon: Briefcase }, 
    { path: "/split-bills", label: "Split Bill", icon: Receipt }, 
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 shadow-lg z-40 px-2 pb-safe">
      <div className="flex items-center justify-between h-16 max-w-md mx-auto px-1">
        
        {/* Render semua menu secara rata, fleksibel dibagi 5 */}
        {navItems.map((item) => {
          const Icon = item.icon;
          // Kasih logic spesial buat /dashboard biar gak nyala terus kalau cuma startsWith
          const isActive = item.path === "/dashboard" 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-primary font-bold" : "text-gray-400 hover:text-text"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}

      </div>
    </div>
  );
};

export default BottomNav;