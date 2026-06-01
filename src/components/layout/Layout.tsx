import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronDown, Scan, Check, Search, X, CheckCircle, UploadCloud, Trash2, Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";

// IMPORT ZUSTAND STORE
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface LayoutProps {
  children: React.ReactNode;
}

// MOCK DATA HASIL SCAN (Buat state review)
const mockScannedData = {
  merchant: "Starbucks Coffee",
  date: "2026-05-23", 
  items: [
    { id: 1, name: "Caramel Macchiato", price: 55000 },
    { id: 2, name: "Almond Croissant", price: 35000 },
    { id: 3, name: "Jl. Sudirman No 12", price: 15000 }, 
  ]
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// HELPER: Buat ngambil huruf pertama dari nama Workspace
const getInitial = (name?: string) => {
  return name ? name.charAt(0).toUpperCase() : "W";
};

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // ==========================================
  // GLOBAL STATE (ZUSTAND)
  // ==========================================
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  const showDropdownPages = ["/dashboard", "/transactions"].includes(location.pathname);

  // ==========================================
  // STATE & LOGIC UNTUK MODAL GLOBAL OCR
  // ==========================================
  const [showGlobalOcr, setShowGlobalOcr] = useState(false);
  const [ocrMethod, setOcrMethod] = useState<"hybrid" | "alt">("hybrid");
  
  const [ocrState, setOcrState] = useState<"upload" | "scanning" | "review">("upload");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scannedMerchant, setScannedMerchant] = useState("");
  const [scannedDate, setScannedDate] = useState("");
  const [scannedItems, setScannedItems] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setReceiptFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setReceiptFile(e.dataTransfer.files[0]);
  };

  const handleScanReceipt = () => {
    setOcrState("scanning");
    
    setTimeout(() => {
      setScannedMerchant(mockScannedData.merchant);
      setScannedDate(mockScannedData.date);
      setScannedItems(mockScannedData.items);
      setOcrState("review");
    }, 1500);
  };

  const handleDeleteScannedItem = (id: number) => {
    setScannedItems(scannedItems.filter(item => item.id !== id));
  };

  const handleUpdateScannedItem = (id: number, field: string, value: string) => {
    setScannedItems(scannedItems.map(item => 
      item.id === id ? { ...item, [field]: field === 'price' ? Number(value) : value } : item
    ));
  };

  const handleConfirmSave = () => {
    alert("Record saved! Redirecting to Pending Approvals...");
    closeGlobalOcr();
  };

  const closeGlobalOcr = () => {
    setShowGlobalOcr(false);
    setOcrState("upload");
    setReceiptFile(null);
  };

  const calculatedTotal = scannedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Fallback variabel buat nampilin UI kalo data belum keload
  const currentName = activeWorkspace?.name || "Loading Workspace...";
  const currentInitial = getInitial(activeWorkspace?.name);
  const activeWsId = activeWorkspace?.id || activeWorkspace?.ID;

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden relative" onClick={() => setIsWorkspaceOpen(false)}>
      {/* SIDEBAR DESKTOP */}
      <Sidebar />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {showDropdownPages && (
          <div className="w-full bg-surface lg:bg-transparent border-b border-gray-100 lg:border-none shadow-sm lg:shadow-none z-40 shrink-0">
            <header className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-0 py-3 sm:py-4 lg:pt-8 lg:pb-3 flex items-center justify-between">
              
              <div className="relative">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Cegah buka dropdown kalau workspaces kosong
                    if (workspaces.length > 0) setIsWorkspaceOpen(!isWorkspaceOpen);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-2 -ml-2 rounded-2xl transition-colors",
                    workspaces.length > 0 ? "cursor-pointer hover:bg-gray-100/50 lg:hover:bg-white" : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {currentInitial}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <h2 className="text-sm font-bold text-text truncate max-w-[120px] sm:max-w-[180px]">{currentName}</h2>
                      {workspaces.length > 0 && (
                        <ChevronDown size={14} className={cn("text-gray-400 shrink-0 transition-transform", isWorkspaceOpen && "rotate-180")} />
                      )}
                    </div>
                  </div>
                </div>

                {isWorkspaceOpen && workspaces.length > 0 && (
                  <div className="absolute left-0 mt-2 w-64 bg-surface border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Switch Workspace</div>
                    <div className="flex flex-col max-h-60 overflow-y-auto mt-1">
                      {workspaces.map((ws, index) => {
                        const wsId = ws.id || ws.ID || index;
                        const isActive = activeWsId === wsId;

                        return (
                          <button
                            key={wsId}
                            onClick={() => {
                              setActiveWorkspace(ws);
                              setIsWorkspaceOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between gap-2",
                              isActive ? "text-primary bg-blue-50/50 font-bold" : "text-text"
                            )}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <div className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                {getInitial(ws.name)}
                              </div>
                              <span className="truncate">{ws.name}</span>
                            </div>
                            {isActive && <Check size={16} className="text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 sm:gap-3 shrink-0">
                <div className="hidden lg:block relative w-60">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full bg-white border border-gray-200/80 text-xs rounded-full pl-10 pr-4 py-2.5 shadow-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text"
                  />
                </div>

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
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <BottomNav onFabClick={() => setShowGlobalOcr(true)} />

      {/* ========================================== */}
      {/* MODAL GLOBAL OCR                           */}
      {/* ========================================== */}
      {showGlobalOcr && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className={cn("bg-surface rounded-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300", ocrState === "review" ? "max-w-md" : "max-w-lg")}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  {ocrState === "upload" || ocrState === "scanning" ? <Scan size={18}/> : <Plus size={18}/>}
                </div>
                {ocrState === "review" ? "Add New Record" : "Scan Receipt (OCR)"}
              </h2>
              <button onClick={closeGlobalOcr} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
                <X size={18}/>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              
              {/* STATE 1 & 2: UPLOAD & SCANNING */}
              {(ocrState === "upload" || ocrState === "scanning") && (
                <div className="flex flex-col items-center justify-center h-full min-h-[250px] w-full">
                   {ocrState === "upload" && (
                     <>
                       <div className="flex bg-gray-100 p-1 rounded-xl w-full mb-6">
                          <button onClick={() => setOcrMethod("hybrid")} className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", ocrMethod === "hybrid" ? "bg-white shadow-sm text-primary" : "text-gray-500")}>Hybrid Engine</button>
                          <button onClick={() => setOcrMethod("alt")} className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", ocrMethod === "alt" ? "bg-white shadow-sm text-primary" : "text-gray-500")}>OCR Space (Alt)</button>
                       </div>

                       <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                       
                       {!receiptFile ? (
                         <div onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-primary/40 bg-blue-50/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-50/60 transition-all text-center">
                           <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-primary"><UploadCloud size={28} /></div>
                           <p className="text-xs text-gray-500">Upload receipt image</p>
                         </div>
                       ) : (
                         <div className="w-full border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-4 bg-gray-50">
                            <div className="w-12 h-12 bg-green-100 text-success rounded-full flex items-center justify-center"><CheckCircle size={24}/></div>
                            <div className="text-center">
                              <h4 className="font-bold text-text text-sm truncate max-w-[200px]">{receiptFile.name}</h4>
                            </div>
                            <button onClick={() => setReceiptFile(null)} className="text-xs font-bold text-danger hover:underline">Remove file</button>
                         </div>
                       )}
                     </>
                   )}

                   {ocrState === "scanning" && (
                     <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <Search size={40} className="text-primary animate-pulse" />
                        <h3 className="font-bold text-lg text-text">Scanning Receipt...</h3>
                        <p className="text-xs text-gray-500">Extracting merchant, items, and total amount using AI.</p>
                     </div>
                   )}
                </div>
              )}

              {/* STATE 3: REVIEW HASIL SCAN */}
              {ocrState === "review" && (
                <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-blue-50 text-primary px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-100">
                    <CheckCircle size={18}/> Scan Complete! Review and edit if needed.
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Merchant</label>
                    <input type="text" value={scannedMerchant} onChange={(e) => setScannedMerchant(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Date</label>
                    <input type="date" value={scannedDate} onChange={(e) => setScannedDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Scanned Items</label>
                    <div className="flex flex-col gap-2">
                      {scannedItems.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input type="text" value={item.name} onChange={(e) => handleUpdateScannedItem(item.id, 'name', e.target.value)} className="flex-1 bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-primary outline-none" />
                          <input type="number" value={item.price} onChange={(e) => handleUpdateScannedItem(item.id, 'price', e.target.value)} className="w-28 bg-white border border-gray-200 text-sm font-bold rounded-lg px-3 py-2.5 focus:border-primary outline-none" />
                          <button onClick={() => handleDeleteScannedItem(item.id)} className="p-2.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between mt-2">
                    <span className="font-bold text-gray-500">Calculated Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(calculatedTotal)}</span>
                  </div>

                </div>
              )}
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-3xl shrink-0">
              <Button variant="outline" onClick={closeGlobalOcr} className="text-xs font-bold py-2.5 px-6 rounded-xl bg-white border-gray-200">
                Cancel
              </Button>
              
              {ocrState === "upload" && (
                <Button onClick={handleScanReceipt} disabled={!receiptFile} className={cn("text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm gap-2 w-full sm:w-auto", !receiptFile && "opacity-50 cursor-not-allowed")}>
                  <Search size={16}/> Scan & Analyze
                </Button>
              )}

              {ocrState === "review" && (
                <Button onClick={handleConfirmSave} className="text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm bg-success hover:bg-green-600 text-white border-none w-full sm:w-auto">
                  Confirm & Save
                </Button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;