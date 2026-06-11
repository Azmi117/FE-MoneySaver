import React, { useState, useEffect } from "react";
import { 
  Briefcase, Plus, Users, UserPlus, Trash2, Edit2, Shield, ChevronRight,
  Settings, Send, X, MailCheck, Tags,
  IceCream, Cookie, Utensils, Banknote, Code, Star, Film, CircleDashed, TrendingUp
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/store/useAuthStore";
import { workspaceService } from "@/services/workspaceService";
import { categoryService } from "@/services/categoryService";

const iconMap: Record<string, any> = {
  'ice-cream': IceCream, 'snack': Cookie, 'rice': Utensils, 'money': Banknote, 'code': Code, 'star': Star, 'fa-film': Film,
};

const CategoryIcon = ({ iconName, type }: { iconName: string, type: string }) => {
  const IconComponent = iconMap[iconName] || CircleDashed;
  const isIncome = type === 'income' || type === 'INCOME';
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isIncome ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100")}>
      <IconComponent size={16} />
    </div>
  );
};

const Workspaces = () => {
  const user = useAuthStore((state) => state.user);
  const currentUserId = user ? (user.id || user.ID) : 0; 
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceType, setNewWorkspaceType] = useState<"budgeting" | "split">("budgeting");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetForm, setTargetForm] = useState({ period: new Date().toISOString().slice(0, 7), amountLimit: 0, savingsTarget: 0 });
  const [inviteEmail, setInviteEmail] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("expense");
  const [categoryIcon, setCategoryIcon] = useState("money");
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [wsRes, invRes] = await Promise.all([
          workspaceService.getWorkspaces(),
          workspaceService.getPendingInvitations()
        ]);
        if (wsRes?.data) {
          const fetchedWorkspaces = wsRes.data;
          setWorkspaces(fetchedWorkspaces);
          if (fetchedWorkspaces.length > 0) setSelectedId(fetchedWorkspaces[0].id || fetchedWorkspaces[0].ID);
        }
        if (invRes?.data) setInvitations(invRes.data);
      } catch (error) { console.error("Gagal narik data awal:", error); }
      finally { setIsLoading(false); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const fetchDetailData = async () => {
      try {
        const [memRes, catRes, sumRes] = await Promise.all([
          workspaceService.getMembers(selectedId),
          categoryService.getByWorkspace(selectedId),
          workspaceService.getSummary(selectedId)
        ]);
        if (memRes?.data) setMembers(memRes.data);
        if (catRes?.data) setCategories(catRes.data);
        if (sumRes?.data) setSummary(sumRes.data);
      } catch (error) {
        console.error("Gagal narik detail workspace:", error);
        setMembers([]); setCategories([]); setSummary(null);
      }
    };
    fetchDetailData();
  }, [selectedId]);

  const currentWorkspace = workspaces.find(ws => (ws.id || ws.ID) === selectedId);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      const res = await workspaceService.createWorkspace({ name: newWorkspaceName, type: newWorkspaceType });
      if(res?.data) {
         setWorkspaces([...workspaces, res.data]);
         setSelectedId(res.data.id || res.data.ID);
      }
      setShowCreateModal(false); setNewWorkspaceName(""); setNewWorkspaceType("budgeting");
      alert("Berhasil bikin workspace!");
    } catch (error) { alert("Gagal bikin workspace"); }
  };

  const handleRenameWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim() || !selectedId) return;
    try {
      await workspaceService.updateWorkspace(selectedId, { name: renameValue });
      setWorkspaces(workspaces.map(ws => (ws.id || ws.ID) === selectedId ? { ...ws, name: renameValue } : ws));
      setShowRenameModal(false); setRenameValue("");
    } catch (error) { alert("Gagal mengubah nama workspace"); }
  };

  const handleDeleteWorkspace = async () => {
    if (!selectedId) return;
    if (!window.confirm("Yakin mau hapus permanen workspace ini?")) return;
    try {
      await workspaceService.deleteWorkspace(selectedId);
      const sisaWorkspaces = workspaces.filter(ws => (ws.id || ws.ID) !== selectedId);
      setWorkspaces(sisaWorkspaces);
      if (sisaWorkspaces.length > 0) setSelectedId(sisaWorkspaces[0].id || sisaWorkspaces[0].ID);
      else setSelectedId(null);
      if (showMobileDrawer) setShowMobileDrawer(false);
    } catch (error) { alert("Gagal menghapus workspace"); }
  };

  const handleSetTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      await workspaceService.setTarget({ 
        workspace_id: selectedId, 
        period: targetForm.period, 
        amount_limit: parseFloat(targetForm.amountLimit.toString()), 
        savings_target: parseFloat(targetForm.savingsTarget.toString()) 
      });
      
      alert("Target berhasil disimpan!");
      setShowTargetModal(false);

      // KIRIM PERIOD KE SINI BIAR DATANYA PAS
      const sumRes = await workspaceService.getSummary(selectedId, targetForm.period);
      if (sumRes?.data) setSummary(sumRes.data);
      
    } catch (error) { alert("Gagal menyimpan target"); }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedId) return;
    try {
      await workspaceService.inviteMember(selectedId, inviteEmail);
      alert(`Undangan berhasil dikirim ke ${inviteEmail}`);
      setInviteEmail("");
    } catch (error) { alert("Gagal mengirim undangan."); }
  };

  const handleAcceptInvite = async (inviteId: number, workspaceName: string) => {
    try {
      await workspaceService.acceptInvitation(inviteId);
      setInvitations(invitations.filter(i => i.id !== inviteId));
      const wsRes = await workspaceService.getWorkspaces();
      if (wsRes?.data) setWorkspaces(wsRes.data);
      alert(`Berhasil join ${workspaceName}!`);
    } catch (error) { alert("Gagal nerima undangan"); }
  };

  const handleDeclineInvite = async (inviteId: number) => {
    try {
      await workspaceService.rejectInvitation(inviteId);
      setInvitations(invitations.filter(i => i.id !== inviteId));
    } catch (error) { alert("Gagal nolak undangan"); }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || !selectedId) return;
    try {
      const payload = { name: categoryName, type: categoryType, icon: categoryIcon };
      const res = await categoryService.create(selectedId, payload);
      if (res?.data) {
        setCategories([...categories, res.data]);
      } else {
        const catRes = await categoryService.getByWorkspace(selectedId);
        if (catRes?.data) setCategories(catRes.data);
      }
      setShowCategoryModal(false); setCategoryName(""); setCategoryType("expense"); setCategoryIcon("money");
      alert("Kategori berhasil dibuat!");
    } catch (error) { alert("Gagal membuat kategori baru"); }
  };

  const handleSelectWorkspace = (id: number) => {
    setSelectedId(id);
    if (window.innerWidth < 1024) setShowMobileDrawer(true);
  };

  const renderWorkspaceDetailPanels = (ws: any, mems: any[], cats: any[]) => {
    if (!ws) return null;
    const isOwner = (ws.owner_id || ws.OwnerID) === currentUserId;
    
    return (
      <div className="flex flex-col gap-6 pb-8 lg:pb-0">
        <div className="bg-surface lg:border lg:border-gray-100 rounded-2xl lg:rounded-3xl p-6 lg:shadow-sm flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-text">{ws.name}</h2>
            <p className="text-sm text-gray-500 mt-1 capitalize flex items-center gap-2">
              <Shield size={14} /> {isOwner ? 'owner' : 'member'}
            </p>
          </div>
          <span className={cn("px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase", ws.type === "split" ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-green-50 text-green-600 border border-green-100")}>
            {ws.type === "split" ? "Split Bill" : "Budgeting"}
          </span>
        </div>

        <div className="bg-surface lg:border lg:border-gray-100 rounded-2xl lg:rounded-3xl lg:p-6 lg:shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-primary rounded-xl shrink-0"><Users size={20} /></div>
              <div>
                <h3 className="font-bold text-text text-lg">Members</h3>
                <p className="text-xs text-gray-500">{mems.length} people have access</p>
              </div>
            </div>
          </div>
          {isOwner && (
            <form className="flex gap-3 items-end bg-gray-50/60 p-4 rounded-2xl border border-gray-100" onSubmit={handleInviteMember}>
              <div className="flex-1">
                <Input type="email" label="Invite New" placeholder="Email address" value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} className="bg-white" />
              </div>
              <Button type="submit" className="py-3 px-4 rounded-xl text-xs font-bold shrink-0 h-[46px]"><UserPlus size={16}/></Button>
            </form>
          )}
          <div className="flex flex-col divide-y divide-gray-50">
            {mems.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No members found.</p>}
            {mems.map((member) => {
               const memberId = member.id || member.ID || member.user_id || member.UserID;
               const memberName = member.name || member.user?.name || 'User';
               const memberEmail = member.email || member.user?.email || '';
               const memberRole = ((ws.owner_id || ws.OwnerID) === memberId) ? 'owner' : 'member';
               return (
                <div key={memberId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=f0f4ff&color=0066cc&bold=true`} alt="" className="w-9 h-9 rounded-full"/>
                    <div>
                      <h4 className="font-bold text-text text-sm">{memberName}</h4>
                      <p className="text-xs text-gray-500">{memberEmail}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded capitalize tracking-wide", memberRole === "owner" ? "bg-blue-50 text-primary border border-blue-100" : "bg-gray-50 text-gray-500")}>{memberRole}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface lg:border lg:border-gray-100 rounded-2xl lg:rounded-3xl lg:p-6 lg:shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2.5 bg-[#229ED9]/10 text-[#229ED9] rounded-xl shrink-0"><Send size={20} /></div>
            <div><h3 className="font-bold text-text text-lg">Telegram Group</h3><p className="text-xs text-gray-500">Log transactions via chat</p></div>
          </div>
          <div className="flex flex-col gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-text text-sm">Status</h4>
                {ws.TelegramChatID ? (
                  <span className="text-[10px] bg-green-100 text-success px-2.5 py-1 rounded-full font-bold">Connected</span>
                ) : (
                  <span className="text-[10px] bg-gray-200 text-gray-500 px-2.5 py-1 rounded-full font-bold">Disconnected</span>
                )}
            </div>
            {!ws.TelegramChatID && (
               <div className="flex items-center justify-between bg-white border border-gray-200 p-1 rounded-xl">
                 <code className="text-sm font-bold text-primary px-3 py-1.5 rounded-lg border border-blue-100">/init {ws.id || ws.ID}</code>
               </div>
            )}
          </div>
        </div>

        <div className="bg-surface lg:border lg:border-gray-100 rounded-2xl lg:rounded-3xl p-6 lg:shadow-sm mb-2">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl shrink-0"><TrendingUp size={20} /></div>
              <div>
                <h3 className="font-bold text-text text-lg">Financial Summary</h3>
                <p className="hidden lg:flex text-xs text-gray-500">Monitor budget & tabungan lu</p>
              </div>
            </div>
            {isOwner && (
              <Button onClick={() => setShowTargetModal(true)} className="py-2 px-3 rounded-xl text-xs font-bold shrink-0 h-[36px] gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                 Set Target
              </Button>
            )}
          </div>
          {summary ? (
            <div className="flex flex-col gap-5">
              
              {/* --- BUDGET LIMIT RENDER --- */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-700">Budget Spent</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 font-medium">Rp {summary.budget_spent?.toLocaleString('id-ID')} / </span>
                    <span className="text-sm font-bold text-gray-800">Rp {summary.budget_limit?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                
                {/* LOGIC CEK: Kalau budget_limit ada ( > 0 ), baru tampilkan progress bar */}
                {summary.budget_limit && summary.budget_limit > 0 ? (
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", (summary.budget_spent / summary.budget_limit) > 0.8 ? "bg-red-500" : "bg-primary")} 
                         style={{ width: `${Math.min((summary.budget_spent / summary.budget_limit) * 100, 100)}%` }}>
                    </div>
                  </div>
                ) : (
                  <div className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                    Budget belum di-set
                  </div>
                )}
              </div>

              {/* --- SAVINGS TARGET RENDER --- */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-700">Savings Target</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 font-medium">Rp {summary.savings_current?.toLocaleString('id-ID')} / </span>
                    <span className="text-sm font-bold text-gray-800">Rp {summary.savings_target?.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* LOGIC CEK: Kalau savings_target ada ( > 0 ), baru tampilkan progress bar */}
                {summary.savings_target && summary.savings_target > 0 ? (
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" 
                         style={{ width: `${Math.min((summary.savings_current / summary.savings_target) * 100, 100)}%` }}>
                    </div>
                  </div>
                ) : (
                  <div className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                    Target nabung belum di-set
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Income</p>
                  <p className="text-sm font-bold text-green-600">Rp {summary.total_income?.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Expense</p>
                  <p className="text-sm font-bold text-red-600">Rp {summary.total_expense?.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          ) : <p className="text-xs text-gray-400 text-center py-4">Belum ada data summary.</p>}
        </div>

        <div className="bg-surface lg:border lg:border-gray-100 rounded-2xl lg:rounded-3xl p-6 lg:shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-primary rounded-xl shrink-0"><Tags size={20} /></div>
              <div>
                <h3 className="font-bold text-text text-lg">Categories</h3>
                <p className="hidden lg:flex text-xs text-gray-500">Manage transaction categories</p>
              </div>
            </div>
            {isOwner && (
              <Button onClick={() => setShowCategoryModal(true)} className="py-2 px-3 rounded-xl text-xs font-bold shrink-0 h-[36px] gap-1.5">
                <Plus size={16} /> New
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {cats.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No categories found.</p>}
            {cats.map((cat, index) => {
              const catType = cat.type || 'expense';
              return (
                <div key={cat.id || cat.ID || index} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-primary/30 transition-colors group bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <CategoryIcon iconName={cat.icon} type={catType} />
                    <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 font-bold rounded-md tracking-wide capitalize", catType.toLowerCase() === 'income' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>{catType.toLowerCase()}</span>
                  </div>
                  {isOwner && (
                    <button className="text-gray-300 hover:text-red-500 transition-colors lg:opacity-0 lg:group-hover:opacity-100 p-2">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {isOwner && (
          <div className="bg-surface lg:border lg:border-red-50 rounded-2xl lg:rounded-3xl lg:p-6 lg:shadow-sm flex flex-col gap-5 border border-red-50 p-5">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="p-2.5 bg-red-50 text-danger rounded-xl shrink-0"><Settings size={20} /></div>
              <h3 className="font-bold text-text text-lg">Danger Zone</h3>
            </div>
            <Button onClick={() => { setRenameValue(ws.name); setShowRenameModal(true); }} variant="outline" fullWidth className="text-xs rounded-xl gap-1.5 bg-white font-semibold">
              <Edit2 size={14} /> Rename
            </Button>
            <Button onClick={handleDeleteWorkspace} fullWidth className="bg-danger hover:bg-red-700 text-xs gap-1.5 rounded-xl font-bold shadow-sm">
              <Trash2 size={14}/> Delete Permanent
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold">Loading workspaces...</div>;

  return (
    <>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative pt-2 lg:pt-0">
        <div className="flex-1 flex overflow-hidden pt-6 px-6 gap-6 max-w-7xl w-full mx-auto lg:pb-6 relative">
          <div className={cn("w-full flex flex-col gap-4 overflow-y-auto pr-2 pb-32 lg:pb-10", "lg:w-54 xl:w-80 shrink-0")}>
            {invitations.length > 0 && (
              <div className="">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Pending Invites</h3>
                <div className="max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                  {invitations.map(invite => (
                    <div key={invite.id} className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col gap-3 mb-2">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs"><MailCheck size={16}/> Invited to join</div>
                      <p className="text-sm font-bold text-text">{invite.workspaceName || invite.workspace_name}</p>
                      <p className="text-xs text-gray-500">by {invite.sender}</p>
                      <div className="flex gap-2">
                        <Button onClick={() => handleAcceptInvite(invite.id, invite.workspaceName)} className="flex-1 py-2 text-[10px] font-bold">Accept</Button>
                        <Button variant="outline" onClick={() => handleDeclineInvite(invite.id)} className="flex-1 py-2 text-[10px] font-bold bg-white">Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col-reverse lg:flex-col gap-3 lg:gap-4 mb-2 lg:mb-0">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Your Accounts</h3>
              <div className="flex justify-end lg:block">
                <Button onClick={() => setShowCreateModal(true)} className="py-2.5 lg:py-2 px-5 lg:px-4 rounded-xl text-xs gap-1.5 font-bold w-auto lg:w-full shadow-sm">
                  <Plus size={16} /> New
                </Button>
              </div>
            </div>
            {workspaces.length === 0 && <p className="text-xs text-gray-400 px-1">Belum ada workspace.</p>}
            <div className="flex flex-col gap-3 pr-1">
              {workspaces.map((ws) => {
                const wsId = ws.id || ws.ID;
                const isTelegramConnected = ws.TelegramChatID !== null && ws.TelegramChatID !== 0 && ws.TelegramChatID !== undefined;
                const ownerId = ws.owner_id || ws.OwnerID;
                const userRole = (ownerId === currentUserId) ? 'owner' : 'member'; 
                return (
                  <div key={wsId} onClick={() => handleSelectWorkspace(wsId)} className={cn("shrink-0 p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 bg-surface", selectedId === wsId ? "border-primary shadow-sm lg:ring-1 lg:ring-primary/30" : "border-gray-100 hover:border-gray-200")}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative transition-colors", selectedId === wsId ? "bg-primary text-white" : "bg-gray-50 text-gray-400")}>
                        <Briefcase size={22} />
                        {isTelegramConnected && (<span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#229ED9] border-2 border-surface rounded-full"></span>)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-text text-base truncate">{ws.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500 capitalize flex items-center gap-1"><Shield size={12}/>{userRole}</p>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider", ws.type === "split" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600")}>{ws.type === "split" ? "Split Bill" : "Budgeting"}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 lg:hidden shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hidden lg:flex flex-1 flex-col overflow-y-auto pl-2 pr-1 pb-10">
             {currentWorkspace ? renderWorkspaceDetailPanels(currentWorkspace, members, categories) : <div className="text-center text-gray-400 mt-20">Pilih workspace untuk melihat detail</div>}
          </div>
        </div>
      </div>
      {showMobileDrawer && (<div className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200" onClick={() => setShowMobileDrawer(false)}/>)}
      <div className={cn("lg:hidden fixed bottom-0 left-0 w-full bg-surface z-50 rounded-t-3xl shadow-xl flex flex-col transition-transform duration-300 ease-out pb-safe max-h-[90vh]", showMobileDrawer ? "transform-none" : "translate-y-full")}>
        <div className="w-full shrink-0 flex flex-col items-center pt-3 pb-2 cursor-pointer border-b border-gray-50" onClick={() => setShowMobileDrawer(false)}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4"></div>
            <div className="w-full flex items-center justify-between px-6 mb-2">
                <h2 className="text-xl font-bold text-text truncate pr-4">{currentWorkspace?.name}</h2>
                <button onClick={(e) => { e.stopPropagation(); setShowMobileDrawer(false); }} className="p-1 text-gray-400 bg-gray-100 rounded-full shrink-0"><X size={18}/></button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
            {currentWorkspace && renderWorkspaceDetailPanels(currentWorkspace, members, categories)}
        </div>
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl w-full max-w-sm p-6 shadow-xl border border-gray-100 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-text">New Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
              <Input type="text" label="Name" placeholder="e.g. Uang Kas Kosan" value={newWorkspaceName} onChange={(e)=>setNewWorkspaceName(e.target.value)} autoFocus />
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe Workspace</label>
                <div className="flex gap-3">
                  <div onClick={() => setNewWorkspaceType("budgeting")} className={cn("flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all", newWorkspaceType === "budgeting" ? "border-primary bg-blue-50 text-primary" : "border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:border-gray-200")}>
                    <span className="text-sm font-bold">Budgeting</span><span className="text-[10px] text-center font-medium mt-1">Nabung & Catat Kas</span>
                  </div>
                  <div onClick={() => setNewWorkspaceType("split")} className={cn("flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all", newWorkspaceType === "split" ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:border-gray-200")}>
                    <span className="text-sm font-bold">Split Bill</span><span className="text-[10px] text-center font-medium mt-1">Khusus Patungan</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <Button type="button" variant="ghost" onClick={()=>setShowCreateModal(false)} className="text-xs font-semibold">Cancel</Button>
                <Button type="submit" className="text-xs font-bold">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl w-full max-w-sm p-6 shadow-xl border border-gray-100 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-text">Rename Workspace</h3>
            <form onSubmit={handleRenameWorkspace} className="flex flex-col gap-4">
              <Input type="text" label="New Name" placeholder="Masukkan nama baru..." value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus />
              <div className="flex gap-3 justify-end mt-2">
                <Button type="button" variant="ghost" onClick={() => setShowRenameModal(false)} className="text-xs font-semibold">Cancel</Button>
                <Button type="submit" className="text-xs font-bold">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl w-full max-w-sm p-6 shadow-xl border border-gray-100 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-text">Set Monthly Target</h3>
            <form onSubmit={handleSetTarget} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Periode</label>
                <input 
                  type="month"
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-text text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={targetForm.period}
                  onChange={(e) => setTargetForm({...targetForm, period: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Budget Limit (Batas Pengeluaran)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full bg-gray-50 border border-gray-200 text-text text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. 5000000"
                  value={targetForm.amountLimit}
                  onChange={(e) => setTargetForm({...targetForm, amountLimit: Number(e.target.value)})}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Savings Target (Target Nabung)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full bg-gray-50 border border-gray-200 text-text text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. 1500000"
                  value={targetForm.savingsTarget}
                  onChange={(e) => setTargetForm({...targetForm, savingsTarget: Number(e.target.value)})}
                />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <Button type="button" variant="ghost" onClick={() => setShowTargetModal(false)} className="text-xs font-semibold">Cancel</Button>
                <Button type="submit" className="text-xs font-bold">Save Target</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl w-full max-w-sm p-6 shadow-xl border border-gray-100 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-text">New Category</h3>
            <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
              <Input 
                type="text" 
                label="Category Name" 
                placeholder="e.g. Makan Siang" 
                value={categoryName} 
                onChange={(e) => setCategoryName(e.target.value)} 
                autoFocus 
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 text-text text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value)}
                >
                  <option value="expense">Expense (Pengeluaran)</option>
                  <option value="income">Income (Pemasukan)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Icon</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 text-text text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={categoryIcon}
                  onChange={(e) => setCategoryIcon(e.target.value)}
                >
                  {Object.keys(iconMap).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <Button type="button" variant="ghost" onClick={() => setShowCategoryModal(false)} className="text-xs font-semibold">Cancel</Button>
                <Button type="submit" className="text-xs font-bold">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ... (Modal Rename, Category, Target tetap sama) ... */}
    </>
  );
};
export default Workspaces;