import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronDown, Plus, Scan, Check, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { cn } from "@/utils/cn";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [showGlobalOcr, setShowGlobalOcr] = useState(false);
  
  // STATE INTERAKTIF UNTUK DROPDOWN WORKSPACE
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("Personal Workspace");

  const workspaceList = [
    { id: "personal", name: "Personal Workspace", plan: "Free Plan", initial: "P" },
    { id: "kosan", name: "🏠 Kosan", plan: "Shared Plan", initial: "K" },
    { id: "liburan", name: "✈️ Liburan", plan: "Shared Plan", initial: "L" }
  ];

  const currentWorkspace = workspaceList.find(ws => ws.name === activeWorkspace) || workspaceList[0];

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden relative" onClick={() => setIsWorkspaceOpen(false)}>
      {/* SIDEBAR DESKTOP */}
      <Sidebar />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50/30">
        
        {/* --- HEADER GLOBAL (BORDERLESS & TRANSPARENT) --- */}
        <div className="w-full bg-surface lg:bg-transparent border-b border-gray-100 lg:border-none shadow-sm lg:shadow-none z-40 shrink-0">
          <header className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-0 py-3 sm:py-4 lg:pt-8 lg:pb-3 flex items-center justify-between">
            
            {/* KIRI: Dropdown Workspace Mentok Pojok Kiri Atas */}
            <div className="relative">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWorkspaceOpen(!isWorkspaceOpen);
                }}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100/50 lg:hover:bg-white p-2 -ml-2 rounded-2xl transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {currentWorkspace.initial}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <h2 className="text-sm font-bold text-text truncate max-w-[120px] sm:max-w-[180px]">{currentWorkspace.name}</h2>
                    <ChevronDown size={14} className={cn("text-gray-400 shrink-0 transition-transform", isWorkspaceOpen && "rotate-180")} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">{currentWorkspace.plan}</span>
                </div>
              </div>

              {/* POPUP DROPDOWN MENU PILIHAN */}
              {isWorkspaceOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-surface border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Switch Workspace</div>
                  <div className="flex flex-col max-h-60 overflow-y-auto mt-1">
                    {workspaceList.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setActiveWorkspace(ws.name);
                          setIsWorkspaceOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between gap-2",
                          activeWorkspace === ws.name ? "text-primary bg-blue-50/50 font-bold" : "text-text"
                        )}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                            {ws.initial}
                          </div>
                          <span className="truncate">{ws.name}</span>
                        </div>
                        {activeWorkspace === ws.name && <Check size={16} className="text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* KANAN: Search Bar & Notif Berjejer Rapi di Pojok Kanan Atas */}
            <div className="flex items-center gap-3 sm:gap-3 shrink-0">
              
              {/* FIX: Search Bar dipindah ke kanan, tidak terlalu panjang (w-60), lebih rounded (rounded-full) */}
              <div className="hidden lg:block relative w-60">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full bg-white border border-gray-200/80 text-xs rounded-full pl-10 pr-4 py-2.5 shadow-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text"
                />
              </div>

              {/* Icon Lonceng Tetap Berjejer Pas di Samping Search Bar */}
              <Link 
                to="/pending-approvals" 
                className="relative p-2.5 text-gray-500 hover:text-primary hover:bg-blue-50 lg:hover:bg-white rounded-full transition-all shrink-0 shadow-xs lg:border lg:border-gray-100 lg:bg-surface"
                title="Pending Approvals"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
              </Link>
              
            </div>
            
          </header>
        </div>
        {/* --- END HEADER GLOBAL --- */}

        {/* KONTEN HALAMAN UTAMA */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* BOTTOM NAV MOBILE */}
      <BottomNav onFabClick={() => setShowGlobalOcr(true)} />

      {/* MODAL GLOBAL OCR */}
      {showGlobalOcr && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface p-6 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Scan size={20}/></div>
              <h3 className="font-bold text-lg text-text">Scan Receipt (OCR)</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">Take a photo of your receipt to automatically extract items and split bills with your workspace members.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowGlobalOcr(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">Cancel</button>
              <button className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <Plus size={18}/> Choose Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;