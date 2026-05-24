import { 
    Shield, Bell, ChevronRight, Edit2, Smartphone, Key, Building
} from "lucide-react";
import Button from "@/components/ui/Button";

const Profile = () => {
  return (
    <>
      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/30">

        {/* CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 pb-28 lg:pb-10 w-full max-w-4xl mx-auto block">
          <div className="flex flex-col gap-6">
            
            {/* PROFILE CARD */}
            <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group cursor-pointer">
                <img 
                  src="https://ui-avatars.com/api/?name=Software+Engineer&background=0066cc&color=fff&bold=true&size=120" 
                  alt="Profile" 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-sm object-cover"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit2 size={24} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start">
                <h2 className="text-2xl font-bold text-text">Azmi K.</h2>
                <p className="text-sm text-gray-500 mt-1">Backend Developer</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 w-full">
                  <div className="bg-blue-50 text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Shield size={14} /> Pro Member
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Joined March 2026</p>
                </div>
              </div>
              
              <Button className="w-full sm:w-auto py-2.5 px-6 rounded-xl font-bold text-sm shadow-sm gap-2">
                <Edit2 size={16} /> Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Account Details */}
              <div className="md:col-span-7 flex flex-col gap-6">
                
                <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-text mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                      <div className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 text-text">Azmi K.</div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                      <div className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 text-text">azmi.dev@example.com</div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                      <div className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 text-text">+62 812 3456 7890</div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text">Connected Banks</h3>
                    <button className="text-primary text-sm font-bold hover:underline">+ Add Bank</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                          <Building size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-text text-sm">OCTO Savers Plus</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Active for auto-sync</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Settings & Preferences */}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;