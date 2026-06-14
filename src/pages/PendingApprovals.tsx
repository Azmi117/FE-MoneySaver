import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, XCircle, Clock, Inbox, ChevronLeft, ChevronRight, 
  CreditCard, Send, ArrowRightLeft, MessageSquare, Briefcase,
  Search, Filter
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import api from "@/services/api";

const PendingApprovals = () => {
  // STATE DATA
  const [emails, setEmails] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  
  // STATE SEARCH & FILTER
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  // STATE MODAL APPROVAL
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [targetEmailId, setTargetEmailId] = useState<number | null>(null);
  const [modalWorkspaceId, setModalWorkspaceId] = useState<string>("");

  // STATE PAGINATION
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 1
  });

  // 1. FETCH ALL PENDING EMAILS (GLOBAL)
  const fetchPendingEmails = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/emails/pending?page=${page}&limit=${meta.limit}`);
      if (res.data?.data) {
        setEmails(res.data.data);
      } else {
        setEmails([]);
      }
      
      if (res.data?.meta) {
        setMeta(res.data.meta);
      }
    } catch (error) {
      console.error("Gagal load pending emails:", error);
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. FETCH LIST WORKSPACES (Buat isi dropdown di dalam modal)
  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      if (res.data?.data) {
        setWorkspaces(res.data.data);
      }
    } catch (error) {
      console.error("Gagal load daftar workspace:", error);
    }
  };

  // LOAD DATA AWAL
  useEffect(() => {
    fetchPendingEmails(meta.page);
    fetchWorkspaces();
  }, [meta.page]);

  // BUTTON ACC DI-KLIK: Buka Modal & Set Target Email
  const openApproveModal = (emailId: number) => {
    setTargetEmailId(emailId);
    setShowApproveModal(true);
    if (workspaces.length > 0) {
      setModalWorkspaceId((workspaces[0].id || workspaces[0].ID).toString());
    } else {
      setModalWorkspaceId("");
    }
  };

  // SUBMIT APPROVAL DARI MODAL
  const handleConfirmApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmailId || !modalWorkspaceId) return;

    setIsActionLoading(targetEmailId);
    try {
      await api.post(`/emails/${targetEmailId}/approve`, {
        workspace_id: Number(modalWorkspaceId)
      });
      
      alert("Transaksi m-banking berhasil dimasukkan ke workspace pilihan lu!");
      setShowApproveModal(false);
      setTargetEmailId(null);
      
      setEmails(emails.filter(em => (em.id || em.ID) !== targetEmailId));
      setMeta(prev => ({ ...prev, total_items: prev.total_items - 1 }));
    } catch (error) {
      console.error("Gagal approve email:", error);
      alert("Gagal memproses approval transaksi.");
    } finally {
      setIsActionLoading(null);
    }
  };

  // HANDLE REJECT
  const handleReject = async (emailId: number) => {
    const isConfirmed = window.confirm("Yakin mau mengabaikan/menolak mutasi e-banking ini?");
    if (!isConfirmed) return;

    setIsActionLoading(emailId);
    try {
      await api.post(`/emails/${emailId}/reject`);
      
      setEmails(emails.filter(em => (em.id || em.ID) !== emailId));
      setMeta(prev => ({ ...prev, total_items: prev.total_items - 1 }));
    } catch (error) {
      console.error("Gagal reject email:", error);
      alert("Gagal menolak transaksi email.");
    } finally {
      setIsActionLoading(null);
    }
  };

  // HELPER BADGE METODE (QRIS, TRANSFER, TOPUP)
  const getMethodBadge = (method: string) => {
    const m = method?.toLowerCase() || "";
    if (m.includes("qris")) {
      return { label: "QRIS", className: "bg-purple-50 border-purple-200 text-purple-700", icon: <CreditCard size={14} /> };
    }
    if (m.includes("transfer") || m.includes("trf")) {
      return { label: "TRANSFER", className: "bg-blue-50 border-blue-200 text-blue-700", icon: <ArrowRightLeft size={14} /> };
    }
    if (m.includes("top") || m.includes("wallet") || m.includes("pay")) {
      return { label: "E-WALLET TOP-UP", className: "bg-orange-50 border-orange-200 text-orange-700", icon: <Send size={14} /> };
    }
    if (m.includes("virtual") || m.includes("va")) {
      return { label: "VIRTUAL ACCOUNT", className: "bg-teal-50 border-teal-200 text-teal-700", icon: <CreditCard size={14} /> };
    }
    return { label: method?.toUpperCase() || "MUTASI", className: "bg-gray-50 border-gray-200 text-gray-700", icon: <CreditCard size={14} /> };
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // --- PROCESSING DATA (Parse JSON, Sort, Filter, Search) ---
  const processedEmails = emails.map(email => {
    // 1. Parsing raw_data dari Golang (Menangani Format String JSON)
    let parsedData: any = {};
    if (email.raw_data || email.RawData) {
      try {
        const raw = email.raw_data || email.RawData;
        parsedData = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        console.error("Gagal parse raw_data:", e);
      }
    }

    // 2. Ekstrak data yang bener "Tahan Banting" buat nge-handle semua key Go/JSON
    const recipient = 
      parsedData.merchant_name || parsedData.MerchantName || parsedData.recipient || 
      email.merchant_name || email.MerchantName || email.recipient || email.Recipient || 
      email.title || email.Title || "Transaksi Otomatis";

    const amount = 
      parsedData.amount || parsedData.Amount || parsedData.total_expense || 
      email.amount || email.Amount || email.total_expense || 0;

    const dateStr = 
      parsedData.date || parsedData.Date || 
      email.date || email.Date || email.created_at || email.CreatedAt || new Date().toISOString();

    const note = 
      parsedData.note || parsedData.Note || 
      email.note || email.Note || "";

    const paymentMethod = 
      parsedData.method || parsedData.Method || parsedData.source || 
      email.method || email.Method || email.source || "expense";

    return { ...email, recipient, amount, dateStr, note, paymentMethod, emailId: email.id || email.ID };
  });

  // 3. Urutkan dari yang terbaru (Paling atas) pakai spread syntax
  let filteredEmails = [...processedEmails].sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  // 4. Fitur Search Bar
  if (searchTerm) {
    filteredEmails = filteredEmails.filter(e => 
      e.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // 5. Fitur 3 Filter Button
  if (activeFilter !== "ALL") {
    filteredEmails = filteredEmails.filter(e => {
      const m = e.paymentMethod.toLowerCase();
      if (activeFilter === "QRIS") return m.includes("qris");
      if (activeFilter === "TRANSFER") return m.includes("transfer") || m.includes("trf");
      // UBAH BARIS INI:
      if (activeFilter === "TOP-UP") return m.includes("top") || m.includes("wallet") || m.includes("pay");
      if (activeFilter === "VA") return m.includes("virtual") || m.includes("va");
      return true;
    });
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 pt-4 lg:pt-0">
      <div className="flex-1 flex flex-col overflow-y-auto px-4 lg:px-6 gap-6 max-w-4xl w-full mx-auto pb-20 lg:pb-10 pt-6">
        
        {/* HEADER PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-orange-500" /> Global Bank Notification Inbox
          </h1>
          <p className="text-xs lg:text-sm text-gray-500">
            Daftar seluruh mutasi otomatis yang masuk via email e-banking. Pilih ACC untuk memasukkannya ke workspace pilihan lu.
          </p>
        </div>

        {/* SEARCH & FILTER PANEL */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-2 w-full justify-evenly pb-1 md:pb-0 scrollbar-hide">
            {/* UBAH ARRAYNYA DI SINI JADI 'TOP-UP' */}
            {['ALL', 'QRIS', 'TRANSFER', 'TOP-UP', 'VA'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  activeFilter === filter 
                    ? "bg-primary text-white shadow-sm" 
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {filter === 'ALL' ? 'Semua' : filter === 'VA' ? 'Virtual Account' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* FEED PENDING MUTASI EMAIL (KOTAK MERAH) */}
        <div className="flex flex-col gap-4 h-[730px] overflow-y-auto pr-2 bg-transparent rounded-2xl scrollbar-thin scrollbar-thumb-gray-200">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-sm">Menyelaraskan kotak masuk...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="h-full bg-white rounded-2xl p-10 flex flex-col items-center justify-center border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                <Inbox size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Kosong Cuy</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">Nggak ada transaksi yang cocok sama pencarian atau filter lu.</p>
            </div>
          ) : (
            filteredEmails.map((email) => {
              const isProcessing = isActionLoading === email.emailId;
              const badge = getMethodBadge(email.paymentMethod);

              return (
                <div key={email.emailId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all hover:border-primary/30 group shrink-0">
                  
                  {/* DETAIL NOTIFIKASI BANK */}
                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          {badge.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 text-base truncate">{email.recipient}</h3>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                            {new Date(email.dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide border uppercase", badge.className)}>
                          {badge.label}
                        </span>
                        <p className="text-base font-bold text-red-600 mt-1.5">{formatRupiah(email.amount)}</p>
                      </div>
                    </div>

                    {/* BERITA TRANSFER / NOTE */}
                    {email.note && (
                      <div className="flex items-start gap-2 bg-gray-50/70 p-3 rounded-xl border border-gray-100/60 text-xs text-gray-600">
                        <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Berita / Catatan:</span>
                          <p className="font-medium italic leading-relaxed">"{email.note}"</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TOMBOL AKSI ACC (Ijo Pastel Soft) */}
                  <div className="bg-gray-50/50 border-t lg:border-t-0 lg:border-l border-gray-100 p-4 flex flex-row lg:flex-col items-center justify-end lg:justify-center gap-2.5 shrink-0 lg:w-44">
                    <Button 
                      onClick={() => openApproveModal(email.emailId)} 
                      disabled={isProcessing}
                      className="flex-1 lg:w-full bg-green-100 text-green-700 hover:bg-green-200/80 border border-green-200/60 h-10 shadow-none gap-1.5 text-xs rounded-xl font-bold transition-colors"
                    >
                      <CheckCircle2 size={16} /> ACC
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleReject(email.emailId)} 
                      disabled={isProcessing}
                      className="flex-1 lg:w-full text-gray-500 border-gray-200 hover:bg-red-50 hover:text-danger hover:border-red-100 h-10 bg-white gap-1.5 text-xs rounded-xl font-bold"
                    >
                      <XCircle size={16} /> Ignore
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION PANEL */}
        {!isLoading && emails.length > 0 && meta.total_pages > 1 && (
          <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm mt-2">
            <span className="text-xs text-gray-500 font-semibold">
              Page <span className="font-bold text-gray-900">{meta.page}</span> of <span className="font-bold text-gray-900">{meta.total_pages}</span>
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                disabled={meta.page === 1 || isLoading}
                onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
                className="p-2 h-8 w-8 rounded-lg"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button 
                variant="outline" 
                disabled={meta.page === meta.total_pages || isLoading}
                onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
                className="p-2 h-8 w-8 rounded-lg"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* ========================================== */}
      {/* MODAL APPROVAL WORKSPACE SELECTION         */}
      {/* ========================================== */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl w-full max-w-sm p-6 shadow-xl border border-gray-100 flex flex-col gap-5 bg-white">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                <Briefcase size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Assign to Workspace</h3>
            </div>
            
            <form onSubmit={handleConfirmApprove} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pilih Buku Kas / Workspace</label>
                <select 
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none font-semibold transition-all"
                  value={modalWorkspaceId}
                  onChange={(e) => setModalWorkspaceId(e.target.value)}
                >
                  <option value="" disabled>-- Pilih Workspace Tujuan --</option>
                  {workspaces.map(ws => (
                    <option key={ws.id || ws.ID} value={ws.id || ws.ID}>{ws.name}</option>
                  ))}
                </select>
                {workspaces.length === 0 && (
                  <p className="text-[11px] text-red-500 mt-1">Lu belum punya workspace aktif cuy, bikin dulu di menu utama.</p>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-2 border-t border-gray-50 pt-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setShowApproveModal(false); setTargetEmailId(null); }} 
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!modalWorkspaceId || workspaces.length === 0}
                  className="text-xs font-bold bg-green-500 hover:bg-green-600 shadow-sm"
                >
                  Save Transaksi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PendingApprovals;