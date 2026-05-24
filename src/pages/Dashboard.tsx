import { useState } from "react";
import { 
  ChevronDown, Bell, TrendingUp, TrendingDown, Target,
  PieChart, Plus, Coffee, ShoppingCart, Zap, 
  Search, CheckCircle, Clock, Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

// Dummy Data untuk Workspaces
const workspaces = [
  { id: 1, name: "Personal Workspace" },
  { id: 2, name: "Kosan Patungan" },
];

// Dummy Data untuk Transaksi
const recentTransactions = [
  { id: 1, entity: "Starbucks Coffee", category: "Food & Beverage", date: "22 May 2026", amount: -45000, status: "CONFIRMED", icon: Coffee, bg: "bg-orange-100", color: "text-orange-600" },
  { id: 2, entity: "Monthly Groceries", category: "Shopping", date: "20 May 2026", amount: -250000, status: "CONFIRMED", icon: ShoppingCart, bg: "bg-blue-100", color: "text-blue-600" },
  { id: 3, entity: "Electricity Bill", category: "Bills", date: "18 May 2026", amount: -150000, status: "PENDING", icon: Zap, bg: "bg-yellow-100", color: "text-yellow-600" },
  { id: 4, entity: "Freelance Project", category: "Income", date: "15 May 2026", amount: 1500000, status: "CONFIRMED", icon: TrendingUp, bg: "bg-green-100", color: "text-success" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const Dashboard = () => {
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        
        {/* HEADER */}
        <header className="bg-surface lg:bg-background/80 lg:backdrop-blur-md px-6 py-4 lg:py-5 sticky top-0 z-20 border-b border-gray-100 lg:border-none flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">A</div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Good morning,</span>
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1 text-sm font-bold text-text focus:outline-none">
                  {activeWorkspace.name} <ChevronDown size={16} className={cn("transition-transform", isDropdownOpen && "rotate-180")} />
                </button>
                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-gray-100 py-2 z-30">
                    {workspaces.map((ws) => (
                      <button key={ws.id} onClick={() => { setActiveWorkspace(ws); setIsDropdownOpen(false); }} className={cn("w-full text-left px-4 py-2 text-sm hover:bg-gray-50", activeWorkspace.id === ws.id ? "text-primary font-semibold" : "text-text")}>
                        {ws.name}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-text hover:bg-gray-50 font-medium flex items-center gap-2">
                        <Plus size={16} /> Add Workspace
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-white border border-gray-200 px-4 py-2 rounded-full w-64 shadow-sm">
              <Search size={16} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full" />
            </div>
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
            </button>
          </div>
        </header>

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
              <button className="text-sm text-primary font-semibold hover:underline">See All</button>
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold text-text">Your Workspaces</h2>
              <Link to="/workspaces" className="text-sm font-bold text-primary hover:underline">Manage</Link>
            </div>
            
            {/* Carousel Container (Bisa di-scroll ke samping) */}
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              
              {/* Card 1: Active Workspace */}
              <div className="bg-primary text-white p-5 rounded-3xl min-w-[150px] flex-shrink-0 shadow-md relative overflow-hidden cursor-pointer hover:bg-blue-600 transition-colors">
                <div className="absolute -right-4 -bottom-4 opacity-20"><Briefcase size={72}/></div>
                <h3 className="font-bold text-lg relative z-10">Personal</h3>
                <p className="text-xs text-blue-100 mt-1 relative z-10">Default</p>
              </div>
              
              {/* Card 2: Grup Lain */}
              <div className="bg-surface border border-gray-200 p-5 rounded-3xl min-w-[150px] flex-shrink-0 shadow-sm group hover:border-primary transition-colors cursor-pointer">
                <h3 className="font-bold text-lg text-text group-hover:text-primary transition-colors">🏠 Kosan</h3>
                <p className="text-xs text-gray-500 mt-1">4 Members</p>
              </div>

              {/* Card 3: Grup Lain */}
              <div className="bg-surface border border-gray-200 p-5 rounded-3xl min-w-[150px] flex-shrink-0 shadow-sm group hover:border-primary transition-colors cursor-pointer">
                <h3 className="font-bold text-lg text-text group-hover:text-primary transition-colors">✈️ Liburan</h3>
                <p className="text-xs text-gray-500 mt-1">6 Members</p>
              </div>

              {/* Card 4: Create New Button */}
              <Link to="/workspaces" className="bg-blue-50/50 border-2 border-dashed border-blue-200 p-5 rounded-3xl min-w-[150px] flex-shrink-0 flex flex-col items-center justify-center text-primary hover:bg-blue-100 transition-colors">
                <Plus size={28} className="mb-2"/>
                <span className="text-xs font-bold">New Workspace</span>
              </Link>

            </div>
          </div>
          {/* --- WORKSPACES WIDGET END --- */}

        </main>
      </div>

      {/* ================= FLOATING BUTTON (DESKTOP) ================= */}
      <button className="hidden lg:flex fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full items-center justify-center shadow-lg shadow-primary/40 hover:bg-primary/90 transition-all hover:scale-105 z-40">
        <Plus size={28} />
      </button>
    </>
  );
};

export default Dashboard;