import React, { useState } from "react";
import { 
  CheckCircle,
  Search, Filter, Check, X, Clock, Edit2, AlertCircle, Mail, Scan, Save
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";

// --- MOCK DATA ---
const mockPendingTransactions = [
  { id: 701, source: "Email Parser", sourceIcon: Mail, raw_text: "Pembayaran QRIS Mandiri Rp55.000 ke MCDONALDS", merchant: "McDonald's", category: "Food & Beverage", date: "23 May 2026, 12:30", amount: -55000, type: "expense", confidence: 95, bg: "bg-blue-100", color: "text-blue-600" },
  { id: 702, source: "OCR Scanner", sourceIcon: Scan, raw_text: "TOTAL Rp 150.000 PLN TOKEN", merchant: "PLN (Token Listrik)", category: "Bills", date: "22 May 2026, 09:15", amount: -150000, type: "expense", confidence: 65, bg: "bg-purple-100", color: "text-purple-600" },
  { id: 703, source: "Email Parser", sourceIcon: Mail, raw_text: "Transfer Mandiri Rp1.500.000 dari PT ARTHA IT", merchant: "PT ARTHA IT", category: "Salary", date: "15 May 2026, 10:00", amount: 1500000, type: "income", confidence: 90, bg: "bg-green-100", color: "text-green-600" },
  { id: 704, source: "Email Parser", sourceIcon: Mail, raw_text: "Transfer Mandiri Rp1.600.000 dari PT DANONE", merchant: "PT DANONE", category: "Salary", date: "16 May 2026, 10:00", amount: 1600000, type: "income", confidence: 90, bg: "bg-green-100", color: "text-green-600" },
  { id: 705, source: "Email Parser", sourceIcon: Mail, raw_text: "Transfer Mandiri Rp1.600.000 dari PT DANONE", merchant: "PT DANONE", category: "Salary", date: "16 May 2026, 10:00", amount: 1600000, type: "income", confidence: 90, bg: "bg-green-100", color: "text-green-600" },
  { id: 706, source: "Email Parser", sourceIcon: Mail, raw_text: "Transfer Mandiri Rp1.600.000 dari PT DANONE", merchant: "PT DANONE", category: "Salary", date: "16 May 2026, 10:00", amount: 1600000, type: "income", confidence: 90, bg: "bg-green-100", color: "text-green-600" },
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
    <>
      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* FIX: Outer Wrapper. Di Web (lg) overflow-nya disembunyiin biar kotak luar gak bisa di scroll. Di Mobile tetep scrollable. */}
        <div className="flex-1 p-3 sm:p-6 pt-4 lg:pt-8 pb-28 lg:pb-10 w-full max-w-6xl mx-auto flex flex-col overflow-y-auto lg:overflow-hidden">
          
          {/* ========================================== */}
          {/* MOBILE ONLY (< 640px): Tombol di Luar Kotak */}
          {/* ========================================== */}
          {/* <div className="flex sm:hidden justify-center mb-3 px-1 shrink-0">
            {pendingList.length > 0 && (
              <Button onClick={handleApproveAll} className="w-full flex py-3 px-5 rounded-xl text-xs gap-1.5 font-bold shadow-sm bg-success hover:bg-green-600 text-white border-none justify-center">
                <CheckCircle size={16} /> Approve All ({pendingList.length})
              </Button>
            )}
          </div> */}

          {/* Kotak Putih Utama (Lingkaran Merah Lu) */}
          {/* FIX: Di Web (lg), tinggi dibikin mentok ke bawah (flex-1) dan scrollbar muncul di dalem sini (overflow-y-auto) */}
          <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm flex flex-col w-full shrink-0 h-auto lg:shrink lg:flex-1 lg:min-h-0 overflow-hidden lg:overflow-y-auto relative">
            
            {/* Toolbar */}
            {/* Bonus UX: Di Web, toolbar ini nempel di atas (sticky) biar lu gampang ngetik search pas lagi scroll list */}
            <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center gap-4 justify-between w-full lg:sticky lg:top-0 lg:z-10 bg-surface">
              
              {/* Kiri: Search Bar */}
              <div className="relative w-full sm:w-80 shrink-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search raw text or merchant..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              
              {/* Kanan: Filter & Approve All */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button className="py-2.5 px-4 border border-gray-200 rounded-xl text-gray-500 bg-white hover:text-primary hover:border-primary flex items-center justify-center gap-2 text-xs font-bold w-full sm:w-auto shrink-0 transition-colors">
                  <Filter size={16} /> <span>Filter</span>
                </button>

                {/* DESKTOP ONLY: Tombol di Dalam Kotak */}
                {pendingList.length > 0 && (
                  <Button onClick={handleApproveAll} className="sm:flex w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs gap-1.5 font-bold shadow-sm bg-success hover:bg-green-600 text-white border-none shrink-0 justify-center">
                    <CheckCircle size={16} /> Approve All ({pendingList.length})
                  </Button>
                )}
              </div>

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
    </>
  );
};

export default PendingApprovals;