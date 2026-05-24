import { Link, useLocation } from "react-router-dom";
import { Home, Receipt, Plus, CreditCard, User } from "lucide-react";
import { cn } from "@/utils/cn";

interface BottomNavProps {
  onFabClick: () => void;
}

const BottomNav = ({ onFabClick }: BottomNavProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", name: "Home", icon: Home },
    { path: "/transactions", name: "History", icon: Receipt },
    { path: "fab", name: "", icon: Plus, isFab: true }, // Tombol tengah tengah
    { path: "/split-bills", name: "Split Bill", icon: CreditCard },
    { path: "/profile", name: "Profile", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-gray-100 px-4 py-2 pb-safe z-30 flex justify-between items-center shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
      {navItems.map((item, idx) => {
        if (item.isFab) {
          return (
            <div key={idx} className="relative -top-5">
              <button
                onClick={onFabClick}
                className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <Plus size={28} />
              </button>
            </div>
          );
        }

        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[60px] py-1 text-center focus:outline-none",
              isActive ? "text-primary" : "text-gray-400"
            )}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-semibold">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;