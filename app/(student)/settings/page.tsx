"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { updateUserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Bell,
  Eye,
  Sparkles
} from "lucide-react";

export default function SettingsPage() {
  const { profile, user, refreshClaims } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhotoURL(profile.photoURL || "");
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await updateUserProfile(user.uid, {
        name,
        photoURL,
      });
      
      // Refresh claims/profile in context
      await refreshClaims();
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="space-y-4 mb-12">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
          <Sparkles className="w-3.5 h-3.5" />
          System Preferences
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
          Account <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Settings.</span>
        </h1>
        <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
          Manage your platform identity, security protocols, and account preferences across the Techverox network.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-sidebar border border-border rounded-4xl p-10 shadow-xl shadow-black/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Public Profile</h2>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-muted border-2 border-border overflow-hidden flex items-center justify-center">
                    {photoURL ? (
                      <img 
                        src={photoURL} 
                        alt={name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <span className="text-4xl font-bold text-primary">{name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-primary text-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-white">Profile Photo</h3>
                  <p className="text-xs text-secondary-text leading-relaxed max-w-xs">
                    This photo will be displayed on your certificates and public profile. Use a clear, professional image.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary-text ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl text-white font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 opacity-60">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary-text ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="email" 
                      disabled
                      value={profile?.email || ""}
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-border rounded-2xl text-zinc-400 font-medium cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 ml-1">Email cannot be changed for security reasons.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary-text ml-1">Avatar URL</label>
                <div className="relative">
                  <Eye className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="url" 
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl text-white font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between gap-4">
                <div className="flex-1">
                  {success && (
                    <div className="flex items-center gap-2 text-green-500 font-bold text-sm animate-in fade-in slide-in-from-left-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Profile updated successfully!
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center gap-2 text-danger font-bold text-sm animate-in fade-in slide-in-from-left-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-10 py-6 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/20 flex items-center gap-3 border-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </section>

          {/* Security Summary */}
          <section className="bg-sidebar border border-border rounded-4xl p-10 shadow-xl shadow-black/20 overflow-hidden relative group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Security & Privacy</h2>
            </div>
            
            <p className="text-secondary-text text-sm leading-relaxed mb-6">
              Your data is encrypted and stored securely. We never share your personal information with third parties.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 rounded-xl bg-muted border border-border text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Two-Factor Auth Enabled
              </div>
              <div className="px-4 py-2 rounded-xl bg-muted border border-border text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> SSL Encryption Active
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <div className="bg-muted border border-border rounded-4xl p-8 space-y-6">
            <h3 className="font-bold text-white uppercase tracking-widest text-xs">Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-sidebar border border-border/50">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-white">Notifications</span>
                </div>
                <div className="w-10 h-6 rounded-full bg-primary p-1 flex justify-end cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-sidebar border border-border/50 opacity-50">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-white">Dark Mode</span>
                </div>
                <div className="w-10 h-6 rounded-full bg-zinc-800 p-1 flex justify-start cursor-not-allowed">
                  <div className="w-4 h-4 rounded-full bg-zinc-600 shadow-sm" />
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-zinc-500 italic">More settings coming soon to enhance your experience.</p>
          </div>

          <div className="p-8 rounded-4xl bg-linear-to-br from-danger/20 to-transparent border border-danger/10">
            <h3 className="font-bold text-danger text-sm mb-2">Danger Zone</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="w-full py-3 bg-danger/10 text-danger text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-danger hover:text-white transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
