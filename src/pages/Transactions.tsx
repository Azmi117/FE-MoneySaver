import React, { useState, useRef, useEffect } from "react";
import { 
  Briefcase, Receipt, CheckCircle, Plus, Search, Filter, Download, Coffee, ShoppingCart, Zap,
  Clock, MoreVertical, Trash2, Edit2, X, FileText, Camera, UploadCloud, Tag, Calendar, AlignLeft,
  CircleDashed, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

// HELPER CURRENCY
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const Transactions = () => {
  // ==========================================
  // 1. ZUSTAND GLOBAL WORKSPACE (CATCH-ALL)
  // ==========================================
  const workspaceStore: any = useWorkspaceStore();
  
  const selectedWorkspaceId = 
    workspaceStore?.activeWorkspace?.id || 
    workspaceStore?.activeWorkspace?.ID || 
    workspaceStore?.workspace?.id ||
    workspaceStore?.workspaceId || 
    workspaceStore?.selectedWorkspaceId || 
    workspaceStore?.currentWorkspaceId;

  useEffect(() => {
    console.log("DATA STORE DARI HEADER:", workspaceStore);
    console.log("ID WORKSPACE YANG KETANGKAP:", selectedWorkspaceId);
  }, [workspaceStore]);

  // ==========================================
  // 2. STATE DATA & PAGINATION
  // ==========================================
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [meta, setMeta] = useState({ page: 1, limit: 10, total_pages: 1 });

  // ==========================================
  // 3. STATE UI MODAL & ACTION
  // ==========================================
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [mobileMenuTx, setMobileMenuTx] = useState<any>(null);
  const [exportMonth, setExportMonth] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  
  // STATE MODAL DETAIL
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // STATE MODAL ADD
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "ocr">("manual");
  
  // ==========================================
  // 4. STATE FORM MANUAL
  // ==========================================
  const [manualForm, setManualForm] = useState({ 
    merchant: "", amount: "", categoryId: "", date: new Date().toISOString().split('T')[0], note: "", type: "expense" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ==========================================
  // 5. STATE OCR UPLOAD & REVIEW
  // ==========================================
  const [ocrMethod, setOcrMethod] = useState<"hybrid" | "alt">("hybrid");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ocrState, setOcrState] = useState<"upload" | "scanning" | "review">("upload");
  
  const [pendingOcrId, setPendingOcrId] = useState<number | null>(null);
  const [scannedData, setScannedData] = useState({
    merchant: "",
    date: "",
    amount: 0,
    categoryId: "",
    items: [] as { id: number, description: string, price: number, quantity: number, total: number }[]
  });

  // ==========================================
  // FETCH TRANSACTIONS & CATEGORIES
  // ==========================================
  const fetchTransactions = async (page: number, append = false) => {
    if (!selectedWorkspaceId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/workspaces/${selectedWorkspaceId}/transactions?page=${page}&limit=${meta.limit}`);
      if (res.data?.data) {
        setTransactions(append ? [...transactions, ...res.data.data] : res.data.data);
      } else if (!append) {
        setTransactions([]);
      }
      if (res.data?.meta) setMeta(res.data.meta);
    } catch (error) {
      console.error("Gagal load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!selectedWorkspaceId) return;
    try {
      const res = await api.get(`/workspaces/${selectedWorkspaceId}/categories`);
      if (res.data?.data) setCategories(res.data.data);
    } catch (error) {
      console.error("Gagal load categories:", error);
    }
  };

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchTransactions(1, false);
      fetchCategories();
    }
  }, [selectedWorkspaceId]);

  const handleLoadMore = () => {
    if (meta.page < meta.total_pages) {
      fetchTransactions(meta.page + 1, true);
    }
  };

  // ==========================================
  // MANUAL ENTRY
  // ==========================================
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId) return alert("Pilih workspace di bagian atas halaman dulu cuy!");
    
    setIsSubmitting(true);
    try {
      const payload = {
        workspace_id: selectedWorkspaceId,
        merchant: manualForm.merchant,
        amount: Number(manualForm.amount),
        category_id: Number(manualForm.categoryId),
        date: manualForm.date + "T00:00:00Z",
        type: manualForm.type,
        note: manualForm.note
      };
      await api.post('/transactions/manual', payload);
      alert("Transaksi manual berhasil disimpan!");
      setShowAddModal(false);
      setManualForm({ merchant: "", amount: "", categoryId: "", date: new Date().toISOString().split('T')[0], note: "", type: "expense" });
      fetchTransactions(1, false);
    } catch (error) {
      alert("Gagal menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ACTION BUTTONS (DELETE & VIEW DETAILS)
  // ==========================================
  const handleDeleteTx = async (id: number) => {
    if (!window.confirm("Yakin mau hapus transaksi ini?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => (t.id || t.ID) !== id));
      setActionMenuOpen(null);
      setMobileMenuTx(null);
    } catch (error) {
      alert("Gagal menghapus transaksi.");
    }
  };

  const handleViewDetails = async (tx: any) => {
    // 1. Set data dasar dulu biar modal langsung kebuka & gak kerasa lemot
    setSelectedTxDetail(tx);
    setDetailModalOpen(true);
    setActionMenuOpen(null);
    setMobileMenuTx(null);
    
    // 2. Fetching detail transaksi ke backend buat dapetin transaction_items
    const txId = tx.id || tx.ID;
    if (!txId) return;

    setIsDetailLoading(true);
    try {
      // Sesuaikan URL ini kalau di routes.go lu endpoint-nya beda!
      const res = await api.get(`/transactions/${txId}`);
      
      if (res.data?.data) {
        // Timpa state modal dengan data lengkap dari backend (udah ada items-nya)
        setSelectedTxDetail(res.data.data);
      }
    } catch (error) {
      console.error("Gagal narik detail item transaksi:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // ==========================================
  // OCR SCAN & REVIEW
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setReceiptFile(e.target.files[0]);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setReceiptFile(e.dataTransfer.files[0]);
  };

  const handleScanReceipt = async () => {
    if (!receiptFile) {
      alert("Lu belum pilih file foto struknya cuy!");
      return;
    }
    if (!selectedWorkspaceId) {
      alert("Gagal nangkep ID dari Header! Coba lu cek Console Log (F12) buat liat nama state di Zustand lu apa.");
      return;
    }

    setOcrState("scanning");
    
    const formData = new FormData();
    formData.append(ocrMethod === "hybrid" ? "image" : "file", receiptFile);
    formData.append("workspace_id", selectedWorkspaceId.toString());

    try {
      const endpoint = ocrMethod === "hybrid" ? "/transactions/scan-hybrid2" : "/transactions/scan-alt";
      const res = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      
      const { data, pending_id } = res.data;
      setPendingOcrId(pending_id);
      
      const txData = data.transaction || data;

      let ocrResult = txData;
      if (typeof txData === 'string') {
        try { ocrResult = JSON.parse(txData); } catch(e){}
      } else if (txData.raw_data && typeof txData.raw_data === 'string') {
        try { ocrResult = JSON.parse(txData.raw_data); } catch(e){}
      } else if (txData.RawData && typeof txData.RawData === 'string') {
        try { ocrResult = JSON.parse(txData.RawData); } catch(e){}
      }

      setScannedData({
        merchant: ocrResult.merchant || ocrResult.Merchant || ocrResult.merchant_name || "",
        date: ocrResult.date || ocrResult.Date ? String(ocrResult.date || ocrResult.Date).split('T')[0] : new Date().toISOString().split('T')[0],
        amount: ocrResult.amount || ocrResult.Amount || ocrResult.total || ocrResult.Total || 0,
        categoryId: "", 
        items: (ocrResult.items || ocrResult.Items || ocrResult.transaction_items || ocrResult.TransactionItems || []).map((item: any, idx: number) => ({
          id: idx,
          description: item.description || item.Description || item.name || item.Name || "Item",
          price: item.price || item.Price || item.amount || item.Amount || 0,
          quantity: item.qty || item.Qty || item.quantity || item.Quantity || 1, 
          total: item.price || item.Price || item.amount || item.Amount || 0 
        }))
      });
      
      setOcrState("review");
    } catch (error: any) {
      console.error("Error dari backend OCR:", error);
      alert(`Gagal scan struk cuy! Pesan: ${error?.response?.data?.message || error.message}`);
      setOcrState("upload");
    }
  };

  const handleExportPDF = async () => {
    if (!selectedWorkspaceId) return;
    
    setIsLoading(true);
    try {
      const exportUrl = exportMonth 
        ? `/workspaces/${selectedWorkspaceId}/transactions/export?month=${exportMonth}`
        : `/workspaces/${selectedWorkspaceId}/transactions/export`;

      const res = await api.get(exportUrl, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = exportMonth ? `Report_${exportMonth}.pdf` : `Report_All.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // ✨ FIX: Tutup modal setelah beres download
      setExportModalOpen(false);
      setExportMonth(""); // Opsional: reset bulan
    } catch (error) {
      console.error("Gagal export PDF:", error);
      alert("Gagal mengunduh laporan PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateScannedItem = (id: number, field: "description" | "price" | "quantity", value: string | number) => {
    setScannedData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          updatedItem.total = updatedItem.price * updatedItem.quantity;
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleRemoveScannedItem = (id: number) => {
    setScannedData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleAddScannedItem = () => {
    setScannedData(prev => ({
      ...prev,
      items: [
        ...prev.items, 
        { 
          id: Date.now(), 
          description: "", 
          price: 0, 
          quantity: 1, 
          total: 0 
        }
      ]
    }));
  };

  const calculatedOcrTotal = scannedData.items.reduce((acc, curr) => acc + curr.total, 0);

  const handleConfirmOcr = async () => {
    if (!selectedWorkspaceId) return;
    if (!scannedData.categoryId) return alert("Pilih kategori dulu cuy buat transaksi ini!");

    setIsSubmitting(true);
    try {
      // Bikin payload yang sama persis buat Hybrid dan Alt
      const payload = {
        workspace_id: selectedWorkspaceId,
        merchant: scannedData.merchant,
        amount: scannedData.amount, 
        date: scannedData.date + "T00:00:00Z",
        type: "expense",
        category_id: Number(scannedData.categoryId),
        note: "Scanned via OCR",
        method: "cash",
        items: scannedData.items
      };

      if (ocrMethod === "hybrid") {
        // ✨ SEKARANG PATCH-NYA NGIRIM PAYLOAD EDITAN ✨
        await api.patch(`/transactions/${pendingOcrId}/confirm`, payload);
      } else {
        await api.post('/transactions/scan-alt/confirm', payload);
      }
      
      alert("Transaksi berhasil disimpan ke buku kas!");
      setShowAddModal(false);
      setOcrState("upload");
      setReceiptFile(null);
      fetchTransactions(1, false);
    } catch (error) {
      alert("Gagal menyimpan hasil konfirmasi scan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = (tx.merchant || tx.Merchant || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || (tx.type || tx.Type || "").toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <>
      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        <div className="lg:flex justify-center shrink-0">
          <div className="px-4 lg:w-3/4 sm:px-6 pt-4 sm:pt-6 pb-0 flex items-center justify-end gap-4 sm:gap-4">
              
              {/* ✨ FIX: Tombol Export dibikin bersih lagi, cuma buat buka modal ✨ */}
              <Button onClick={() => setExportModalOpen(true)} variant="outline" className="py-2.5 sm:py-2 px-4 rounded-xl text-xs gap-1.5 font-bold border-gray-200 text-gray-600 bg-white">
                <Download size={16} /> <span className="hidden sm:inline">Export</span>
              </Button>
              
              <Button onClick={() => setShowAddModal(true)} className="py-2.5 sm:py-2 px-4 rounded-xl text-xs gap-1.5 font-bold shadow-sm">
                <Plus size={16} /> <span className="hidden sm:inline">Add Record</span>
              </Button>
              
          </div>
        </div>
        <div className="px-4 sm:px-6 pt-2 pb-4 shrink-0"></div>

        {/* CONTENT - OVERFLOW PADA LIST */}
        <div className="flex-1 px-4 sm:px-6 pb-28 lg:pb-10 w-full max-w-6xl mx-auto overflow-hidden">
          <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            
            {/* Toolbar */}
            <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center gap-4 justify-between shrink-0">
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

            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/30 shrink-0">
              <div className="col-span-4">Transaction Details</div>
              <div className="col-span-3">Date & Time</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* TRANSACTIONS LIST */}
            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {isLoading && transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-full">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="font-bold text-text mb-1">Loading Data...</h3>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-50 pb-2">
                  {filteredTransactions.map((tx) => {
                    const isIncome = (tx.type || tx.Type || "").toLowerCase() === "income";
                    const formattedDate = new Date(tx.date || tx.Date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
                    const IconComp = isIncome ? Briefcase : Receipt;

                    return (
                      <div key={tx.id || tx.ID} className="flex lg:grid lg:grid-cols-12 gap-4 items-center p-4 lg:px-8 hover:bg-gray-50/50 transition-colors shrink-0">
                        <div className="flex-1 lg:col-span-4 flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}><IconComp size={20} /></div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-text text-sm truncate">{tx.merchant || tx.Merchant}</h4>
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">{tx.category?.name || tx.Category?.name || "General"} <span className="lg:hidden">• {formattedDate}</span></p>
                          </div>
                        </div>
                        <div className="hidden lg:block col-span-3 text-sm text-gray-500 font-medium">{formattedDate}</div>
                        <div className={cn("hidden lg:block col-span-2 text-right font-bold text-sm", isIncome ? "text-success" : "text-text")}>{isIncome ? "+" : ""}{formatCurrency(tx.amount || tx.Amount)}</div>
                        <div className="hidden lg:flex col-span-2 justify-center">
                          <span className={cn("flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md border", (tx.status || tx.Status || "").toLowerCase() === "pending" ? "bg-yellow-50 text-accent border-yellow-200" : "bg-green-50 text-success border-green-200")}>
                            {(tx.status || tx.Status || "").toLowerCase() === "pending" ? <Clock size={12}/> : <CheckCircle size={12}/>} {(tx.status || tx.Status || "APPROVED").toUpperCase()}
                          </span>
                        </div>
                        <div className="hidden lg:flex col-span-1 justify-center relative">
                          <button onClick={() => setActionMenuOpen(actionMenuOpen === (tx.id || tx.ID) ? null : (tx.id || tx.ID))} className="p-1.5 text-gray-400 hover:text-text rounded-lg hover:bg-gray-100"><MoreVertical size={18} /></button>
                          
                          {/* ================= DESKTOP ACTION MENU ================= */}
                          {actionMenuOpen === (tx.id || tx.ID) && (
                            <div className="absolute right-8 top-0 mt-2 w-36 bg-surface border border-gray-100 rounded-xl shadow-lg z-10 py-1">
                              <button onClick={() => handleViewDetails(tx)} className="w-full text-left px-4 py-2 text-xs font-medium text-text hover:bg-gray-50 flex items-center gap-2"><FileText size={14}/> View Details</button>
                              <button onClick={() => handleDeleteTx(tx.id || tx.ID)} className="w-full text-left px-4 py-2 text-xs font-medium text-danger hover:bg-red-50 flex items-center gap-2"><Trash2 size={14}/> Delete</button>
                            </div>
                          )}

                        </div>
                        <div className="lg:hidden flex flex-col items-end gap-1.5 shrink-0 pl-2">
                          <div className={cn("font-bold text-sm text-right", isIncome ? "text-success" : "text-text")}>{isIncome ? "+" : ""}{formatCurrency(tx.amount || tx.Amount)}</div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border", (tx.status || tx.Status || "").toLowerCase() === "approved" ? "bg-green-50 text-success border-green-200" : "bg-yellow-50 text-accent border-yellow-200")}>{(tx.status || tx.Status || "APPROVED").toUpperCase()}</span>
                            <button onClick={() => setMobileMenuTx(tx)} className="text-gray-400 p-1 bg-gray-50 rounded-md active:bg-gray-100"><MoreVertical size={16}/></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-full">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4"><Receipt size={32} /></div>
                  <h3 className="font-bold text-text mb-1">No transactions found</h3>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {meta.page < meta.total_pages && (
              <div className="p-4 sm:p-6 border-t border-gray-50 flex items-center justify-center bg-gray-50/30 shrink-0">
                <Button onClick={handleLoadMore} disabled={isLoading} variant="outline" className="text-xs font-bold py-2.5 px-6 rounded-xl bg-white text-primary border-gray-200">
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL ADD TRANSACTION (MANUAL & OCR) ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg"><Plus size={18}/></div>
                Add New Record
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setOcrState("upload");
                  setReceiptFile(null);
                }} 
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
              >
                <X size={18}/>
              </button>
            </div>

            {ocrState === "upload" && (
              <div className="px-6 pt-5 shrink-0">
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

            <div className="flex-1 overflow-y-auto px-6 py-6">
              
              {addMode === "manual" ? (
                <form id="manual-form" onSubmit={handleManualSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Merchant / Name</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Briefcase size={18}/></div>
                        <input type="text" required value={manualForm.merchant} onChange={(e) => setManualForm({...manualForm, merchant: e.target.value})} placeholder="e.g. Starbucks, Salary" className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                      </div>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</div>
                        <input type="number" required value={manualForm.amount} onChange={(e) => setManualForm({...manualForm, amount: e.target.value})} placeholder="0" className="w-full bg-gray-50 border border-gray-200 text-sm font-bold rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
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
                        <select required value={manualForm.categoryId} onChange={(e) => setManualForm({...manualForm, categoryId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-all">
                          <option value="" disabled>Select category...</option>
                          {categories.filter(c => c.type === manualForm.type || c.type?.toLowerCase() === manualForm.type).map(cat => (
                            <option key={cat.id || cat.ID} value={cat.id || cat.ID}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Date</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Calendar size={18}/></div>
                        <input type="date" required value={manualForm.date} onChange={(e) => setManualForm({...manualForm, date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Optional Note</label>
                      <div className="relative">
                        <div className="absolute left-4 top-4 text-gray-400"><AlignLeft size={18}/></div>
                        <textarea rows={2} value={manualForm.note} onChange={(e) => setManualForm({...manualForm, note: e.target.value})} placeholder="Add a description or note..." className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all"></textarea>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[350px] w-full">
                   
                   {ocrState === "upload" && (
                     <>
                       <div className="flex bg-gray-100 p-1 rounded-xl w-full mb-6 shrink-0">
                          <button 
                            onClick={() => setOcrMethod("hybrid")}
                            className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", ocrMethod === "hybrid" ? "bg-white shadow-sm text-primary" : "text-gray-500")}
                          >
                            Hybrid Engine (Gemini)
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

                   {ocrState === "scanning" && (
                     <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <Search size={40} className="text-primary animate-pulse" />
                        <h3 className="font-bold text-lg text-text">Scanning Receipt...</h3>
                        <p className="text-xs text-gray-500">Extracting merchant, items, and total amount using AI.</p>
                     </div>
                   )}

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
                           <div className="col-span-2">
                              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Category (Assign to)</label>
                              <select value={scannedData.categoryId} onChange={(e) => setScannedData({...scannedData, categoryId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-primary appearance-none">
                                <option value="" disabled>Select category...</option>
                                {categories.map(cat => (
                                  <option key={cat.id || cat.ID} value={cat.id || cat.ID}>{cat.name}</option>
                                ))}
                              </select>
                           </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-500">Scanned Items</label>
                            <button 
                              type="button" 
                              onClick={handleAddScannedItem}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
                            >
                              <Plus size={14} /> Add Item
                            </button>
                          </div>
                          
                          <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            {scannedData.items.map((item) => (
                              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-2 border-b border-gray-200 pb-2 mb-1 last:border-0 last:mb-0 last:pb-0">
                                <input type="text" value={item.description} onChange={(e) => handleUpdateScannedItem(item.id, "description", e.target.value)} className="w-full sm:flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Item name" />
                                
                                <div className="flex w-full sm:w-auto items-center gap-2">
                                  <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden w-24">
                                    <span className="px-2 text-xs text-gray-400">Qty</span>
                                    <input type="number" value={item.quantity} onChange={(e) => handleUpdateScannedItem(item.id, "quantity", Number(e.target.value))} className="w-full py-2 text-sm outline-none font-bold" />
                                  </div>
                                  
                                  <input type="number" value={item.price} onChange={(e) => handleUpdateScannedItem(item.id, "price", Number(e.target.value))} className="w-24 sm:w-28 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Price" />
                                  
                                  <button type="button" onClick={() => handleRemoveScannedItem(item.id)} className="p-2 text-gray-400 hover:text-danger bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {scannedData.items.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No items detected or all removed.</p>}
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2 shrink-0">
                          <span className="font-bold text-sm text-gray-500">Grand Total</span>
                          <div className="relative w-36 sm:w-44">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</div>
                            <input 
                              type="number" 
                              value={scannedData.amount} 
                              onChange={(e) => setScannedData({...scannedData, amount: Number(e.target.value)})} 
                              className="w-full bg-white border border-gray-200 text-lg font-bold text-primary rounded-lg pl-9 pr-3 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-right" 
                            />
                          </div>
                        </div>

                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-3xl shrink-0">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddModal(false);
                  setOcrState("upload");
                  setReceiptFile(null);
                }} 
                className="text-xs font-bold py-2.5 px-6 rounded-xl bg-white border-gray-200"
              >
                Cancel
              </Button>
              
              {addMode === "manual" ? (
                <Button form="manual-form" type="submit" disabled={isSubmitting} className="text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm">
                  {isSubmitting ? "Saving..." : "Save Transaction"}
                </Button>
              ) : ocrState === "review" ? (
                <Button onClick={handleConfirmOcr} disabled={isSubmitting} className="text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm bg-success hover:bg-green-600 text-white border-none">
                  {isSubmitting ? "Saving..." : "Confirm & Save"}
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

      {/* ================= MODAL EXPORT ================= */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Download size={18}/></div>
                Export Report
              </h2>
              <button onClick={() => setExportModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
                <X size={18}/>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <p className="text-sm text-gray-500">
                Pilih bulan laporan yang mau di-export. Kosongin kalau lu mau narik <b>semua transaksi</b> dari awal.
              </p>
              
              {/* ✨ UI CUSTOM MONTH PICKER ✨ */}
              <div className="flex flex-col gap-3">
                {/* Year Navigation */}
                <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  <button onClick={() => setPickerYear(p => p - 1)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-text transition-colors shadow-sm"><ChevronLeft size={18}/></button>
                  <span className="font-black text-text">{pickerYear}</span>
                  <button onClick={() => setPickerYear(p => p + 1)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-text transition-colors shadow-sm"><ChevronRight size={18}/></button>
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m, i) => {
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const value = `${pickerYear}-${m}`;
                    const isSelected = exportMonth === value;
                    
                    return (
                      <button
                        key={m}
                        onClick={() => setExportMonth(value)}
                        className={cn(
                          "py-2.5 text-xs font-bold rounded-xl transition-all", 
                          isSelected 
                            ? "bg-primary text-white shadow-md ring-2 ring-primary/20" 
                            : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:border-gray-200"
                        )}
                      >
                        {monthNames[i]}
                      </button>
                    );
                  })}
                </div>

                {/* Tombol Clear Filter */}
                {exportMonth && (
                  <button onClick={() => setExportMonth("")} className="mt-2 text-xs font-bold text-danger hover:underline text-center">
                    Reset Selection (Export All)
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-3xl">
              <Button variant="outline" onClick={() => setExportModalOpen(false)} className="text-xs font-bold py-2.5 px-6 rounded-xl bg-white border-gray-200">
                Cancel
              </Button>
              <Button onClick={handleExportPDF} disabled={isLoading} className="text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm gap-2">
                {isLoading ? "Exporting..." : <><Download size={16}/> Download PDF</>}
              </Button>
            </div>
            
          </div>
        </div>
      )}

      {/* ================= MODAL TRANSACTION DETAILS ================= */}
      {detailModalOpen && selectedTxDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><FileText size={18}/></div>
                Transaction Details
              </h2>
              <button onClick={() => setDetailModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
                <X size={18}/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
              
              {/* Summary Header */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-3", (selectedTxDetail.type || selectedTxDetail.Type || "").toLowerCase() === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                  {(selectedTxDetail.type || selectedTxDetail.Type || "").toLowerCase() === "income" ? <Briefcase size={32}/> : <Receipt size={32}/>}
                </div>
                <h3 className="text-xl font-bold text-text">{selectedTxDetail.merchant || selectedTxDetail.Merchant}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedTxDetail.date || selectedTxDetail.Date).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className={cn("mt-4 px-5 py-2 rounded-xl font-black text-xl border", (selectedTxDetail.type || selectedTxDetail.Type || "").toLowerCase() === "income" ? "bg-green-50 text-success border-green-100" : "bg-red-50 text-danger border-red-100")}>
                  {(selectedTxDetail.type || selectedTxDetail.Type || "").toLowerCase() === "income" ? "+" : ""}{formatCurrency(selectedTxDetail.amount || selectedTxDetail.Amount)}
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-semibold text-text">{selectedTxDetail.category?.name || selectedTxDetail.Category?.name || "General"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-semibold text-text capitalize">{selectedTxDetail.status || selectedTxDetail.Status || "Approved"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Note</p>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">{selectedTxDetail.note || selectedTxDetail.Note || "-"}</p>
                </div>
              </div>

              {/* Items List (Dirender kalau transaksinya punya items) */}
              {(() => {
                if (isDetailLoading) {
                  return (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-xs font-bold">Narik detail belanjaan...</p>
                    </div>
                  );
                }

                const items = selectedTxDetail.transaction_items || selectedTxDetail.TransactionItems || selectedTxDetail.items || selectedTxDetail.Items || [];
                
                if (items.length > 0) {
                  return (
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Purchased Items</h4>
                      <div className="flex flex-col gap-3">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="bg-gray-100 text-gray-500 font-bold text-[10px] px-2 py-1 rounded-md mt-0.5 shrink-0">
                                {item.quantity || item.Quantity || item.qty || item.Qty || 1}x
                              </div>
                              <span className="text-sm font-semibold text-text break-words leading-tight">{item.description || item.Description || item.name || item.Name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-700 shrink-0">
                              {formatCurrency(item.total || item.Total || item.price || item.Price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return <p className="text-xs text-gray-400 text-center py-4 italic">Nggak ada list barang cuy.</p>;
              })()}

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
                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", (mobileMenuTx.type || mobileMenuTx.Type || "").toLowerCase() === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                    {(mobileMenuTx.type || mobileMenuTx.Type || "").toLowerCase() === "income" ? <Briefcase size={20}/> : <Receipt size={20}/>}
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text truncate">{mobileMenuTx.merchant || mobileMenuTx.Merchant}</h3>
                    <p className="text-xs text-gray-500">{formatCurrency(mobileMenuTx.amount || mobileMenuTx.Amount)}</p>
                 </div>
                 <button onClick={() => setMobileMenuTx(null)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={18}/></button>
              </div>
            </div>
            
            <div className="flex flex-col p-4 gap-2">
              {/* ================= MOBILE ACTION MENU ================= */}
              <button onClick={() => handleViewDetails(mobileMenuTx)} className="flex items-center gap-3 w-full p-4 text-sm font-semibold text-text hover:bg-gray-50 rounded-2xl">
                <FileText size={18} className="text-gray-400"/> View Details
              </button>
              <button onClick={() => handleDeleteTx(mobileMenuTx.id || mobileMenuTx.ID)} className="flex items-center gap-3 w-full p-4 text-sm font-semibold text-danger hover:bg-red-50 rounded-2xl">
                <Trash2 size={18} className="text-red-400"/> Delete Record
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Transactions;