import { useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, Target,
  PieChart, CheckCircle, Clock, Briefcase, ChevronRight,
  ArrowDownRight, CreditCard, X, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";

// Import State & Services
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { workspaceService } from "@/services/workspaceService";
import { transactionService } from "@/services/transactionService";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(amount));
};

const Dashboard = () => {
  const { workspaces, activeWorkspace, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [workspaceSummary, setWorkspaceSummary] = useState<any>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTransactions, setModalTransactions] = useState<any[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ==========================================
  // 1. FETCH WORKSPACES 
  // ==========================================
  useEffect(() => {
    const fetchInitialWorkspaces = async () => {
      try {
        const wsRes = await workspaceService.getWorkspaces();
        const wsList = wsRes.data?.data || wsRes.data || [];
        
        if (Array.isArray(wsList) && wsList.length > 0) {
          setWorkspaces(wsList);
          setActiveWorkspace(wsList[0]); 
        } else {
          setIsDashboardLoading(false);
        }
      } catch (error) {
        console.error("Error fetch workspaces:", error);
        setIsDashboardLoading(false);
      }
    };
    
    // Cuma fetch kalau global state masih kosong
    if (workspaces.length === 0) {
      fetchInitialWorkspaces();
    }
  }, []); // <-- ARRAY KOSONG, JALAN 1X DOANG

  const currentWorkspaceId = activeWorkspace?.id || activeWorkspace?.ID;

  // ==========================================
  // 2. FETCH TRANSAKSI
  // ==========================================
  useEffect(() => {
    const fetchDashboardTransactions = async () => {
      if (!currentWorkspaceId) return; 

      setIsDashboardLoading(true);
      try {
        const txRes = await transactionService.getHistory(currentWorkspaceId, 1, 5);
        const txList = Array.isArray(txRes.data) ? txRes.data : (Array.isArray(txRes.data?.data) ? txRes.data.data : []);
        
        setRecentTransactions(txList);
      } catch (error) {
      } finally {
        setIsDashboardLoading(false);
      }
    };

    fetchDashboardTransactions();
  }, [currentWorkspaceId]);

  // ==========================================
  // 3. FETCH WORKSPACE SUMMARY
  // ==========================================
  useEffect(() => {
    const fetchSummary = async () => {
      if (!currentWorkspaceId) return;

      setIsSummaryLoading(true);
      try {
        const res = await workspaceService.getSummary(currentWorkspaceId);
        // Sesuaikan dengan struktur JSON dari Golang lu
        const summaryData = res.data?.data || res.data || null;
        setWorkspaceSummary(summaryData);
      } catch (error) {
        console.error("Gagal memuat summary workspace:", error);
      } finally {
        setIsSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [currentWorkspaceId]);

  // ==========================================
  // LOGIC MODAL "SEE ALL"
  // ==========================================
  useEffect(() => {
    const loadModalData = async () => {
      if (isModalOpen && currentWorkspaceId && modalTransactions.length === 0) {
        setIsModalLoading(true);
        try {
          const res = await transactionService.getHistory(currentWorkspaceId, 1, 10);
          
          // Langsung tembak ke key yang bener sesuai JSON lu
          const txList = res.data || [];
          const meta = res.meta;

          setModalTransactions(txList);
          setModalPage(1);
          
          // FIX: Gunakan meta.page sesuai dari Golang
          if (meta) {
            setHasMore(meta.page < meta.total_pages);
          }
        } catch (error) {
          console.error("Gagal memuat semua transaksi:", error);
        } finally {
          setIsModalLoading(false);
        }
      }
    };
    loadModalData();
  }, [isModalOpen, currentWorkspaceId, modalTransactions.length]);

  const handleLoadMore = async () => {
    if (!currentWorkspaceId || !hasMore) return;
    setIsModalLoading(true);
    try {
      const nextPage = modalPage + 1;
      const res = await transactionService.getHistory(currentWorkspaceId, nextPage, 10);
      
      // Langsung tembak ke key yang bener sesuai JSON lu
      const newTx = res.data || [];
      const meta = res.meta;
      
      setModalTransactions(prev => [...prev, ...newTx]);
      setModalPage(nextPage);
      
      // FIX: Gunakan meta.page sesuai dari Golang
      if (meta) {
        setHasMore(meta.page < meta.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Gagal memuat lebih banyak transaksi:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalTransactions([]);
      setModalPage(1);
      setHasMore(true);
    }, 300);
  };

  return (
    <>
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <main className="p-6 max-w-6xl mx-auto w-full flex flex-col gap-6 pb-28 lg:pb-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* CARD 1: TOTAL BALANCE */}
            <div className="bg-primary rounded-3xl p-6 text-white shadow-md relative overflow-hidden xl:col-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
              <h2 className="text-3xl font-bold mb-6">
                {isSummaryLoading ? "Loading..." : formatCurrency(workspaceSummary?.total_balance || 0)}
              </h2>
              
              <div className="flex items-center justify-between border-t border-white/20 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><TrendingDown size={16} /></div>
                  <div>
                    <p className="text-white/70 text-xs">Income</p>
                    <p className="font-semibold text-sm">{isSummaryLoading ? "-" : formatCurrency(workspaceSummary?.total_income || 0)}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><TrendingUp size={16} /></div>
                  <div>
                    <p className="text-white/70 text-xs">Expense</p>
                    <p className="font-semibold text-sm">{isSummaryLoading ? "-" : formatCurrency(workspaceSummary?.total_expense || 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: SAVINGS TARGET */}
            <div className="bg-surface rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center xl:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text">Savings Target</h3>
                    <p className="text-xs text-gray-500">Period: May 2026</p>
                  </div>
                </div>
              </div>

              {/* LOGIC BARU DI SINI */}
              {workspaceSummary?.savings_target > 0 ? (
                <>
                  <div className="flex justify-between items-end mb-2 text-sm font-semibold">
                    <span className="text-text">{formatCurrency(workspaceSummary?.savings_current || 0)}</span>
                    <span className="text-gray-400 text-xs">of {formatCurrency(workspaceSummary?.savings_target || 0)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(Math.round((workspaceSummary.savings_current / workspaceSummary.savings_target) * 100), 100)}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <div className="py-4 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                  <p className="text-xs text-gray-400 mb-2">Belum ada target nabung</p>
                  <button onClick={() => navigate('/workspaces')} className="text-xs font-bold text-primary hover:underline">Set Target</button>
                </div>
              )}
            </div>

            {/* CARD 3: BUDGET LIMIT */}
            <div className="bg-surface rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center xl:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-accent flex items-center justify-center">
                    <PieChart size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text">Budget Limit</h3>
                    <p className="text-xs text-gray-500">Period: May 2026</p>
                  </div>
                </div>
              </div>

              {/* LOGIC BARU DI SINI */}
              {workspaceSummary?.budget_limit > 0 ? (
                <>
                  <div className="flex justify-between items-end mb-2 text-sm font-semibold">
                    <span className="text-text">{formatCurrency(workspaceSummary?.budget_spent || 0)} Spent</span>
                    <span className="text-gray-400 text-xs">Limit {formatCurrency(workspaceSummary?.budget_limit || 0)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(Math.round((workspaceSummary.budget_spent / workspaceSummary.budget_limit) * 100), 100)}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <div className="py-4 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                  <p className="text-xs text-gray-400 mb-2">Belum ada batas budget</p>
                  <button onClick={() => navigate('/workspaces')} className="text-xs font-bold text-accent hover:underline">Set Budget</button>
                </div>
              )}
            </div>

          </div>

          {/* ================= RECENT TRANSACTIONS ================= */}
          <div className="bg-surface rounded-3xl shadow-sm border border-gray-100 p-2 sm:p-6 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
              <h3 className="font-bold text-lg text-text">Recent Transactions</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-primary font-semibold hover:underline disabled:opacity-50"
                disabled={recentTransactions.length === 0}
              >
                See All
              </button>
            </div>

            <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
              <div className="col-span-5">Transaction</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            <div className="flex flex-col flex-1">
              {isDashboardLoading ? (
                <div className="flex flex-1 items-center justify-center text-primary h-full min-h-[150px]">
                  <Loader2 size={32} className="animate-spin" />
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-gray-400 text-sm font-medium h-full min-h-[150px]">
                  No transactions found in this workspace.
                </div>
              ) : (
                recentTransactions.map((trx, idx) => {
                  const txId = trx.id || trx.ID || idx;
                  const txDate = trx.date || trx.created_at || trx.CreatedAt;
                  const isIncome = trx.type?.toLowerCase() === 'income';
                  const isPending = trx.status?.toUpperCase() === 'PENDING';
                  
                  return (
                    <div key={txId} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 sm:px-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors rounded-2xl sm:rounded-none">
                      <div className="col-span-5 flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", isIncome ? "bg-green-100 text-success" : isPending ? "bg-yellow-100 text-yellow-600" : "bg-orange-100 text-orange-600")}>
                          {isIncome ? <TrendingUp size={20}/> : <CreditCard size={20}/>}
                        </div>
                        <div>
                          <h4 className="font-semibold text-text text-sm">{trx.title || trx.merchant || "Transaction"}</h4>
                          <p className="text-xs text-gray-500 sm:hidden">
                            {txDate ? new Date(txDate).toLocaleDateString('id-ID') : '-'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="hidden sm:block col-span-3 text-sm font-medium text-gray-500">
                        {txDate ? new Date(txDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </div>
                      
                      <div className={cn("hidden sm:block col-span-2 text-right font-bold text-sm", isIncome ? "text-success" : "text-text")}>
                        {isIncome ? "+" : "-"}{formatCurrency(trx.amount || 0)}
                      </div>
                      
                      <div className="hidden sm:flex col-span-2 justify-end">
                        {isPending ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-yellow-50 text-accent border border-yellow-200 uppercase"><Clock size={12}/> {trx.status}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-green-50 text-success border border-green-200 uppercase"><CheckCircle size={12}/> {trx.status || "CONFIRMED"}</span>
                        )}
                      </div>

                      <div className="sm:hidden absolute right-8 flex flex-col items-end gap-1">
                        <div className={cn("font-bold text-sm", isIncome ? "text-success" : "text-text")}>
                          {isIncome ? "+" : "-"}{formatCurrency(trx.amount || 0)}
                        </div>
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border uppercase", !isPending ? "bg-green-50 text-success border-green-200" : "bg-yellow-50 text-accent border-yellow-200")}>
                          {trx.status || "CONFIRMED"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ========================================== */}
      {/* MODAL "SEE ALL" TRANSACTIONS               */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          <div className="bg-surface rounded-3xl w-full max-w-lg shadow-2xl flex flex-col relative z-10 max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl shrink-0">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                All Transactions
              </h2>
              <button onClick={closeModal} className="p-2 bg-white hover:bg-gray-100 text-gray-500 rounded-full transition-colors border border-gray-200">
                <X size={18}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <div className="flex flex-col gap-2">
                {modalTransactions.map((tx: any, index: number) => {
                  const txId = tx.id || tx.ID || index;
                  const txDate = tx.date || tx.created_at || tx.CreatedAt;
                  const isIncome = tx.type?.toLowerCase() === 'income';
                  const isPending = tx.status?.toUpperCase() === 'PENDING';

                  return (
                    <div key={`${txId}-${index}`} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", isIncome ? "bg-green-100 text-success" : isPending ? "bg-yellow-100 text-yellow-600" : "bg-orange-100 text-orange-500")}>
                          {isIncome ? <ArrowDownRight size={20} /> : <CreditCard size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-text text-base capitalize">{tx.title || tx.merchant || "Transaction"}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{isIncome ? 'Income' : 'Expense'} • {txDate ? new Date(txDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className={cn("font-bold text-base", isIncome ? "text-success" : "text-text")}>
                          {isIncome ? '+' : '-'}Rp {(tx.amount || 0).toLocaleString('id-ID')}
                        </h4>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 uppercase tracking-wider", isPending ? "bg-yellow-50 text-yellow-600 border-yellow-200" : "bg-green-50 text-success border-green-100")}>
                          {tx.status || "CONFIRMED"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isModalLoading && (
                  <div className="py-6 flex justify-center text-primary">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl shrink-0 flex justify-center">
              {hasMore ? (
                <Button 
                  onClick={handleLoadMore} 
                  disabled={isModalLoading}
                  variant="outline"
                  className="w-full py-3 rounded-xl font-bold text-sm bg-blue-50 text-primary border-blue-100 hover:bg-blue-100"
                >
                  {isModalLoading ? "Loading..." : "Load More"}
                </Button>
              ) : (
                <p className="text-xs text-gray-400 font-medium py-2">You have reached the end of the list.</p>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;