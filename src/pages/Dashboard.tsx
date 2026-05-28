import React, { useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, Target,
  PieChart, Plus, Coffee, ShoppingCart, Zap, 
  CheckCircle, Clock, Briefcase,
  ArrowDownRight, CreditCard, X, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";

// Dummy Data untuk Transaksi Dashboard
const recentTransactions = [
  { id: 1, entity: "Starbucks Coffee", category: "Food & Beverage", date: "22 May 2026", amount: -45000, status: "CONFIRMED", icon: Coffee, bg: "bg-orange-100", color: "text-orange-600" },
  { id: 2, entity: "Monthly Groceries", category: "Shopping", date: "20 May 2026", amount: -250000, status: "CONFIRMED", icon: ShoppingCart, bg: "bg-blue-100", color: "text-blue-600" },
  { id: 3, entity: "Electricity Bill", category: "Bills", date: "18 May 2026", amount: -150000, status: "PENDING", icon: Zap, bg: "bg-yellow-100", color: "text-yellow-600" },
  { id: 4, entity: "Freelance Project", category: "Income", date: "15 May 2026", amount: 1500000, status: "CONFIRMED", icon: TrendingUp, bg: "bg-green-100", color: "text-success" },
];

// Dummy Data untuk Modal "See All" (Simulasi Load More)
const dummyTransactionsModal = [
  { id: 508, date: "2026-05-15", type: "expense", method: "Telegram", note: "Input via Telegram", merchant: "Telegram Bot", amount: 8000, status: "APPROVED" },
  { id: 503, date: "2026-05-14", type: "expense", method: "QRIS", note: "Afternoon coffee", merchant: "Starbucks Coffee", amount: 45000, status: "APPROVED" },
  { id: 505, date: "2026-05-14", type: "expense", method: "QRIS", note: "Monthly Groceries", merchant: "Monthly Groceries", amount: 250000, status: "APPROVED" },
  { id: 507, date: "2026-05-14", type: "expense", method: "QRIS", note: "Electricity", merchant: "Electricity Bill", amount: 150000, status: "PENDING" },
  { id: 498, date: "2026-05-12", type: "income", method: "Telegram", note: "Freelance", merchant: "Freelance Project", amount: 1500000, status: "APPROVED" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const Dashboard = () => {
  // ==========================================
  // STATE & LOGIC UNTUK MODAL "SEE ALL"
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isModalOpen && transactions.length === 0) {
      setTransactions(dummyTransactionsModal.slice(0, 3)); // Load awal 3 data
    }
  }, [isModalOpen]);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTransactions(prev => [...prev, ...dummyTransactionsModal.slice(3)]);
      setHasMore(false); // Data habis
      setIsLoading(false);
    }, 1000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setTransactions([]);
      setHasMore(true);
    }, 300);
  };

  return (
    <>
      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">

        {/* DASHBOARD CONTENT */}
        <main className="p-6 max-w-6xl mx-auto w-full flex flex-col gap-6 pb-28 lg:pb-10">
          
          {/* TOP CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-primary rounded-3xl p-6 text-white shadow-md relative overflow-hidden xl:col-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
              <h2 className="text-3xl font-bold mb-6">{formatCurrency(12500000)}</h2>
              
              <div className="flex items-center justify-between border-t border-white/20 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><TrendingDown size={16} /></div>
                  <div><p className="text-white/70 text-xs">Income</p><p className="font-semibold text-sm">{formatCurrency(15000000)}</p></div>
                </div>
                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><TrendingUp size={16} /></div>
                  <div><p className="text-white/70 text-xs">Expense</p><p className="font-semibold text-sm">{formatCurrency(2500000)}</p></div>
                </div>
              </div>
            </div>

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
                <span className="text-sm font-bold text-primary">45%</span>
              </div>
              <div className="flex justify-between items-end mb-2 text-sm font-semibold">
                <span className="text-text">{formatCurrency(4500000)}</span>
                <span className="text-gray-400 text-xs">of {formatCurrency(10000000)}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500 w-[45%]"></div>
              </div>
            </div>

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
                <span className="text-sm font-bold text-accent">62%</span>
              </div>
              <div className="flex justify-between items-end mb-2 text-sm font-semibold">
                <span className="text-text">{formatCurrency(3100000)} Spent</span>
                <span className="text-gray-400 text-xs">Limit {formatCurrency(5000000)}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500 w-[62%]"></div>
              </div>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-surface rounded-3xl shadow-sm border border-gray-100 p-2 sm:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
              <h3 className="font-bold text-lg text-text">Recent Transactions</h3>
              {/* TRIGGER MODAL SEE ALL */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-primary font-semibold hover:underline"
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

            <div className="flex flex-col">
              {recentTransactions.map((trx) => (
                <div key={trx.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 sm:px-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors rounded-2xl sm:rounded-none">
                  <div className="col-span-5 flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", trx.bg, trx.color)}>
                      <trx.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text text-sm">{trx.entity}</h4>
                      <p className="text-xs text-gray-500 sm:hidden">{trx.date}</p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block col-span-3 text-sm font-medium text-gray-500">{trx.date}</div>
                  
                  <div className={cn("hidden sm:block col-span-2 text-right font-bold text-sm", trx.amount > 0 ? "text-success" : "text-text")}>
                    {trx.amount > 0 ? "+" : ""}{formatCurrency(trx.amount)}
                  </div>
                  
                  <div className="hidden sm:flex col-span-2 justify-end">
                    {trx.status === "PENDING" ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-yellow-50 text-accent border border-yellow-200"><Clock size={12}/> PENDING</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-green-50 text-success border border-green-200"><CheckCircle size={12}/> CONFIRMED</span>
                    )}
                  </div>

                  <div className="sm:hidden absolute right-8 flex flex-col items-end gap-1">
                    <div className={cn("font-bold text-sm", trx.amount > 0 ? "text-success" : "text-text")}>
                      {trx.amount > 0 ? "+" : ""}{formatCurrency(trx.amount)}
                    </div>
                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border", trx.status === "CONFIRMED" ? "bg-green-50 text-success border-green-200" : "bg-yellow-50 text-accent border-yellow-200")}>
                      {trx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- WORKSPACES WIDGET START --- */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold text-text">Your Workspaces</h2>
              <Link to="/workspaces" className="text-sm font-bold text-primary hover:underline">Manage</Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              
              <div className="bg-primary text-white p-5 rounded-3xl min-w-[150px] flex-shrink-0 shadow-md relative overflow-hidden cursor-pointer hover:bg-blue-600 transition-colors">
                <div className="absolute -right-4 -bottom-4 opacity-20"><Briefcase size={72}/></div>
                <h3 className="font-bold text-lg relative z-10">Personal</h3>
                <p className="text-xs text-blue-100 mt-1 relative z-10">Default</p>
              </div>
              
              <div className="bg-surface border border-gray-200 p-5 rounded-3xl min-w-[150px] flex-shrink-0 shadow-sm group hover:border-primary transition-colors cursor-pointer">
                <h3 className="font-bold text-lg text-text group-hover:text-primary transition-colors">🏠 Kosan</h3>
                <p className="text-xs text-gray-500 mt-1">4 Members</p>
              </div>

              <div className="bg-surface border border-gray-200 p-5 rounded-3xl min-w-[150px] flex-shrink-0 shadow-sm group hover:border-primary transition-colors cursor-pointer">
                <h3 className="font-bold text-lg text-text group-hover:text-primary transition-colors">✈️ Liburan</h3>
                <p className="text-xs text-gray-500 mt-1">6 Members</p>
              </div>

              <Link to="/workspaces" className="bg-blue-50/50 border-2 border-dashed border-blue-200 p-5 rounded-3xl min-w-[150px] flex-shrink-0 flex flex-col items-center justify-center text-primary hover:bg-blue-100 transition-colors">
                <Plus size={28} className="mb-2"/>
                <span className="text-xs font-bold">New Workspace</span>
              </Link>

            </div>
          </div>
          {/* --- WORKSPACES WIDGET END --- */}

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
                {transactions.map((tx: any, index: number) => (
                  <div key={`${tx.id}-${index}`} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", tx.type === 'income' ? "bg-green-100 text-success" : tx.status === 'PENDING' ? "bg-yellow-100 text-yellow-600" : "bg-orange-100 text-orange-500")}>
                        {tx.type === 'income' ? <ArrowDownRight size={20} /> : <CreditCard size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-text text-base capitalize">{tx.merchant}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{tx.type === 'income' ? 'Income' : 'Expense'} • {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h4 className={cn("font-bold text-base", tx.type === 'income' ? "text-success" : "text-text")}>
                        {tx.type === 'income' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                      </h4>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 uppercase tracking-wider", tx.status === 'PENDING' ? "bg-yellow-50 text-yellow-600 border-yellow-200" : "bg-green-50 text-success border-green-100")}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
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
                  disabled={isLoading}
                  variant="outline"
                  className="w-full py-3 rounded-xl font-bold text-sm bg-blue-50 text-primary border-blue-100 hover:bg-blue-100"
                >
                  {isLoading ? "Loading..." : "Load More"}
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