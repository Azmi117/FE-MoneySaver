import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, Receipt, CheckCircle, CreditCard, User, LogOut, Wallet } from "lucide-react";
import { cn } from "@/utils/cn";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
    { path: "/workspaces", name: "Workspaces", icon: Briefcase },
    { path: "/transactions", name: "Transactions", icon: Receipt },
    { path: "/pending-approvals", name: "Pending Approvals", icon: CheckCircle },
    { path: "/split-bills", name: "Split Bills", icon: CreditCard },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-surface border-r border-gray-100 shadow-sm z-30 shrink-0 h-screen">
      <div className="h-20 flex items-center px-6 border-b border-gray-100 gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <Wallet size={18} />
        </div>
        <h1 className="font-bold text-lg text-text">Money Saver</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm",
                isActive ? "bg-blue-50 text-primary font-semibold" : "text-gray-500 hover:text-text hover:bg-gray-50"
              )}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}

        <div className="my-2 border-t border-gray-100"></div>

        {/* MENU PROFILE YANG DIAMBIL DARI PROFILE.TSX */}
        <Link
          to="/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm",
            location.pathname === "/profile" ? "bg-blue-50 text-primary font-semibold" : "text-gray-500 hover:text-text hover:bg-gray-50"
          )}
        >
          <User size={20} />
          Profile
        </Link>

        <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium mt-auto hover:bg-red-50 hover:text-danger transition-colors text-sm">
          <LogOut size={20} /> Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;