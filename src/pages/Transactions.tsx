import React, { useState, useRef } from "react";
import { 
  LayoutDashboard, Briefcase, Receipt, CheckCircle, CreditCard, Settings, Wallet, 
  Home, User, Plus, Search, Filter, Download, Coffee, ShoppingCart, Zap, TrendingUp, 
  Clock, MoreVertical, Trash2, Edit2, X, FileText, Camera, UploadCloud, DollarSign, Tag, Calendar, AlignLeft
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Dummy Data
const initialTransactions = [
  { id: 1, merchant: "Starbucks Coffee", category: "Food & Beverage", date: "22 May 2026, 14:30", amount: -45000, type: "expense", status: "approved", icon: Coffee, bg: "bg-orange-100", color: "text-orange-600" },
  { id: 2, merchant: "Monthly Groceries", category: "Shopping", date: "20 May 2026, 10:15", amount: -250000, type: "expense", status: "approved", icon: ShoppingCart, bg: "bg-blue-100", color: "text-blue-600" },
  { id: 3, merchant: "Electricity Bill", category: "Bills", date: "18 May 2026, 09:00", amount: -150000, type: "expense", status: "pending", icon: Zap, bg: "bg-yellow-100", color: "text-yellow-600" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const Transactions = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [activeTab, setActiveTab] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [mobileMenuTx, setMobileMenuTx] = useState<any>(null);

  // STATE MODAL TAMBAH TRANSAKSI
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "ocr">("manual");
  
  // STATE FORM MANUAL
  const [manualForm, setManualForm] = useState({ merchant: "", amount: "", category: "", date: "", note: "", type: "expense" });
  
  // STATE OCR UPLOAD & REVIEW
  const [ocrMethod, setOcrMethod] = useState<"hybrid" | "alt">("hybrid");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State baru buat ngatur flow OCR: upload -> scanning -> review
  const [ocrState, setOcrState] = useState<"upload" | "scanning" | "review">("upload");
  const [scannedData, setScannedData] = useState({
    merchant: "",
    date: "",
    items: [] as { id: number, name: string, price: number }[]
  });

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || tx.type === activeTab;
    return matchesSearch && matchesTab;
  });

  // HANDLER UPLOAD FILE (OCR)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setReceiptFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setReceiptFile(e.dataTransfer.files[0]);
  };

  // HANDLER MOCK API SCAN
  const handleScanReceipt = () => {
    setOcrState("scanning");
    
    // Simulasi nembak API OCR (hybrid/alt)
    setTimeout(() => {
      setScannedData({
        merchant: "Starbucks Coffee",
        date: "2026-05-23",
        items: [
          { id: 1, name: "Caramel Macchiato", price: 55000 },
          { id: 2, name: "Almond Croissant", price: 35000 },
          { id: 3, name: "Jl. Sudirman No 12", price: 15000 } // Contoh AI halusinasi baca alamat jadi item
        ]
      });
      setOcrState("review");
    }, 2000);
  };

  const handleRemoveScannedItem = (id: number) => {
    setScannedData({
      ...scannedData,
      items: scannedData.items.filter(item => item.id !== id)
    });
  };

  const handleUpdateScannedItem = (id: number, field: "name" | "price", value: string | number) => {
    setScannedData({
      ...scannedData,
      items: scannedData.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden relative">
      
      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex w-64 flex-col bg-surface border-r border-gray-100 shadow-sm z-30">
        <div className="h-20 flex items-center px-6 border-b border-gray-100 gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white"><Wallet size={18} /></div>
          <h1 className="font-bold text-lg text-text">Money Saver</h1>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium transition-colors"><LayoutDashboard size={20} /> Dashboard</button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium transition-colors"><Briefcase size={20} /> Workspaces</button>
          <button className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary rounded-xl font-semibold transition-colors"><Receipt size={20} /> Transactions</button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium transition-colors"><CheckCircle size={20} /> Pending Approvals</button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium transition-colors"><CreditCard size={20} /> Split Bills</button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium mt-auto"><Settings size={20} /> Settings</button>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-surface lg:bg-background/80 lg:backdrop-blur-md px-6 py-5 border-b border-gray-100 lg:border-none flex items-center justify-between z-20">
          <div>
            <h1 className="text-2xl font-bold text-text">Transaction History</h1>
            <p className="text-xs text-gray-500 hidden lg:block">View, filter, and manage your financial records</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden lg:flex py-2 px-4 rounded-xl text-xs gap-1.5 font-bold border-gray-200 text-gray-600 bg-white">
              <Download size={16} /> Export
            </Button>
            {/* TRIGGER MODAL DI DESKTOP */}
            <Button onClick={() => setShowAddModal(true)} className="py-2 px-4 rounded-xl text-xs gap-1.5 font-bold shadow-sm">
              <Plus size={16} /> <span className="hidden sm:inline">Add Record</span>
            </Button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 pb-28 lg:pb-10 w-full max-w-6xl mx-auto">
          <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-full">
            
            {/* Toolbar */}
            <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100 w-full sm:w-auto overflow-x-auto">
                {["all", "income", "expense"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn("flex-1 sm:flex-none px-4 py-2 text-xs font-bold capitalize rounded-lg transition-all", activeTab === tab ? "bg-white text-primary shadow-sm ring-1 ring-gray-200/50" : "text-gray-500 hover:text-text")}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search merchant..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-200 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <button className="p-2 border border-gray-200 rounded-xl text-gray-500 bg-white shrink-0 hover:text-primary hover:border-primary"><Filter size={18} /></button>
              </div>
            </div>

            {/* TRANSACTIONS LIST */}
            <div className="flex-1 flex flex-col">
              <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/30">
                <div className="col-span-4">Transaction Details</div>
                <div className="col-span-3">Date & Time</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {filteredTransactions.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-50">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="flex lg:grid lg:grid-cols-12 gap-4 items-center p-4 lg:px-8 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1 lg:col-span-4 flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", tx.bg, tx.color)}><tx.icon size={20} /></div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-text text-sm truncate">{tx.merchant}</h4>
                          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">{tx.category} <span className="lg:hidden">• {tx.date.split(',')[0]}</span></p>
                        </div>
                      </div>
                      <div className="hidden lg:block col-span-3 text-sm text-gray-500 font-medium">{tx.date}</div>
                      <div className={cn("hidden lg:block col-span-2 text-right font-bold text-sm", tx.amount > 0 ? "text-success" : "text-text")}>{tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}</div>
                      <div className="hidden lg:flex col-span-2 justify-center">
                        <span className={cn("flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md border", tx.status === "pending" ? "bg-yellow-50 text-accent border-yellow-200" : "bg-green-50 text-success border-green-200")}>
                          {tx.status === "pending" ? <Clock size={12}/> : <CheckCircle size={12}/>} {tx.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="hidden lg:flex col-span-1 justify-center relative">
                        <button onClick={() => setActionMenuOpen(actionMenuOpen === tx.id ? null : tx.id)} className="p-1.5 text-gray-400 hover:text-text rounded-lg hover:bg-gray-100"><MoreVertical size={18} /></button>
                        {actionMenuOpen === tx.id && (
                          <div className="absolute right-8 top-0 mt-2 w-36 bg-surface border border-gray-100 rounded-xl shadow-lg z-10 py-1">
                            {tx.status === "pending" && (<button className="w-full text-left px-4 py-2 text-xs font-semibold text-success hover:bg-green-50 flex items-center gap-2"><CheckCircle size={14}/> Confirm</button>)}
                            <button className="w-full text-left px-4 py-2 text-xs font-medium text-text hover:bg-gray-50 flex items-center gap-2"><Edit2 size={14}/> Edit</button>
                            <button className="w-full text-left px-4 py-2 text-xs font-medium text-danger hover:bg-red-50 flex items-center gap-2"><Trash2 size={14}/> Delete</button>
                          </div>
                        )}
                      </div>
                      <div className="lg:hidden flex flex-col items-end gap-1.5 shrink-0 pl-2">
                        <div className={cn("font-bold text-sm text-right", tx.amount > 0 ? "text-success" : "text-text")}>{tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}</div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border", tx.status === "approved" ? "bg-green-50 text-success border-green-200" : "bg-yellow-50 text-accent border-yellow-200")}>{tx.status.toUpperCase()}</span>
                          <button onClick={() => setMobileMenuTx(tx)} className="text-gray-400 p-1 bg-gray-50 rounded-md active:bg-gray-100"><MoreVertical size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4"><Receipt size={32} /></div>
                  <h3 className="font-bold text-text mb-1">No transactions found</h3>
                </div>
              )}
            </div>

            {filteredTransactions.length > 0 && (
              <div className="p-6 border-t border-gray-50 flex items-center justify-center bg-gray-50/30 rounded-b-3xl">
                <Button variant="outline" className="text-xs font-bold py-2.5 px-6 rounded-xl bg-white text-primary border-gray-200">Load More</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL ADD TRANSACTION (MANUAL & OCR) ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg"><Plus size={18}/></div>
                Add New Record
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setOcrState("upload"); // Reset state pas diclose
                  setReceiptFile(null);
                }} 
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
              >
                <X size={18}/>
              </button>
            </div>

            {/* Modal Tabs: Manual vs Scan (Sembunyiin tab pas lagi mode review/scanning) */}
            {ocrState === "upload" && (
              <div className="px-6 pt-5">
                <div className="flex bg-gray-100 p-1 rounded-xl w-full relative">
                  <button 
                    onClick={() => setAddMode("manual")}
                    className={cn("flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all z-10", addMode === "manual" ? "bg-white text-primary shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-text")}
                  >
                    <FileText size={16} /> Manual Entry
                  </button>
                  <button 
                    onClick={() => setAddMode("ocr")}
                    className={cn("flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all z-10", addMode === "ocr" ? "bg-white text-primary shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-text")}
                  >
                    <Camera size={16} /> Scan Receipt
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              
              {/* TAB 1: MANUAL ENTRY */}
              {addMode === "manual" ? (
                <form className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Merchant / Name</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Briefcase size={18}/></div>
                        <input type="text" placeholder="e.g. Starbucks, Salary" className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                      </div>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</div>
                        <input type="number" placeholder="0" className="w-full bg-gray-50 border border-gray-200 text-sm font-bold rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Type</label>
                      <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
                        <button type="button" onClick={()=>setManualForm({...manualForm, type: "expense"})} className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-colors", manualForm.type==="expense" ? "bg-white text-danger shadow-sm border border-red-100" : "text-gray-500")}>Expense</button>
                        <button type="button" onClick={()=>setManualForm({...manualForm, type: "income"})} className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-colors", manualForm.type==="income" ? "bg-white text-success shadow-sm border border-green-100" : "text-gray-500")}>Income</button>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Category</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Tag size={18}/></div>
                        <select className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-all">
                          <option value="">Select category...</option>
                          <option value="1">Food & Beverage</option>
                          <option value="2">Shopping</option>
                          <option value="3">Transportation</option>
                          <option value="4">Bills</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Date</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Calendar size={18}/></div>
                        <input type="date" className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Optional Note</label>
                      <div className="relative">
                        <div className="absolute left-4 top-4 text-gray-400"><AlignLeft size={18}/></div>
                        <textarea rows={2} placeholder="Add a description or note..." className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all"></textarea>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                /* TAB 2: OCR SCAN RECEIPT */
                <div className="flex flex-col items-center justify-center h-full min-h-[350px] w-full">
                   
                   {/* STATE: UPLOAD */}
                   {ocrState === "upload" && (
                     <>
                       <div className="flex bg-gray-100 p-1 rounded-xl w-full mb-6">
                          <button 
                            onClick={() => setOcrMethod("hybrid")}
                            className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", ocrMethod === "hybrid" ? "bg-white shadow-sm text-primary" : "text-gray-500")}
                          >
                            Hybrid Engine
                          </button>
                          <button 
                            onClick={() => setOcrMethod("alt")}
                            className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", ocrMethod === "alt" ? "bg-white shadow-sm text-primary" : "text-gray-500")}
                          >
                            OCR Space (Alt)
                          </button>
                       </div>

                       <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                       
                       {!receiptFile ? (
                         <div 
                           onDragOver={handleDragOver} 
                           onDrop={handleDrop}
                           onClick={() => fileInputRef.current?.click()}
                           className="w-full border-2 border-dashed border-primary/40 bg-blue-50/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-50/60 transition-all text-center"
                         >
                           <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-primary">
                             <UploadCloud size={28} />
                           </div>
                           <p className="text-xs text-gray-500">Upload receipt image for <span className="font-bold">{ocrMethod === "hybrid" ? "Hybrid Engine" : "Alternative OCR"}</span></p>
                         </div>
                       ) : (
                         <div className="w-full border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-4 bg-gray-50">
                            <div className="w-12 h-12 bg-green-100 text-success rounded-full flex items-center justify-center"><CheckCircle size={24}/></div>
                            <div className="text-center">
                              <h4 className="font-bold text-text text-sm truncate max-w-[200px]">{receiptFile.name}</h4>
                              <p className="text-xs text-gray-500">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button onClick={() => setReceiptFile(null)} className="text-xs font-bold text-danger hover:underline">Remove file</button>
                         </div>
                       )}
                     </>
                   )}

                   {/* STATE: SCANNING LOADING */}
                   {ocrState === "scanning" && (
                     <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <Search size={40} className="text-primary animate-pulse" />
                        <h3 className="font-bold text-lg text-text">Scanning Receipt...</h3>
                        <p className="text-xs text-gray-500">Extracting merchant, items, and total amount using AI.</p>
                     </div>
                   )}

                   {/* STATE: REVIEW & EDIT */}
                   {ocrState === "review" && (
                     <div className="w-full flex flex-col gap-5 text-left">
                        <div className="bg-blue-50 text-primary p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                          <CheckCircle size={16} /> Scan Complete! Review and edit if needed.
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2 sm:col-span-1">
                             <label className="text-xs font-bold text-gray-500 mb-1.5 block">Merchant</label>
                             <input type="text" value={scannedData.merchant} onChange={(e) => setScannedData({...scannedData, merchant: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-primary" />
                           </div>
                           <div className="col-span-2 sm:col-span-1">
                             <label className="text-xs font-bold text-gray-500 mb-1.5 block">Date</label>
                             <input type="date" value={scannedData.date} onChange={(e) => setScannedData({...scannedData, date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-primary" />
                           </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block">Scanned Items</label>
                          <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            {scannedData.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <input type="text" value={item.name} onChange={(e) => handleUpdateScannedItem(item.id, "name", e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                                <input type="number" value={item.price} onChange={(e) => handleUpdateScannedItem(item.id, "price", e.target.value)} className="w-24 sm:w-28 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                                <button type="button" onClick={() => handleRemoveScannedItem(item.id)} className="p-2 text-gray-400 hover:text-danger bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                          <span className="font-bold text-sm text-gray-500">Calculated Total</span>
                          <span className="font-bold text-xl text-primary">{formatCurrency(scannedData.items.reduce((acc, curr) => acc + Number(curr.price), 0))}</span>
                        </div>
                     </div>
                   )}
                </div>
              )}
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-3xl">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddModal(false);
                  setOcrState("upload"); // Reset pas tutup modal
                  setReceiptFile(null);
                }} 
                className="text-xs font-bold py-2.5 px-6 rounded-xl bg-white border-gray-200"
              >
                Cancel
              </Button>
              
              {addMode === "manual" ? (
                <Button className="text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm">
                  Save Transaction
                </Button>
              ) : ocrState === "review" ? (
                <Button className="text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm bg-success hover:bg-green-600 text-white border-none">
                  Confirm & Save
                </Button>
              ) : (
                <Button 
                  onClick={handleScanReceipt}
                  disabled={!receiptFile || ocrState === "scanning"} 
                  className={cn("text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm gap-2", (!receiptFile || ocrState === "scanning") && "opacity-50 cursor-not-allowed")}
                >
                  {ocrState === "scanning" ? "Scanning..." : <><Search size={16}/> Scan & Analyze</>}
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MOBILE ACTION DRAWER */}
      {mobileMenuTx && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200" onClick={() => setMobileMenuTx(null)} />
          <div className="lg:hidden fixed bottom-0 left-0 w-full bg-surface z-50 rounded-t-3xl shadow-xl flex flex-col transition-transform duration-300 ease-out pb-safe">
            <div className="w-full flex flex-col items-center pt-3 pb-4 border-b border-gray-50">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4 cursor-pointer" onClick={() => setMobileMenuTx(null)}></div>
              <div className="flex items-center gap-3 px-6 w-full">
                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", mobileMenuTx.bg, mobileMenuTx.color)}>
                    <mobileMenuTx.icon size={20} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text truncate">{mobileMenuTx.merchant}</h3>
                    <p className="text-xs text-gray-500">{formatCurrency(mobileMenuTx.amount)}</p>
                 </div>
                 <button onClick={() => setMobileMenuTx(null)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={18}/></button>
              </div>
            </div>
            
            <div className="flex flex-col p-4 gap-2">
              {mobileMenuTx.status === "pending" && (
                <button className="flex items-center gap-3 w-full p-4 text-sm font-bold text-success bg-green-50 rounded-2xl border border-green-100">
                  <CheckCircle size={18}/> Confirm Transaction
                </button>
              )}
              <button className="flex items-center gap-3 w-full p-4 text-sm font-semibold text-text hover:bg-gray-50 rounded-2xl">
                <Edit2 size={18} className="text-gray-400"/> Edit Details
              </button>
              <button className="flex items-center gap-3 w-full p-4 text-sm font-semibold text-danger hover:bg-red-50 rounded-2xl">
                <Trash2 size={18} className="text-red-400"/> Delete Record
              </button>
            </div>
          </div>
        </>
      )}

      {/* BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-gray-100 px-6 py-3 pb-safe z-30 flex justify-between items-center shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        <button className="flex flex-col items-center gap-1 text-gray-400 focus:outline-none"><Home size={24} /><span className="text-[10px] font-semibold">Home</span></button>
        <button className="flex flex-col items-center gap-1 text-primary focus:outline-none"><Receipt size={24} /><span className="text-[10px] font-semibold">History</span></button>
        
        {/* TRIGGER MODAL DI MOBILE */}
        <div className="relative -top-6">
          <button onClick={() => setShowAddModal(true)} className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Plus size={28} />
          </button>
        </div>
        
        <button className="flex flex-col items-center gap-1 text-gray-400 focus:outline-none"><CreditCard size={24} /><span className="text-[10px] font-semibold">Split Bill</span></button>
        <button className="flex flex-col items-center gap-1 text-gray-400 focus:outline-none"><User size={24} /><span className="text-[10px] font-semibold">Profile</span></button>
      </nav>
    </div>
  );
};

export default Transactions;