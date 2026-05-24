import { useState, useEffect, useRef } from "react";
import { 
  CheckCircle,Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, Check, ShoppingBag, 
  ArrowRight, X, List, Camera, UploadCloud, FileText,
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";

// --- MOCK DATA (Simulasi response dari GET /debts) ---
const mockDebts = [
  { id: 101, type: "owed_to_you", person: "Kenny Hoi", description: "Split: Indomaret Kosan", amount: 14500, date: "23 May 2026", status: "unpaid", workspace: "Kosan Patungan" },
  { id: 102, type: "you_owe", person: "Zaki Ananda", description: "Patungan Listrik", amount: 150000, date: "20 May 2026", status: "unpaid", workspace: "Kosan Patungan" },
  { id: 103, type: "owed_to_you", person: "Rizky F.", description: "Split: Starbucks Coffee", amount: 55000, date: "22 May 2026", status: "paid", workspace: "Personal Workspace" },
];

// --- MOCK DATA (Simulasi GET /transactions?unsplit=true) ---
const availableTransactions = [
  { id: 522, merchant: "Indomaret Kosan", total: 38000, date: "23 May 2026", itemsCount: 4 },
  { id: 523, merchant: "Starbucks Coffee", total: 105000, date: "22 May 2026", itemsCount: 3 },
];

const mockBillItems = [
  { item_name: "FINNA ULEG SAMBAL UDANG 10`SX15G/10", quantity: 1, price: 15500, user_id: 1 },
  { item_name: "FINNA ULEG SAMBAL BAWANG 10`SX20G/10", quantity: 1, price: 14500, user_id: 5 },
  { item_name: "WALL'S PADLE POP 55ML LEMON TEA/36", quantity: 1, price: 3000, user_id: 1 },
  { item_name: "WALLS 57ML COOKIES & CREAM/42", quantity: 1, price: 5000, user_id: 5 },
];

const workspaceMembers = [
  { id: 1, name: "Azmi K." },
  { id: 5, name: "Kenny Hoi" },
  { id: 3, name: "Zaki Ananda" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const SplitBills = () => {
  // STATE MANAGEMENT VIEW SPLIT BILL
  const [view, setView] = useState<"list" | "split_tx" | "assign_items">("list");
  
  // State for Debt List
  const [debts, setDebts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "owed_to_you" | "you_owe">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State for Split Bill Flow
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const [billItems, setBillItems] = useState(mockBillItems);

  // STATE MODAL GLOBAL OCR (Dari FAB Bawah)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "ocr">("manual");
  const [ocrMethod, setOcrMethod] = useState<"hybrid" | "alt">("hybrid");
  const [ocrState, setOcrState] = useState<"upload" | "scanning" | "review">("upload");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MOCK FETCH DEBTS (Simulasi GET /debts)
  useEffect(() => {
    const fetchDebts = async () => {
      setIsLoading(true);
      setTimeout(() => {
        setDebts(mockDebts);
        setIsLoading(false);
      }, 500);
    };
    fetchDebts();
  }, []);

  // HANDLER: PAY DEBT
  const handlePayDebt = async (debtId: number) => {
    setTimeout(() => {
      setDebts(debts.map(d => d.id === debtId ? { ...d, status: "paid" } : d));
      alert("Debt marked as paid successfully!");
    }, 300);
  };

  // HANDLER: CONFIRM SPLIT
  const handleConfirmSplit = async () => {
    setTimeout(() => {
      alert("Bill successfully split! Records added to database.");
      setView("list");
      setSelectedTxId(null);
    }, 500);
  };

  const handleAssignUser = (index: number, userId: number) => {
    const updated = [...billItems];
    updated[index].user_id = userId;
    setBillItems(updated);
  };

  // Filter Logic
  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.person.toLowerCase().includes(searchQuery.toLowerCase()) || debt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || debt.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalOwedToYou = debts.filter(d => d.type === "owed_to_you" && d.status === "unpaid").reduce((sum, d) => sum + d.amount, 0);
  const totalYouOwe = debts.filter(d => d.type === "you_owe" && d.status === "unpaid").reduce((sum, d) => sum + d.amount, 0);

  return (
    <>
      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-surface lg:bg-background/80 lg:backdrop-blur-md px-6 py-5 border-b border-gray-100 lg:border-none flex items-center justify-between z-20">
          <div>
            <h1 className="text-2xl font-bold text-text">
              {view === "list" ? "Split Bills & Debts" : "Itemized Split Bill"}
            </h1>
            <p className="text-xs text-gray-500 hidden lg:block">
              {view === "list" ? "Track who owes you and what you owe others" : "Assign transaction items to specific members"}
            </p>
          </div>
          
          {view === "list" && (
            // TOMBOL INI KHUSUS BUAT SELECT TRANSACTION (SPLIT BILL)
            <Button onClick={() => setView("split_tx")} className="py-2 px-3 sm:px-4 rounded-xl text-xs gap-1.5 font-bold shadow-sm">
              <List size={16} /> <span className="hidden sm:inline">Select Transaction</span>
            </Button>
          )}
          
          {(view === "split_tx" || view === "assign_items") && (
            <Button variant="outline" onClick={() => setView("list")} className="text-xs py-2 px-4 rounded-xl bg-white border-gray-200 gap-2">
               <X size={16}/> Cancel
            </Button>
          )}
        </header>

        {/* CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 pb-28 lg:pb-10 w-full max-w-6xl mx-auto flex flex-col gap-6">
          
          {/* ======================= VIEW: DEBT LIST ======================= */}
          {view === "list" && (
            <>
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-success flex items-center justify-center shrink-0"><ArrowDownLeft size={24} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Owed to You</p>
                    <h3 className="text-2xl font-bold text-text">{formatCurrency(totalOwedToYou)}</h3>
                  </div>
                </div>
                
                <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-danger flex items-center justify-center shrink-0"><ArrowUpRight size={24} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">You Owe</p>
                    <h3 className="text-2xl font-bold text-text">{formatCurrency(totalYouOwe)}</h3>
                  </div>
                </div>
              </div>

              {/* LIST CONTAINER */}
              <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm flex flex-col flex-1">
                <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100 w-full sm:w-auto overflow-x-auto">
                    <button onClick={() => setActiveTab("all")} className={cn("flex-1 sm:flex-none px-4 py-2 text-xs font-bold capitalize rounded-lg transition-all", activeTab === "all" ? "bg-white text-primary shadow-sm ring-1 ring-gray-200/50" : "text-gray-500 hover:text-text")}>All Debts</button>
                    <button onClick={() => setActiveTab("owed_to_you")} className={cn("flex-1 sm:flex-none px-4 py-2 text-xs font-bold capitalize rounded-lg transition-all", activeTab === "owed_to_you" ? "bg-white text-success shadow-sm ring-1 ring-gray-200/50" : "text-gray-500 hover:text-text")}>Owed to You</button>
                    <button onClick={() => setActiveTab("you_owe")} className={cn("flex-1 sm:flex-none px-4 py-2 text-xs font-bold capitalize rounded-lg transition-all", activeTab === "you_owe" ? "bg-white text-danger shadow-sm ring-1 ring-gray-200/50" : "text-gray-500 hover:text-text")}>You Owe</button>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Search person..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-200 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-xl text-gray-500 bg-white hover:text-primary hover:border-primary shrink-0"><Filter size={18} /></button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20"><p className="text-sm text-gray-400 font-bold animate-pulse">Fetching debts...</p></div>
                  ) : filteredDebts.length > 0 ? (
                    <div className="flex flex-col divide-y divide-gray-50">
                      {filteredDebts.map((debt) => (
                        <div key={debt.id} className="flex lg:grid lg:grid-cols-12 gap-4 items-center p-4 lg:px-8 hover:bg-gray-50/50 transition-colors">
                          <div className="flex-1 lg:col-span-5 flex items-center gap-3 sm:gap-4 min-w-0">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(debt.person)}&background=f0f4ff&color=0066cc&bold=true`} alt={debt.person} className="w-10 h-10 rounded-full border border-gray-100 shrink-0" />
                            <div className="min-w-0">
                              <h4 className="font-bold text-text text-sm truncate">{debt.person}</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">{debt.description}</p>
                            </div>
                          </div>
                          <div className="hidden lg:flex col-span-2 items-center text-sm text-gray-500">{debt.date}</div>
                          <div className={cn("hidden lg:block col-span-2 text-right font-bold text-sm", debt.type === "owed_to_you" ? "text-success" : "text-danger")}>{formatCurrency(debt.amount)}</div>
                          <div className="hidden lg:flex col-span-3 justify-end items-center gap-3">
                             {debt.status === "paid" ? (
                               <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 border border-gray-200"><CheckCircle size={14}/> SETTLED</span>
                             ) : (
                               <Button onClick={() => handlePayDebt(debt.id)} variant="outline" className={cn("text-xs py-1.5 px-4 rounded-lg font-bold border gap-1.5 bg-white shadow-sm hover:text-white", debt.type === "owed_to_you" ? "text-success border-green-200 hover:bg-success hover:border-success" : "text-danger border-red-200 hover:bg-danger hover:border-danger")}><Check size={14} /> Mark as Paid</Button>
                             )}
                          </div>
                          {/* Mobile Layout */}
                          <div className="lg:hidden flex flex-col items-end gap-1.5 shrink-0 pl-2">
                            <div className={cn("font-bold text-sm text-right", debt.type === "owed_to_you" ? "text-success" : "text-danger")}>{formatCurrency(debt.amount)}</div>
                            {debt.status === "paid" ? (
                               <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200"><CheckCircle size={10}/> SETTLED</span>
                            ) : (
                              <button onClick={() => handlePayDebt(debt.id)} className={cn("text-[9px] font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1", debt.type === "owed_to_you" ? "bg-green-50 text-success border border-green-200" : "bg-red-50 text-danger border border-red-200")}>Settle Up</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center"><div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4"><CheckCircle size={32} /></div><h3 className="font-bold text-text mb-1">No active debts found</h3></div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ======================= VIEW: SPLIT BILL (SELECT TX) ======================= */}
          {view === "split_tx" && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
              <div className="bg-blue-50 text-primary p-4 rounded-xl text-sm font-bold border border-blue-100">Step 1: Select a confirmed transaction to split from the database.</div>
              <div className="grid grid-cols-1 gap-3">
                 {availableTransactions.map((tx) => (
                   <div key={tx.id} onClick={() => { setSelectedTxId(tx.id); setView("assign_items"); }} className="p-5 bg-surface border border-gray-100 rounded-2xl shadow-xs hover:border-primary cursor-pointer flex items-center justify-between transition-all group">
                     <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center"><ShoppingBag size={22}/></div><div><h4 className="font-bold text-text text-sm group-hover:text-primary transition-colors">{tx.merchant}</h4><p className="text-xs text-gray-500 mt-0.5">{tx.date} • {tx.itemsCount} items</p></div></div>
                     <div className="flex items-center gap-4"><span className="font-bold text-sm text-text">{formatCurrency(tx.total)}</span><ArrowRight size={18} className="text-gray-300 group-hover:text-primary transition-colors"/></div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* ======================= VIEW: SPLIT BILL (ASSIGN ITEMS) ======================= */}
          {view === "assign_items" && (
            <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
              <div className="p-5 sm:p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between"><div><span className="text-[10px] bg-blue-100 text-primary font-bold px-2.5 py-0.5 rounded-full">TX ID: #{selectedTxId}</span><h3 className="font-bold text-text text-base mt-1.5">Indomaret Kosan</h3></div><div className="text-right"><p className="text-xs text-gray-400 font-medium">Receipt Total</p><p className="font-bold text-lg text-primary">{formatCurrency(38000)}</p></div></div>
              <div className="flex-1 flex flex-col overflow-x-auto">
                <div className="min-w-[600px] flex flex-col divide-y divide-gray-100">
                  <div className="grid grid-cols-12 gap-4 px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/20"><div className="col-span-6">Item Name</div><div className="col-span-1 text-center">Qty</div><div className="col-span-2 text-right">Price</div><div className="col-span-3 text-center">Who Pays?</div></div>
                  {billItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50/30 transition-colors">
                      <div className="col-span-6 text-sm font-semibold text-text truncate" title={item.item_name}>{item.item_name}</div>
                      <div className="col-span-1 text-center text-sm font-medium text-gray-500">{item.quantity}x</div>
                      <div className="col-span-2 text-right text-sm font-bold text-text">{formatCurrency(item.price)}</div>
                      <div className="col-span-3 flex justify-center">
                         <div className="relative w-full max-w-[150px]">
                           <select value={item.user_id} onChange={(e) => handleAssignUser(idx, Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-primary focus:bg-white appearance-none cursor-pointer text-text">
                             {workspaceMembers.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                           </select>
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                   <div><span className="text-xs text-gray-400 font-medium">Azmi K. Total:</span><p className="font-bold text-text text-base">{formatCurrency(billItems.filter(i=>i.user_id===1).reduce((s,i)=>s+i.price, 0))}</p></div>
                   <div className="border-l border-gray-200 h-8 hidden sm:block"></div>
                   <div><span className="text-xs text-gray-400 font-medium">Kenny H. Total:</span><p className="font-bold text-text text-base">{formatCurrency(billItems.filter(i=>i.user_id===5).reduce((s,i)=>s+i.price, 0))}</p></div>
                </div>
                <Button onClick={handleConfirmSplit} className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs shadow-sm bg-success hover:bg-green-600 border-none text-white flex items-center justify-center gap-1.5"><Check size={16}/> Confirm & Split Bill</Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= MODAL GLOBAL OCR (DARI FAB) ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-text flex items-center gap-2"><div className="p-1.5 bg-primary/10 text-primary rounded-lg"><Plus size={18}/></div>Add New Record</h2>
              <button onClick={() => {setShowAddModal(false); setOcrState("upload"); setReceiptFile(null);}} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"><X size={18}/></button>
            </div>
            
            {ocrState === "upload" && (
              <div className="px-6 pt-5">
                <div className="flex bg-gray-100 p-1 rounded-xl w-full relative">
                  <button onClick={() => setAddMode("manual")} className={cn("flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all z-10", addMode === "manual" ? "bg-white text-primary shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-text")}><FileText size={16} /> Manual Entry</button>
                  <button onClick={() => setAddMode("ocr")} className={cn("flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all z-10", addMode === "ocr" ? "bg-white text-primary shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-text")}><Camera size={16} /> Scan Receipt</button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {addMode === "manual" ? (
                <div className="text-center py-10 text-sm text-gray-400">Manual form logic here (sama kaya Transactions.tsx)</div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[350px] w-full">
                   {ocrState === "upload" && (
                     <>
                       <div className="flex bg-gray-100 p-1 rounded-xl w-full mb-6">
                          <button onClick={() => setOcrMethod("hybrid")} className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", ocrMethod === "hybrid" ? "bg-white shadow-sm text-primary" : "text-gray-500")}>Hybrid Engine</button>
                          <button onClick={() => setOcrMethod("alt")} className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", ocrMethod === "alt" ? "bg-white shadow-sm text-primary" : "text-gray-500")}>OCR Space (Alt)</button>
                       </div>
                       <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                       {!receiptFile ? (
                         <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-primary/40 bg-blue-50/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-50/60 transition-all text-center">
                           <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-primary"><UploadCloud size={28} /></div>
                           <p className="text-xs text-gray-500">Upload receipt image</p>
                         </div>
                       ) : (
                         <div className="w-full border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-4 bg-gray-50">
                            <div className="text-center"><h4 className="font-bold text-text text-sm truncate max-w-[200px]">{receiptFile.name}</h4></div>
                            <button onClick={() => setReceiptFile(null)} className="text-xs font-bold text-danger hover:underline">Remove file</button>
                         </div>
                       )}
                     </>
                   )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-3xl">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2.5 px-6 rounded-xl bg-white border-gray-200">Cancel</Button>
              <Button onClick={() => setOcrState("scanning")} className="text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm">Scan & Analyze</Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default SplitBills;