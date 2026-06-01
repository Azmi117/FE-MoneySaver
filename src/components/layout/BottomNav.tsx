import { Link, useLocation } from "react-router-dom";
// 1. Ganti import ikon 'Layers' jadi 'Receipt' (atau 'Users' kalau lu lebih suka)
import { Home, History, Receipt, User, Scan } from "lucide-react";
import { cn } from "@/utils/cn";

interface BottomNavProps {
  onFabClick: () => void;
}

const BottomNav = ({ onFabClick }: BottomNavProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/transactions", label: "History", icon: History },
    // 2. Ubah path, label, dan icon di sini dari Workspaces ke Split Bill
    { path: "/split-bills", label: "Split Bill", icon: Receipt }, 
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 shadow-lg z-40 px-2 pb-safe">
      <div className="flex items-center justify-between h-16 relative max-w-md mx-auto">
        
        {/* Tombol Navigasi Kiri (Home & History) */}
        <div className="flex flex-1 justify-around pr-6">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-colors",
                  isActive ? "text-primary font-bold" : "text-gray-400 hover:text-text"
                )}
              >
                <Icon size={20} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* FAB CENTRAL BUTTON (Tombol scan bulet biru tengah) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFabClick();
            }}
            className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95 transition-transform border-4 border-surface"
            title="Scan Receipt (OCR)"
          >
            <Scan size={22} className="animate-in fade-in duration-300" />
          </button>
        </div>

        {/* Tombol Navigasi Kanan (Split Bill & Profile) */}
        <div className="flex flex-1 justify-around pl-6">
          {navItems.slice(2, 4).map((item) => {
            const Icon = item.icon;
            // Tips: Pake startsWith biar kalau lu masuk ke detail (misal: /split-bill/123), menu ini tetep nyala aktif
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-colors",
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
    </div>
  );
};

export default BottomNav;