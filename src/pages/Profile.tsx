import { 
  Shield, Bell, ChevronRight, Edit2, Smartphone, Key, LogOut, Mail, X, Camera
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import { useLogout } from "@/hooks/useLogout";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/services/api";

const Profile = () => {
  const logout = useLogout();
  const authStore = useAuthStore();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isGmailEnabled, setIsGmailEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✨ STATE BUAT MODAL EDIT PROFILE ✨
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State khusus buat upload foto
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile(); 
        const userData = res.data?.data || res.data; 
        
        if (userData) {
          setProfileData(userData);
          setIsGmailEnabled(userData.gmail_enabled || userData.GmailEnabled || false);
          authStore.setUser(userData);
        }

        const params = new URLSearchParams(window.location.search);
        if (params.get("sync") === "success") {
          setIsGmailEnabled(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleLinkGmail = async () => {
    try {
      const res = await authService.getGoogleAuthUrl();
      if (res.data && res.data.url) {
        window.location.href = res.data.url; 
      }
    } catch (err) {
      console.error("Gagal dapet URL:", err);
    }
  };

  // 📸 Fungsi buat handle pas milih foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Bikin URL sementara buat nampilin preview foto yang baru dipilih
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  // 📝 Fungsi pas klik buka modal
  const openEditModal = () => {
    setEditName(profileData?.name || profileData?.Name || "");
    setAvatarFile(null);
    setAvatarPreview(null); // Reset preview
    setShowEditModal(true);
  };

  // 💾 Fungsi simpan data (Support Multipart Form Data)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return alert("Nama nggak boleh kosong cuy!");
    
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      // ✨ Kodenya jadi sebersih ini sekarang ✨
      await authService.updateProfile(formData);

      // SIMULASI UPDATE UI
      const updatedData = { ...profileData, name: editName, Name: editName };
      if (avatarPreview) {
        updatedData.avatar = avatarPreview;
      }
      
      setProfileData(updatedData);
      authStore.setUser(updatedData);
      setShowEditModal(false);
      
      alert("Profile berhasil diupdate!");
    } catch (error) {
      console.error("Gagal update profile", error);
      alert("Gagal update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const userName = profileData?.name || profileData?.Name || "User";
  const userEmail = profileData?.email || profileData?.Email || "-";
  const userTier = (profileData?.account_tier || profileData?.AccountTier || "free").toUpperCase();
  const joinedDate = formatDate(profileData?.created_at || profileData?.CreatedAt);
  
  // Logic penentuan foto profil (Preview > Backend > Default UI Avatars)
  const currentAvatarUrl = profileData?.avatar && profileData.avatar !== 'default-avatar.png' 
    ? profileData.avatar 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0066cc&color=fff&bold=true&size=120`;

  return (
    <>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/30 relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4 pb-28 lg:pb-6 w-full max-w-4xl mx-auto block">
          <div className="flex flex-col gap-6">
            
            {/* HEADER PROFILE */}
            <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group cursor-pointer" onClick={openEditModal}>
                <img 
                  src={currentAvatarUrl} 
                  alt="Profile" 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-sm object-cover"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit2 size={24} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start">
                <h2 className="text-2xl font-bold text-text">
                  {loading ? "Loading..." : userName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Money Saver User</p> 
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 w-full">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${userTier === 'PRO' ? 'bg-blue-50 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                    <Shield size={14} /> {userTier} MEMBER
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Joined {joinedDate}</p>
                </div>
              </div>
              
              <Button 
                onClick={openEditModal} 
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl font-bold text-sm shadow-sm gap-2"
              >
                <Edit2 size={16} /> Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 flex flex-col gap-6">
                {/* PERSONAL INFORMATION */}
                <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-text mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                      <div className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 text-text">
                        {loading ? "..." : userName}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                      <div className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 text-text">
                        {loading ? "..." : userEmail}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMAIL INTEGRATION (Tidak ada yang diubah) */}
                <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text">Email Integration</h3>
                    {!isGmailEnabled && (
                      <button onClick={handleLinkGmail} className="text-primary text-sm font-bold hover:underline">
                        + Connect Gmail
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className={`p-4 border rounded-xl flex items-center justify-between transition-colors ${isGmailEnabled ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isGmailEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Mail size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-text text-sm">
                            {isGmailEnabled ? "Mandiri Livin' Synced" : "Not Connected"}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {isGmailEnabled ? "Auto-parsing active for Mandiri" : "Connect to auto-sync transactions"}
                          </p>
                        </div>
                      </div>
                      {isGmailEnabled ? (
                        <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded">Active</span>
                      ) : (
                        <ChevronRight size={18} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PREFERENCES & DANGER ZONE (Tidak ada yang diubah) */}
              <div className="md:col-span-5 flex flex-col gap-6">
                <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-text mb-4">Preferences</h3>
                  <div className="flex flex-col gap-1">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                      <div className="flex items-center gap-3 text-gray-600 group-hover:text-text transition-colors">
                        <Bell size={18} />
                        <span className="text-sm font-semibold">Push Notifications</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                      <div className="flex items-center gap-3 text-gray-600 group-hover:text-text transition-colors">
                        <Key size={18} />
                        <span className="text-sm font-semibold">Security & PIN</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                      <div className="flex items-center gap-3 text-gray-600 group-hover:text-text transition-colors">
                        <Smartphone size={18} />
                        <span className="text-sm font-semibold">Device Management</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                    </button>
                  </div>
                </div>

                <div className="bg-surface rounded-3xl border border-red-100 shadow-sm p-6 bg-red-50/30">
                  <h3 className="font-bold text-danger mb-2">Danger Zone</h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">Permanently delete your account and all of your transaction data. This action cannot be undone.</p>
                  <Button variant="outline" className="w-full py-2.5 rounded-xl border-red-200 text-danger hover:bg-danger hover:text-white font-bold text-sm transition-colors">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>

            <div className="block lg:hidden mt-2 mb-4 px-1">
              <Button 
                variant="outline" 
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-danger border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 flex items-center justify-center gap-2 transition-colors shadow-sm"
                onClick={logout}
              >
                <LogOut size={18} /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ✨ OVERLAY MODAL EDIT PROFILE ✨ */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-text">Edit Profile</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-5 sm:p-6 overflow-y-auto">
              <div className="flex flex-col gap-6">
                
                {/* 📸 SECTION UPLOAD FOTO */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img 
                      // Pake preview kalau user milih gambar baru, kalau nggak pake gambar saat ini
                      src={avatarPreview || currentAvatarUrl} 
                      alt="Avatar Preview" 
                      className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-sm object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  
                  {/* Hidden Input File */}
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary text-sm font-bold hover:underline"
                    >
                      Change Picture
                    </button>
                    <p className="text-[10px] text-gray-400 mt-1">JPG or PNG. Max size 2MB.</p>
                  </div>
                </div>

                {/* 📝 SECTION INPUT NAMA & EMAIL */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Masukkan nama lu..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      disabled
                      value={userEmail}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Gunakan menu Security & PIN untuk mengubah email.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1 py-3 rounded-xl text-sm font-bold shadow-sm"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;