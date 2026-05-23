import React, { useState } from "react";
import { 
  LayoutDashboard, Briefcase, Receipt, CheckCircle, CreditCard, Settings, Wallet, 
  Home, User, Plus, Search, Filter, Check, X, Clock, Edit2, AlertCircle, Mail, Scan, Save
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";

// --- MOCK DATA (Sesuai Logic Backend: Email Parser & OCR) ---
const mockPendingTransactions = [
  { 
    id: 701, 
    source: "Email Parser", 
    sourceIcon: Mail,
    raw_text: "Pembayaran QRIS Mandiri Rp55.000 ke MCDONALDS", 
    merchant: "McDonald's", 
    category: "Food & Beverage", 
    date: "23 May 2026, 12:30", 
    amount: -55000, 
    type: "expense", 
    confidence: 95, 
    bg: "bg-blue-100", color: "text-blue-600"
  },
  { 
    id: 702, 
    source: "OCR Scanner", 
    sourceIcon: Scan,
    raw_text: "TOTAL Rp 150.000 PLN TOKEN", 
    merchant: "PLN (Token Listrik)", 
    category: "Bills", 
    date: "22 May 2026, 09:15", 
    amount: -150000, 
    type: "expense", 
    confidence: 65, 
    bg: "bg-purple-100", color: "text-purple-600"
  },
  { 
    id: 703, 
    source: "Email Parser", 
    sourceIcon: Mail,
    raw_text: "Transfer Mandiri Rp1.500.000 dari PT ARTHA IT", 
    merchant: "PT ARTHA IT", 
    category: "Salary", 
    date: "15 May 2026, 10:00", 
    amount: 1500000, 
    type: "income", 
    confidence: 90,
    bg: "bg-green-100", color: "text-green-600"
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const PendingApprovals = () => {
  const [pendingList, setPendingList] = useState(mockPendingTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTx, setEditingTx] = useState<any>(null);

  const handleApprove = (id: number) => {
    setPendingList(pendingList.filter(tx => tx.id !== id));
  };

  const handleReject = (id: number) => {
    setPendingList(pendingList.filter(tx => tx.id !== id));
  };

  const handleApproveAll = () => {
    setPendingList([]);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingList(pendingList.map(tx => tx.id === editingTx.id ? editingTx : tx));
    setEditingTx(null); 
  };

  const filteredList = pendingList.filter(tx => 
    tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tx.raw_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden relative">
      
      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex w-64 flex-col bg-surface border-r border-gray-100 shadow-sm z-30 shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-gray-100 gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white"><Wallet size={18} /></div>
          <h1 className="font-bold text-lg text-text">Money Saver</h1>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium transition-colors"><LayoutDashboard size={20} /> Dashboard</button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium transition-colors"><Briefcase size={20} /> Workspaces</button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium transition-colors"><Receipt size={20} /> Transactions</button>
          <button className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary rounded-xl font-semibold transition-colors">
            <CheckCircle size={20} /> Pending Approvals
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium transition-colors"><CreditCard size={20} /> Split Bills</button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-xl font-medium mt-auto"><Settings size={20} /> Settings</button>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-surface lg:bg-background/80 lg:backdrop-blur-md px-6 py-5 border-b border-gray-100 lg:border-none flex items-center justify-between z-20 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-text">Pending Approvals</h1>
            <p className="text-xs text-gray-500 hidden lg:block">Review automated entries from Email Parser and OCR Scanner</p>
          </div>
          {pendingList.length > 0 && (
            <Button onClick={handleApproveAll} className="hidden sm:flex py-2 px-5 rounded-xl text-xs gap-1.5 font-bold shadow-sm bg-success hover:bg-green-600 text-white border-none">
              <CheckCircle size={16} /> Approve All ({pendingList.length})
            </Button>
          )}
        </header>

        {/* CONTENT CONTAINER: (FIX) Dibuat jadi block biasa, hapus flex biar gak nyusut */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 pt-2 pb-28 lg:pb-10 w-full max-w-6xl mx-auto block">
          
          {/* FIX: Tambahin shrink-0 dan h-auto biar kotak putih bebas melar ke bawah */}
          <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden w-full shrink-0 h-auto">
            
            {/* Toolbar */}
            <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center gap-4 justify-between w-full">
              <div className="relative w-full sm:w-80 shrink-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search raw text or merchant..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <button className="p-2.5 border border-gray-200 rounded-xl text-gray-500 bg-white hover:text-primary hover:border-primary flex items-center gap-2 text-xs font-bold shrink-0">
                <Filter size={16} /> <span className="hidden sm:inline">Filter Source</span>
              </button>
            </div>

            {/* List */}
            <div className="flex flex-col w-full">
              {filteredList.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-50 w-full">
                  {filteredList.map((tx) => (
                    <div key={tx.id} className="p-4 sm:p-5 lg:p-6 hover:bg-gray-50/50 transition-colors flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center w-full">
                      
                      {/* Left: Origin & Raw Text */}
                      <div className="w-full lg:w-5/12 flex flex-col gap-3">
                         <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md border", tx.bg, tx.color, tx.bg.replace('bg-', 'border-').replace('100', '200'))}>
                              <tx.sourceIcon size={12}/> {tx.source}
                            </span>
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock size={12}/> {tx.date}</span>
                         </div>
                         
                         <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 relative shadow-xs w-full">
                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-gray-300 rounded-r-md"></div>
                            <p className="text-sm text-gray-600 font-mono pl-3 break-words whitespace-pre-wrap leading-relaxed">
                              "{tx.raw_text}"
                            </p>
                         </div>
                      </div>

                      {/* Middle: AI Parsed Result */}
                      <div className="w-full lg:w-4/12 flex flex-col gap-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                         <div className="flex items-start justify-between w-full gap-2 mb-1">
                           <h4 className="font-bold text-text text-base leading-tight break-words flex-1">{tx.merchant}</h4>
                           {tx.confidence < 80 && (
                             <span title="Low confidence. Please verify!" className="flex items-center bg-yellow-50 p-1 rounded-md shrink-0 mt-0.5">
                               <AlertCircle size={14} className="text-accent" />
                             </span>
                           )}
                         </div>
                         <p className="text-xs text-gray-500 break-words">Category: {tx.category}</p>
                         <h3 className={cn("text-base sm:text-lg font-bold mt-1 break-words", tx.amount > 0 ? "text-success" : "text-text")}>
                           {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                         </h3>
                      </div>

                      {/* Right: Actions */}
                      <div className="w-full lg:w-3/12 flex items-center gap-2 border-t lg:border-t-0 border-gray-50 pt-4 lg:pt-0 mt-2 lg:mt-0">
                         <button onClick={() => handleReject(tx.id)} className="p-3 text-gray-400 hover:text-danger hover:border-red-200 hover:bg-red-50 bg-white border border-gray-200 rounded-xl transition-all shadow-sm shrink-0" title="Reject Transaction">
                           <X size={18} />
                         </button>
                         <button onClick={() => setEditingTx({...tx})} className="p-3 text-gray-400 hover:text-primary hover:border-blue-200 hover:bg-blue-50 bg-white border border-gray-200 rounded-xl transition-all shadow-sm shrink-0" title="Edit Details">
                           <Edit2 size={18} />
                         </button>
                         <Button onClick={() => handleApprove(tx.id)} className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-success hover:bg-green-600 text-white border-none flex items-center justify-center gap-1.5 shadow-sm">
                           <Check size={18} className="shrink-0" /> Approve
                         </Button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-success mb-4 shadow-sm">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="font-bold text-xl text-text mb-2">You're all caught up!</h3>
                  <p className="text-sm text-gray-500 max-w-sm">No pending transactions to review. Automated entries from your bots will appear here.</p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* MODAL EDIT PENDING TRANSACTION */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg"><Edit2 size={18}/></div>
                Edit Transaction
              </h2>
              <button onClick={() => setEditingTx(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Merchant</label>
                <input type="text" value={editingTx.merchant} onChange={(e) => setEditingTx({...editingTx, merchant: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Category</label>
                <select value={editingTx.category} onChange={(e) => setEditingTx({...editingTx, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-all">
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Bills">Bills</option>
                  <option value="Salary">Salary</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Uncategorized">Uncategorized</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount</label>
                <input type="number" value={Math.abs(editingTx.amount)} onChange={(e) => setEditingTx({...editingTx, amount: editingTx.type === 'expense' ? -Math.abs(Number(e.target.value)) : Math.abs(Number(e.target.value))})} className="w-full bg-gray-50 border border-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>

              <div className="mt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingTx(null)} className="flex-1 py-3 rounded-xl border-gray-200 text-gray-600 bg-white font-bold text-sm">Cancel</Button>
                <Button type="submit" className="flex-1 py-3 rounded-xl shadow-sm font-bold text-sm bg-primary text-white flex items-center justify-center gap-2">
                  <Save size={18}/> Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOTTOM NAV (MOBILE) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-gray-100 px-6 py-3 pb-safe z-30 flex justify-between items-center shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        <button className="flex flex-col items-center gap-1 text-gray-400 focus:outline-none"><Home size={24} /><span className="text-[10px] font-semibold">Home</span></button>
        <button className="flex flex-col items-center gap-1 text-gray-400 focus:outline-none"><Receipt size={24} /><span className="text-[10px] font-semibold">History</span></button>
        <div className="relative -top-6">
          <button className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Plus size={28} />
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 text-primary relative focus:outline-none">
          <CheckCircle size={24} />
          {pendingList.length > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span></span>}
          <span className="text-[10px] font-semibold">Pending</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400 focus:outline-none"><User size={24} /><span className="text-[10px] font-semibold">Profile</span></button>
      </nav>

    </div>
  );
};

export default PendingApprovals;