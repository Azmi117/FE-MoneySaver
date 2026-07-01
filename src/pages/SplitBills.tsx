import { useState, useEffect } from "react";
import { 
  CheckCircle, Search, ArrowUpRight, ArrowDownLeft, Check, ShoppingBag, 
  ArrowRight, X, List, Scissors, Receipt
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { workspaceService } from "@/services/workspaceService";
import { debtService } from "@/services/debtService";
import { transactionService } from "@/services/transactionService";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const SplitBills = () => {
  // ==========================================
  // 1. GLOBAL STORE & USER INFO
  // ==========================================
  const workspaceStore: any = useWorkspaceStore();
  const selectedWorkspaceId = 
    workspaceStore?.activeWorkspace?.id || 
    workspaceStore?.activeWorkspace?.ID || 
    workspaceStore?.workspaceId;

  // ✨ FIX: Fallback user ID yang lebih aman untuk case-sensitive GORM/Golang object atau localStorage
  const authStore = useAuthStore();
  const currentUserId = authStore.user?.id || authStore.user?.ID;

  // STATE MANAGEMENT VIEW
  const [view, setView] = useState<"list" | "split_tx" | "assign_items">("list");
  
  // STATE DATA DARI BACKEND
  const [debts, setDebts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<"all" | "owed_to_you" | "you_owe">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // STATE UNTUK ASSIGN ITEMS
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE MODAL GLOBAL OCR
  const [splitWorkspaces, setSplitWorkspaces] = useState<any[]>([]);

  // ==========================================
  // 2. FETCHING DATA (FIX: AUTO-SELECT STATE)
  // ==========================================
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Pake workspaceService
      const resWs = await workspaceService.getWorkspaces();
      let currentSplitWs: any[] = [];
      const wsData = resWs.data || [];

      if (Array.isArray(wsData)) {
        currentSplitWs = wsData.filter((w: any) => {
          const wType = String(w.type || w.Type || "").toLowerCase();
          return wType === "split" || wType === "split_bill";
        });
        setSplitWorkspaces(currentSplitWs);
      }

      const isCurrentValid = currentSplitWs.some(w => String(w.id || w.ID) === String(selectedWorkspaceId));

      if (!isCurrentValid) {
        if (currentSplitWs.length > 0) {
           const defaultSplitWs = currentSplitWs[0]; 
           if (workspaceStore.setActiveWorkspace) {
               workspaceStore.setActiveWorkspace(defaultSplitWs);
               return; 
           }
        } else {
           setDebts([]);
           setTransactions([]);
           setIsLoading(false);
           return;
        }
      }

      // Pake debtService
      const resDebts = await debtService.getWorkspaceDebts(selectedWorkspaceId);
      const debtsData = resDebts.data || [];
      setDebts(Array.isArray(debtsData) ? debtsData : []);

      // Pake workspaceService buat member
      const resMembers = await workspaceService.getMembers(selectedWorkspaceId);
      const membersData = resMembers.data || [];
      setMembers(Array.isArray(membersData) ? membersData : []);

      // Pake transactionService
      const resTx = await transactionService.getHistory(selectedWorkspaceId, 1, 100); // Set limit gede buat nampilin semua dulu
      const txData = resTx.data || [];
      if (Array.isArray(txData)) {
        const expenseTxs = txData.filter((tx: any) => {
          const tType = String(tx.type || tx.Type || "").toLowerCase();
          return tType === "expense";
        });
        setTransactions(expenseTxs);
      }

    } catch (error) {
      console.error("Gagal load data split bill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // fetchData cuma jalan kalau ID user dari authStore udah dapet
    if (currentUserId) {
      fetchData();
    }
  }, [selectedWorkspaceId, view, currentUserId]);

  // ==========================================
  // 3. LOGIC ASSIGN & SPLIT BARIS 
  // ==========================================
  const handleSelectTransaction = async (txId: number) => {
    try {
      const txData = transactions.find(t => (t.id || t.ID) === txId);
      const rawItems = txData?.items || txData?.TransactionItems || [];

      if (txData && rawItems.length > 0) {
        setSelectedTx(txData);
        
        const itemsToAssign = rawItems.map((item: any) => {
          const rowPrice = item.price || item.Price;
          const qty = item.quantity || item.Quantity || 1;
          
          return {
            ...item,
            item_name: item.description || item.Description,
            unit_price: rowPrice / qty, 
            price: rowPrice, 
            user_id: "" 
          };
        });
        
        setBillItems(itemsToAssign);
        setView("assign_items");
      } else {
        alert("Transaksi ini nggak punya detail item/struk cuy! Harus transaksi dari hasil OCR.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses data struk.");
    }
  };

  const handleSplitRow = (index: number) => {
    const items = [...billItems];
    const targetItem = items[index];
    
    if (targetItem.quantity > 1) {
      targetItem.quantity -= 1; 
      targetItem.price = targetItem.unit_price * targetItem.quantity; 

      const newItem = { 
        ...targetItem, 
        quantity: 1, 
        price: targetItem.unit_price * 1, 
        user_id: "" 
      };
      items.splice(index + 1, 0, newItem); 
      setBillItems(items);
    }
  };

  const handleAssignUser = (index: number, userId: number) => {
    const updated = [...billItems];
    updated[index].user_id = userId;
    setBillItems(updated);
  };

  // ==========================================
  // 4. SUBMIT SPLIT BILL KE BACKEND
  // ==========================================
  const handleConfirmSplit = async () => {
    const isAllAssigned = billItems.every(i => i.user_id && i.user_id !== "");
    if (!isAllAssigned) {
      return alert("Masih ada item yang belum lu assign ke orang cuy!");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        transaction_id: selectedTx.id || selectedTx.ID,
        items: billItems.map(i => ({
          item_name: i.item_name,
          quantity: i.quantity,
          price: Math.round(Number(i.unit_price) || Number(i.price / (i.quantity || 1))),
          user_id: Number(i.user_id)
        }))
      };

      // Pake transactionService
      await transactionService.splitBill(payload);
      alert("Mantap! Tagihan berhasil di-split dan utang temen lu udah dicatat.");
      setView("list");
      setSelectedTx(null);
    } catch (error: any) {
      alert(`Gagal nyimpen split bill: ${error.response?.data?.message || "Internal Error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // 5. BAYAR UTANG
  // ==========================================
  const handlePayDebt = async (debtId: number) => {
    if (!window.confirm("Yakin mau tandai lunas?")) return;
    try {
      // Pake debtService
      await debtService.payDebt(debtId);
      setDebts(debts.map(d => d.ID === debtId || d.id === debtId ? { ...d, is_paid: true } : d));
    } catch (error: any) {
      alert(`Gagal bayar: ${error.response?.data?.message || "Error"}`);
    }
  };

  // ==========================================
  // 6. FILTERING LOGIC DEBTS (UPDATED & SECURED)
  // ==========================================
  const mappedDebts = debts.map(d => {
    // ✨ FIX KOPEL GOLANG: Pengecekan ID secara agresif dari flat field hingga nested relational field
    const fromId = d.from_user_id || d.FromUserID || d.fromUserId || d.from_user?.id || d.FromUser?.ID || d.from_user?.ID || d.FromUser?.id;
    const toId = d.to_user_id || d.ToUserID || d.toUserId || d.to_user?.id || d.ToUser?.ID || d.to_user?.ID || d.ToUser?.id;

    const isOwedToYou = Number(toId) === Number(currentUserId);
    const isYouOwe = Number(fromId) === Number(currentUserId);
    
    let type = "other"; 
    if (isOwedToYou) type = "owed_to_you";
    if (isYouOwe) type = "you_owe";

    let displayPersonName = "Unknown";
    const fromName = d.from_user?.name || d.FromUser?.name || "User";
    const toName = d.to_user?.name || d.ToUser?.name || "User";

    // Nampilin nama berdasarkan posisi login agar kontekstual
    if (isOwedToYou) displayPersonName = fromName; // Kalau utang ke gua, tampilin nama si peminjam
    else if (isYouOwe) displayPersonName = toName;   // Kalau gua utang ke orang, tampilin nama tempat gua ngutang (nama lu)
    else displayPersonName = `${fromName} → ${toName}`; 

    return {
      ...d,
      uiType: type,
      personName: displayPersonName
    };
  });

  const filteredDebts = mappedDebts.filter(debt => {
    // Utang milik orang lain di dalam workspace yang sama disembunyikan sesuai request lu
    if (debt.uiType === "other") return false;

    const matchesSearch = (debt.personName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (debt.note || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || debt.uiType === activeTab;
    
    const isUnpaid = !debt.is_paid; 
    
    return matchesSearch && matchesTab && isUnpaid;
  });

  const totalOwedToYou = mappedDebts.filter(d => d.uiType === "owed_to_you" && !d.is_paid).reduce((sum, d) => sum + d.amount, 0);
  const totalYouOwe = mappedDebts.filter(d => d.uiType === "you_owe" && !d.is_paid).reduce((sum, d) => sum + d.amount, 0);

  return (
    <>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER TOOLBAR */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="w-full sm:w-auto relative">
            <select 
              value={selectedWorkspaceId || ""}
              onChange={(e) => {
                const targetId = Number(e.target.value);
                const selectedWs = splitWorkspaces.find((w: any) => (w.id || w.ID) === targetId);
                if (selectedWs && workspaceStore.setActiveWorkspace) {
                  workspaceStore.setActiveWorkspace(selectedWs);
                }
              }}
              className="w-full sm:w-64 bg-white border border-gray-200 text-sm font-bold text-primary rounded-xl pl-4 pr-10 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer shadow-sm"
            >
              <option value="" disabled>Pilih Workspace Patungan...</option>
              {splitWorkspaces.map(ws => (
                <option key={ws.id || ws.ID} value={ws.id || ws.ID}>
                  💸 {ws.name || ws.Name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-2 h-2 border-r-2 border-b-2 border-primary transform rotate-45"></div>
          </div>

          {/* TOMBOL ACTION KANAN */}
          <div className="w-full sm:w-auto flex items-center justify-end">
            {view === "list" && (
              <Button onClick={() => setView("split_tx")} className="py-2.5 sm:py-2 px-4 rounded-xl text-xs gap-1.5 font-bold shadow-sm w-full sm:w-auto justify-center">
                <List size={16} /> <span className="hidden sm:inline">Select Transaction</span>
              </Button>
            )}
            
            {(view === "split_tx" || view === "assign_items") && (
              <Button variant="outline" onClick={() => setView("list")} className="text-xs py-2 px-4 rounded-xl bg-white border-gray-200 gap-2 w-full sm:w-auto justify-center">
                 <X size={16}/> Cancel
              </Button>
            )}
          </div>

        </div>

        {/* CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6 pb-28 lg:pb-10 w-full max-w-6xl mx-auto flex flex-col gap-6">
          
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

              {/* DEBT LIST CONTAINER */}
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
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20"><p className="text-sm text-gray-400 font-bold animate-pulse">Fetching debts...</p></div>
                  ) : filteredDebts.length > 0 ? (
                    <div className="flex flex-col divide-y divide-gray-50">
                      {filteredDebts.map((debt) => (
                        <div key={debt.ID || debt.id} className="flex lg:grid lg:grid-cols-12 gap-4 items-center p-4 lg:px-8 hover:bg-gray-50/50 transition-colors">
                          <div className="flex-1 lg:col-span-5 flex items-center gap-3 sm:gap-4 min-w-0">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(debt.personName || "User")}&background=f0f4ff&color=0066cc&bold=true`} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-100 shrink-0" />
                            <div className="min-w-0">
                              <h4 className="font-bold text-text text-sm truncate">{debt.personName}</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">{debt.note}</p>
                            </div>
                          </div>
                          <div className="hidden lg:flex col-span-2 items-center text-sm text-gray-500">
                            {new Date(debt.created_at || debt.CreatedAt).toLocaleDateString()}
                          </div>
                          <div className={cn("hidden lg:block col-span-2 text-right font-bold text-sm", debt.uiType === "owed_to_you" ? "text-success" : "text-danger")}>
                            {formatCurrency(debt.amount)}
                          </div>
                          <div className="hidden lg:flex col-span-3 justify-end items-center gap-3">
                            {debt.uiType === "you_owe" ? (
                              <Button onClick={() => handlePayDebt(debt.ID || debt.id)} variant="outline" className="text-xs py-1.5 px-4 rounded-lg font-bold border gap-1.5 bg-white shadow-sm text-danger border-red-200 hover:bg-danger hover:text-white hover:border-danger">
                                <Check size={14} /> Settle Up
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium italic">Waiting for payment...</span>
                            )}
                          </div>

                          {/* Mobile Layout */}
                          <div className="lg:hidden flex flex-col items-end gap-1.5 shrink-0 pl-2">
                            <div className={cn("font-bold text-sm text-right", debt.uiType === "owed_to_you" ? "text-success" : "text-danger")}>
                              {formatCurrency(debt.amount)}
                            </div>
                            {debt.uiType === "you_owe" ? (
                              <button onClick={() => handlePayDebt(debt.ID || debt.id)} className="text-[9px] font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1 bg-red-50 text-danger border border-red-200">Settle Up</button>
                            ) : (
                              <span className="text-[9px] text-gray-400 font-medium">Pending</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <h3 className="font-bold text-text mb-1">No active debts found</h3>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ======================= VIEW: SPLIT BILL (SELECT TX) ======================= */}
          {view === "split_tx" && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
              <div className="bg-blue-50 text-primary p-4 rounded-xl text-sm font-bold border border-blue-100 flex items-center gap-2">
                <ShoppingBag size={18}/> Step 1: Select an expense transaction to split.
              </div>
              <div className="grid grid-cols-1 gap-3">
                 {transactions.length === 0 ? (
                   <p className="text-center py-10 text-gray-400 font-medium">Belum ada transaksi pengeluaran bulan ini cuy.</p>
                 ) : transactions.map((tx) => (
                   <div key={tx.id || tx.ID} onClick={() => handleSelectTransaction(tx.id || tx.ID)} className="p-5 bg-surface border border-gray-100 rounded-2xl shadow-xs hover:border-primary cursor-pointer flex items-center justify-between transition-all group">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center"><Receipt size={22}/></div>
                       <div>
                         <h4 className="font-bold text-text text-sm group-hover:text-primary transition-colors">{tx.merchant || tx.Merchant}</h4>
                         <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.date || tx.Date).toLocaleDateString()}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="font-bold text-sm text-text">{formatCurrency(tx.amount || tx.Amount)}</span>
                       <ArrowRight size={18} className="text-gray-300 group-hover:text-primary transition-colors"/>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* ======================= VIEW: SPLIT BILL (ASSIGN ITEMS) ======================= */}
          {view === "assign_items" && selectedTx && (
            <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
              <div className="p-5 sm:p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] bg-blue-100 text-primary font-bold px-2.5 py-0.5 rounded-full">TX ID: #{selectedTx.id || selectedTx.ID}</span>
                  <h3 className="font-bold text-text text-base mt-1.5">{selectedTx.merchant || selectedTx.Merchant}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium">Receipt Total</p>
                  <p className="font-bold text-lg text-primary">{formatCurrency(selectedTx.amount || selectedTx.Amount)}</p>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col overflow-x-auto">
                <div className="min-w-[700px] flex flex-col divide-y divide-gray-100">
                  <div className="grid grid-cols-12 gap-4 px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/20">
                    <div className="col-span-5">Item Name</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-4 text-center">Who Pays?</div>
                  </div>
                  
                  {billItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50/30 transition-colors">
                      <div className="col-span-5 text-sm font-semibold text-text truncate" title={item.item_name}>
                        {item.item_name}
                      </div>
                      
                      <div className="col-span-1 flex flex-col items-center gap-1">
                        <span className="text-sm font-black text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{item.quantity}x</span>
                        {item.quantity > 1 && (
                          <button onClick={() => handleSplitRow(idx)} className="text-[10px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-blue-100">
                            <Scissors size={10}/> Split
                          </button>
                        )}
                      </div>
                      
                      <div className="col-span-2 text-right text-sm font-bold text-gray-500">
                        {formatCurrency(item.unit_price)}
                      </div>
                      
                      <div className="col-span-4 flex justify-center">
                         <div className="relative w-full max-w-[200px]">
                           <select
                             value={item.user_id || ""}
                             onChange={(e) => handleAssignUser(idx, Number(e.target.value))}
                             className="w-full bg-white border border-gray-200 text-xs font-bold text-text rounded-lg pl-3 pr-8 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                           >
                             <option value="" disabled>Pilih yg bayar</option>
                             {members.map(m => {
                               const userId = m.user_id || m.UserID || m.id || m.ID;
                               const userName = m.name || m.user?.name || m.User?.name || "Unknown";
                               return (
                                 <option key={userId} value={userId}>
                                   {userName}
                                 </option>
                               );
                             })}
                           </select>
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm w-full overflow-x-auto pb-2 sm:pb-0">
                   {members.filter(m => {
                     const mId = m.user_id || m.UserID || m.id || m.ID;
                     return billItems.some(i => i.user_id === mId);
                   }).map(m => {
                     const mId = m.user_id || m.UserID || m.id || m.ID;
                     const totalMember = billItems
                       .filter(i => i.user_id === mId)
                       .reduce((sum, i) => sum + i.price, 0);
                       
                     return (
                       <div key={mId} className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm shrink-0">
                         <span className="text-[10px] text-gray-400 font-bold uppercase block">{m.name || m.user?.name || m.User?.name}</span>
                         <p className="font-black text-text text-sm">{formatCurrency(totalMember)}</p>
                       </div>
                     );
                   })}
                </div>
                <Button onClick={handleConfirmSplit} disabled={isSubmitting} className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs shadow-sm bg-success hover:bg-green-600 border-none text-white shrink-0">
                  {isSubmitting ? "Processing..." : <><Check size={16}/> Confirm & Split Bill</>}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default SplitBills;