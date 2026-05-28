import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle, XCircle, Edit2, Clock, 
  ChevronDown, ChevronUp, Receipt, Loader2, ArrowLeft, Mail
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";

// ==========================================
// DUMMY DATA GABUNGAN (OCR + EMAIL)
// Nanti pas fetch, lu panggil 2 endpoint, format, lalu gabungin ke 1 state
// ==========================================
const dummyPendingList = [
  {
    id: 31,
    source: "scan_hybrid",
    created_at: "2026-05-15T21:19:30",
    data: { merchant: "Unggul Mart Antasari", amount: 37000, date: "2024-10-31T19:47:00Z", method: "Cash", note: "Pembelian sambal udang...", items: [
      { description: "FINNA ULEG SAMBAL UDANG", price: 14500, quantity: 1, total: 14500 },
      { description: "FINNA ULEG SAMBAL BAWANG", price: 14500, quantity: 1, total: 14500 }
    ]}
  },
  // INI CONTOH DATA DARI EMAIL PARSING
  {
    id: 99,
    source: "email_auto", 
    created_at: "2026-05-15T18:00:00",
    data: { 
      merchant: "Google Play", 
      subject: "Pembayaran Berhasil untuk Layanan Google", // Subject email
      amount: 25000, 
      date: "2026-05-15T18:00:00Z",
      method: "E-Wallet",
      items: [] // Email biasanya gak ada detail items
    }
  },
  {
    id: 29,
    source: "scan_hybrid",
    created_at: "2026-05-15T20:44:30",
    data: { merchant: "Starbucks Coffee", amount: 105000, date: "2026-05-23T08:00:00Z", method: "QRIS", note: "Morning coffee", items: [
      { description: "Caramel Macchiato", price: 55000, quantity: 1, total: 55000 },
      { description: "Almond Croissant", price: 50000, quantity: 1, total: 50000 },
    ]}
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const PendingApprovals = () => {
  const [pendings, setPendings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    setPendings(dummyPendingList.slice(0, 2)); 
  }, []);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPendings(prev => [...prev, ...dummyPendingList.slice(2)]);
      setHasMore(false);
      setIsLoading(false);
    }, 1000);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background/50 relative">
      <main className="p-4 sm:p-6 max-w-4xl mx-auto w-full flex flex-col gap-6 pb-28 lg:pb-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-2">
          <Link to="/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              Pending Approvals 
              <span className="bg-yellow-100 text-yellow-600 text-xs px-2.5 py-0.5 rounded-full font-bold">Needs Review</span>
            </h1>
            <p className="text-sm text-gray-500">Review and confirm your scanned receipts and emails.</p>
          </div>
        </div>

        {/* LIST CONTAINER */}
        <div className="flex flex-col gap-4">
          {pendings.map((item) => {
            const isEmail = item.source === "email_auto";

            return (
              <div key={item.id} className="bg-surface rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all hover:border-blue-200 hover:shadow-md">
                
                {/* Main Row */}
                <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  
                  <div className="flex items-start gap-4">
                    {/* ICON LOGIC: Surat buat Email, Struk buat Scan */}
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", isEmail ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-primary")}>
                      {isEmail ? <Mail size={24} /> : <Receipt size={24} />}
                    </div>
                    <div>
                      {/* TITLE LOGIC */}
                      <h3 className="font-bold text-text text-lg capitalize">
                        {isEmail ? "Email Parsed" : item.data.merchant}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                        {isEmail && (
                          <span className="text-xs text-gray-600 font-medium line-clamp-1 max-w-[250px]">
                            Subject: {item.data.subject}
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                          {isEmail && <span className="hidden sm:inline">•</span>}
                          <span className="flex items-center gap-1"><Clock size={12}/> {new Date(item.data.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span className="uppercase tracking-wider text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                            {item.source.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full mt-2 sm:mt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-500 font-bold mb-0.5">{isEmail ? "Parsed Amount" : "Scanned Total"}</p>
                      <h4 className="font-bold text-xl text-primary">{formatCurrency(item.data.amount)}</h4>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-colors bg-gray-50" title="Edit Record">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2.5 text-danger hover:bg-red-50 rounded-xl transition-colors bg-gray-50" title="Reject / Delete">
                        <XCircle size={18} />
                      </button>
                      <button className="p-2.5 text-white bg-success hover:bg-green-600 shadow-sm rounded-xl transition-colors flex items-center gap-2 px-4" title="Approve & Save">
                        <CheckCircle size={18} />
                        <span className="text-sm font-bold hidden sm:block">Approve</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Toggle Items Details (Disembunyikan kalau items kosong/gak ada) */}
                {!isEmail && item.data.items && item.data.items.length > 0 && (
                  <div className="border-t border-gray-50 bg-gray-50/50">
                    <button 
                      onClick={() => toggleExpand(item.id)}
                      className="w-full py-2.5 px-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                    >
                      {expandedId === item.id ? (
                        <><ChevronUp size={14}/> Hide items detail</>
                      ) : (
                        <><ChevronDown size={14}/> View {item.data.items.length} items</>
                      )}
                    </button>

                    {expandedId === item.id && (
                      <div className="px-6 pb-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-50 flex justify-between">
                            <span>Item Description</span>
                            <span>Price</span>
                          </div>
                          <div className="flex flex-col gap-3">
                            {item.data.items.map((i: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-start text-sm">
                                <span className="text-text font-medium flex-1 pr-4">{i.description} <span className="text-gray-400">x{i.quantity}</span></span>
                                <span className="font-bold text-gray-600 whitespace-nowrap">{formatCurrency(i.total)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER - LOAD MORE */}
        <div className="mt-4 flex justify-center">
          {hasMore ? (
            <Button 
              onClick={handleLoadMore} 
              disabled={isLoading}
              variant="outline"
              className="py-3 px-8 rounded-xl font-bold text-sm bg-white text-primary border-gray-200 hover:bg-blue-50 hover:border-blue-200 shadow-sm transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading data...</span>
              ) : "Load More Pending Approvals"}
            </Button>
          ) : (
            <p className="text-sm text-gray-400 font-medium py-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-success"/> You're all caught up!
            </p>
          )}
        </div>

      </main>
    </div>
  );
};

export default PendingApprovals;