import React, { useState } from "react";
import { 
  Briefcase, Plus, Users, UserPlus, Trash2, Edit2, Shield, ChevronRight,
  Settings, Send, Copy, Unplug, X
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const initialWorkspaces = [
  { id: 1, name: "Personal Workspace", role: "owner", membersCount: 1, telegramConnected: false },
  { id: 2, name: "Kosan Patungan", role: "member", membersCount: 4, telegramConnected: true },
  { id: 3, name: "Bisnis Online", role: "owner", membersCount: 2, telegramConnected: true },
];

const workspaceMembers: Record<number, any[]> = {
  1: [{ id: 101, name: "Azmi K.", email: "azmi@company.com", role: "owner" }],
  2: [
    { id: 102, name: "Kenny Hoi", email: "kennyhoii669@gmail.com", role: "owner" },
    { id: 101, name: "Azmi K.", email: "azmi@company.com", role: "member" },
    { id: 103, name: "Zaki Ananda", email: "zaki@gmail.com", role: "member" },
    { id: 104, name: "Rizky F.", email: "rizky@gmail.com", role: "member" },
  ],
  3: [
    { id: 101, name: "Azmi K.", email: "azmi@company.com", role: "owner" },
    { id: 105, name: "Budi J.", email: "budi@gmail.com", role: "member" },
  ]
};

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const currentWorkspace = workspaces.find(ws => ws.id === selectedId) || workspaces[0];
  const currentMembers = workspaceMembers[currentWorkspace.id] || [];

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    setWorkspaces([...workspaces, { id: workspaces.length+1, name: newWorkspaceName, role: "owner", membersCount: 1, telegramConnected: false }]);
    setNewWorkspaceName("");
    setShowCreateModal(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`); 
  };

  const handleSelectWorkspace = (id: number) => {
    setSelectedId(id);
    if (window.innerWidth < 1024) {
      setShowMobileDrawer(true);
    }
  };

  const WorkspaceDetailPanels = ({ ws, members }: { ws: any, members: any[] }) => (
    <div className="flex flex-col gap-6 pb-8 lg:pb-0">
      
      {/* PANEL 1: KELOLA MEMBER */}
      <div className="bg-surface lg:border lg:border-gray-100 rounded-2xl lg:rounded-3xl lg:p-6 lg:shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-primary rounded-xl shrink-0"><Users size={20} /></div>
            <div>
              <h3 className="font-bold text-text text-lg">Members</h3>
              <p className="text-xs text-gray-500">{members.length} people have access</p>
            </div>
          </div>
        </div>
        {ws.role === "owner" && (
          <form className="flex gap-3 items-end bg-gray-50/60 p-4 rounded-2xl border border-gray-100" onSubmit={(e)=>e.preventDefault()}>
            <div className="flex-1"><Input type="email" label="Invite New" placeholder="Email address" value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} className="bg-white" /></div>
            <Button type="submit" className="py-3 px-4 rounded-xl text-xs font-bold shrink-0 h-[46px]"><UserPlus size={16}/></Button>
          </form>
        )}
        <div className="flex flex-col divide-y divide-gray-50">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f0f4ff&color=0066cc&bold=true`} alt="" className="w-9 h-9 rounded-full"/>
                <div><h4 className="font-bold text-text text-sm">{member.name}</h4><p className="text-xs text-gray-500">{member.email}</p></div>
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded capitalize tracking-wide", member.role === "owner" ? "bg-blue-50 text-primary border border-blue-100" : "bg-gray-50 text-gray-500")}>{member.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL 2: TELEGRAM INTEGRATION */}
      <div className="bg-surface lg:border lg:border-gray-100 rounded-2xl lg:rounded-3xl lg:p-6 lg:shadow-sm flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
          <div className="p-2.5 bg-[#229ED9]/10 text-[#229ED9] rounded-xl shrink-0"><Send size={20} /></div>
          <div><h3 className="font-bold text-text text-lg">Telegram Bot</h3><p className="text-xs text-gray-500">Log transactions via chat</p></div>
        </div>
        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-text text-sm">Status</h4>
              {ws.telegramConnected ? (<span className="text-[10px] bg-green-100 text-success px-2.5 py-1 rounded-full font-bold">Connected</span>) : (<span className="text-[10px] bg-gray-200 text-gray-500 px-2.5 py-1 rounded-full font-bold">Disconnected</span>)}
          </div>
          
          {!ws.telegramConnected ? (
            <div className="flex items-center justify-between bg-white border border-gray-200 p-1 rounded-xl">
               <code className="text-sm font-bold text-primary px-3 py-1.5 rounded-lg border border-blue-100">/init {ws.id}</code>
               <button onClick={()=>copyToClipboard(`/init ${ws.id}`)} className="p-2 text-gray-400 hover:text-primary"><Copy size={16}/></button>
            </div>
          ) : ws.role === "owner" ? (
            <Button variant="outline" fullWidth className="text-xs py-2 px-4 rounded-xl border-gray-300 gap-1.5 bg-white text-danger hover:bg-red-50 border-red-200/50"><Unplug size={14} /> Disconnect Bot</Button>
          ) : null}
        </div>
      </div>

      {/* PANEL 3: SETTINGS */}
      {ws.role === "owner" && (
        <div className="bg-surface lg:border lg:border-red-50 rounded-2xl lg:rounded-3xl lg:p-6 lg:shadow-sm flex flex-col gap-5 border border-red-50 p-5">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2.5 bg-red-50 text-danger rounded-xl shrink-0"><Settings size={20} /></div>
            <h3 className="font-bold text-text text-lg">Danger Zone</h3>
          </div>
          <Button variant="outline" fullWidth className="text-xs rounded-xl gap-1.5 bg-white font-semibold"><Edit2 size={14} /> Rename</Button>
          <Button fullWidth className="bg-danger hover:bg-red-700 text-xs gap-1.5 rounded-xl font-bold shadow-sm"><Trash2 size={14}/> Delete Permanent</Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* MAIN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-surface lg:bg-background/80 lg:backdrop-blur-md px-6 py-5 border-b border-gray-100 flex items-center justify-between z-20">
          <h1 className="text-2xl font-bold text-text">Workspaces</h1>
          <Button onClick={() => setShowCreateModal(true)} className="py-2 px-4 rounded-xl text-xs gap-1.5 font-bold"><Plus size={16} /> New</Button>
        </header>

        <div className="flex-1 flex overflow-hidden p-6 gap-6 max-w-7xl w-full mx-auto pb-28 lg:pb-6 relative">
          <div className={cn("w-full flex flex-col gap-4 overflow-y-auto pr-2", "lg:w-54 xl:w-80 shrink-0")}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Your Accounts</h3>
            {workspaces.map((ws) => (
              <div key={ws.id} onClick={() => handleSelectWorkspace(ws.id)} className={cn("p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 bg-surface", selectedId === ws.id ? "border-primary shadow-sm lg:ring-1 lg:ring-primary/30" : "border-gray-100 hover:border-gray-200")}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative transition-colors", selectedId === ws.id ? "bg-primary text-white" : "bg-gray-50 text-gray-400")}>
                    <Briefcase size={22} />
                    {ws.telegramConnected && (<span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#229ED9] border-2 border-surface rounded-full"></span>)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-text text-base truncate">{ws.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize flex items-center gap-1"><Shield size={12}/>{ws.role}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 lg:hidden shrink-0" />
              </div>
            ))}
          </div>
          <div className="hidden lg:flex flex-1 flex-col overflow-y-auto pl-2 pr-1 pb-10">
             <WorkspaceDetailPanels ws={currentWorkspace} members={currentMembers} />
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER (Udah dibenerin!) */}
      {showMobileDrawer && (<div className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200" onClick={() => setShowMobileDrawer(false)}/>)}
      <div className={cn(
        // Tambahin max-h-[90vh] biar laci nggak bablas ngelewatin atas layar
        "lg:hidden fixed bottom-0 left-0 w-full bg-surface z-50 rounded-t-3xl shadow-xl flex flex-col transition-transform duration-300 ease-out pb-safe max-h-[90vh]", 
        showMobileDrawer ? "transform-none" : "translate-y-full"
      )}>
        {/* Tambahin shrink-0 di header biar judul workspace & tombol silang gak kepencet ke atas */}
        <div className="w-full shrink-0 flex flex-col items-center pt-3 pb-2 cursor-pointer border-b border-gray-50" onClick={() => setShowMobileDrawer(false)}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4"></div>
            <div className="w-full flex items-center justify-between px-6 mb-2">
                <h2 className="text-xl font-bold text-text truncate pr-4">{currentWorkspace.name}</h2>
                <button onClick={(e) => { e.stopPropagation(); setShowMobileDrawer(false); }} className="p-1 text-gray-400 bg-gray-100 rounded-full shrink-0"><X size={18}/></button>
            </div>
        </div>
        {/* Hapus fixed height, ganti jadi flex-1 biar ngepas ke sisa ruang + bisa di-scroll */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
            <WorkspaceDetailPanels ws={currentWorkspace} members={currentMembers} />
        </div>
      </div>

      {/* MODAL CREATE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl w-full max-w-sm p-6 shadow-xl border border-gray-100 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-text">New Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
              <Input type="text" label="Name" placeholder="e.g. Uang Kas Kosan" value={newWorkspaceName} onChange={(e)=>setNewWorkspaceName(e.target.value)} autoFocus />
              <div className="flex gap-3 justify-end mt-2">
                <Button type="button" variant="ghost" onClick={()=>setShowCreateModal(false)} className="text-xs font-semibold">Cancel</Button>
                <Button type="submit" className="text-xs font-bold">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default Workspaces;