import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  BarChart3, Edit3, Share2, Bell, Calendar, Zap, CheckCircle, Plus, 
  AlertCircle, Users, Camera, Lock, Mail, User, LogOut, 
  ChevronRight, Eye, LayoutGrid, Settings, X 
} from 'lucide-react';

const Profile = ({ user, updateUser }) => {
  const [activeTab, setActiveTab] = useState('designs');
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [notification, setNotification] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showAllRecentDesigns, setShowAllRecentDesigns] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  const uploadToCloudinary = useCallback(async (file) => {
    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64Image = await base64Promise;
      const response = await fetch('http://localhost:5000/api/profile/upload-profile-picture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ base64Image }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Upload failed');
      return data.profilePictureUrl;
    } catch (error) {
      let errorMessage = error.message;
      if (error.message.includes('No authentication token')) errorMessage = 'Session expired. Please log in again.';
      throw new Error(errorMessage);
    }
  }, [user]);

  const showNotificationMessage = useCallback((message, type = 'success') => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification({ message, type });
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => () => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
  }, []);

  useEffect(() => {
    const fetchDesigns = async () => {
      setIsLoading(true);
      try {
        const authRes = await fetch('http://localhost:5000/api/auth/user', { credentials: 'include' });
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.success && authData.user) localStorage.setItem('user', JSON.stringify(authData.user));
        }
        let apiDesigns = [];
        const apiRes = await fetch('http://localhost:5000/api/designs/my-designs', { credentials: 'include' });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success && Array.isArray(apiData.designs)) {
            apiDesigns = apiData.designs.map(d => ({
              id: d._id, name: d.name, colors: d.customization?.colors || {},
              preview: d.imageUrl, imageUrl: d.imageUrl, createdAt: d.createdAt,
              category: 'AI Design', emoji: '✨'
            }));
          }
        }
        let localDesigns = [];
        const saved = localStorage.getItem('savedShoeDesigns');
        if (saved) {
          const parsed = JSON.parse(saved);
          const filtered = user?._id || user?.id ? parsed.filter(des => !des.userId || des.userId === (user._id || user.id)) : parsed;
          localDesigns = filtered.map(d => ({
            id: d.id, name: d.name, colors: d.colors || {}, preview: d.preview,
            createdAt: d.createdAt, category: 'Custom Design', emoji: '👟'
          }));
        }
        const map = new Map();
        [...localDesigns, ...apiDesigns].forEach(d => {
          const key = d.id || `${d.name}-${d.createdAt}`;
          map.set(key, d);
        });
        const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDesigns(merged);
      } catch (err) {
        showNotificationMessage('Failed to load designs', 'error');
        setDesigns([]);
      } finally { setIsLoading(false); }
    };
    fetchDesigns();
  }, [user, showNotificationMessage]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'savedShoeDesigns') {
        const saved = localStorage.getItem('savedShoeDesigns');
        if (saved) {
          const parsed = JSON.parse(saved);
          const filtered = user?._id || user?.id ? parsed.filter(des => !des.userId || des.userId === (user._id || user.id)) : parsed;
          const localDesigns = filtered.map(d => ({
            id: d.id, name: d.name, colors: d.colors || {}, preview: d.preview,
            createdAt: d.createdAt, category: 'Custom Design', emoji: '👟'
          }));
          const map = new Map();
          [...localDesigns, ...designs].forEach(d => {
            const key = d.id || `${d.name}-${d.createdAt}`;
            map.set(key, d);
          });
          setDesigns(Array.from(map.values()));
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, designs]);

  const designStats = useMemo(() => {
    const total = designs.length;
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
    const thisWeek = designs.filter(d => new Date(d.createdAt) >= weekAgo).length;
    const thisMonth = designs.filter(d => new Date(d.createdAt) >= monthAgo).length;
    return { total, thisWeek, thisMonth };
  }, [designs]);

  const performanceMetrics = useMemo(() => {
    const designCount = designs.length;
    const level = Math.floor(designCount / 5) + 1;
    const xp = designCount * 100;
    const nextLevelXp = level * 500;
    const rank = designCount >= 20 ? 'Expert Designer' : designCount >= 10 ? 'Advanced Designer' : designCount >= 5 ? 'Intermediate Designer' : designCount >= 1 ? 'Beginner Designer' : 'New Designer';
    return { level, xp, nextLevelXp, rank };
  }, [designs.length]);

  const tabs = useMemo(() => [
    { id: 'designs', label: 'My Designs', icon: '👟', count: designs.length },
    { id: 'stats', label: 'Statistics', icon: '📊', count: null },
    { id: 'settings', label: 'Settings', icon: '⚙️', count: null },
  ], [designs.length]);

  const handleEditProfile = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName: editForm.firstName, lastName: editForm.lastName, profileImage: editForm.profileImage })
      });
      const data = await res.json();
      if (!res.ok) { showNotificationMessage(data.error || 'Failed to update profile', 'error'); return; }
      await updateUser(data.user);
      setEditingProfile(false);
      showNotificationMessage('Profile updated successfully!', 'success');
    } catch (err) { showNotificationMessage('Failed to update profile', 'error'); }
  }, [editForm, updateUser, showNotificationMessage]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) { showNotificationMessage('Upload JPG, PNG, GIF, or WebP', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showNotificationMessage('Image must be < 5MB', 'error'); return; }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/api/profile/upload-profile-picture', { method: 'POST', body: formData, credentials: 'include' });
      if (!response.ok) {
        let errorMsg = `Upload failed (${response.status})`;
        try { const errorData = await response.json(); errorMsg = errorData?.error || errorMsg; } catch (e) {}
        showNotificationMessage(errorMsg, 'error');
        return;
      }
      const data = await response.json();
      if (!data || !data.success) throw new Error(data.error || 'Upload failed');
      const updatedUser = { ...user, profileImage: data.profilePictureUrl };
      await updateUser(updatedUser);
      setEditForm(prev => ({ ...prev, profileImage: data.profilePictureUrl }));
      showNotificationMessage('Profile picture updated!', 'success');
    } catch (err) { showNotificationMessage(err?.message || 'Failed to upload image', 'error'); } 
    finally { setUploadingImage(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  }, [user, updateUser, showNotificationMessage]);

  const handlePasswordChange = useCallback(async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) { showNotificationMessage('Fill all password fields', 'error'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { showNotificationMessage('Passwords do not match', 'error'); return; }
    if (passwordData.newPassword.length < 6) { showNotificationMessage('Min 6 characters', 'error'); return; }
    try {
      await axios.post('http://localhost:5000/api/auth/change-password', { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }, { withCredentials: true });
      showNotificationMessage('Password changed!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
    } catch (err) { showNotificationMessage(err.response?.data?.message || 'Failed to change password', 'error'); }
  }, [passwordData, showNotificationMessage]);

  const handleShareDesign = useCallback((design) => {
    const shareText = `Check out my shoe design: ${design.name}`;
    if (navigator.share) {
      navigator.share({ title: design.name, text: shareText, url: window.location.origin + '/my-designs' }).catch(err => console.error('Share error:', err));
    } else {
      navigator.clipboard.writeText(window.location.origin + '/my-designs');
      showNotificationMessage('Link copied to clipboard!', 'success');
    }
  }, [showNotificationMessage]);

  const handleLogout = useCallback(async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (err) { showNotificationMessage('Failed to logout', 'error'); }
  }, [showNotificationMessage]);

  const recentDesignsToShow = useMemo(() => {
    if (showAllRecentDesigns) return designs.slice(0, 5);
    return designs.slice(0, 3);
  }, [designs, showAllRecentDesigns]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-8 px-4 font-sans pt-24 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        <NotificationToast notification={notification} />
        <ProfileHeader user={user} designCount={designs.length} />
        <div className="grid gap-8 lg:grid-cols-3">
          <ProfileSidebar
            user={user} editingProfile={editingProfile} editForm={editForm}
            performanceMetrics={performanceMetrics} designStats={designStats}
            recentDesignsToShow={recentDesignsToShow} designsCount={designs.length}
            showAllRecentDesigns={showAllRecentDesigns} fileInputRef={fileInputRef}
            uploadingImage={uploadingImage} onEditFormChange={setEditForm}
            onEditProfile={handleEditProfile} onCancelEdit={() => setEditingProfile(false)}
            onStartEdit={() => setEditingProfile(true)} onImageUpload={handleImageUpload}
            onToggleRecentDesigns={() => setShowAllRecentDesigns(!showAllRecentDesigns)}
          />
          <div className="lg:col-span-2">
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <AnimatePresence mode="wait">
              {activeTab === 'designs' && <DesignsTab designs={designs} isLoading={isLoading} onShare={handleShareDesign} onSelectDesign={setSelectedDesign} />}
              {activeTab === 'stats' && <StatsTab designStats={designStats} designs={designs} />}
              {activeTab === 'settings' && <SettingsTab user={user} fileInputRef={fileInputRef} uploadingImage={uploadingImage} showPasswordFields={showPasswordFields} passwordData={passwordData} onImageUpload={handleImageUpload} onPasswordDataChange={setPasswordData} onTogglePasswordFields={() => setShowPasswordFields(!showPasswordFields)} onPasswordChange={handlePasswordChange} onLogout={handleLogout} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <DesignDetailModal design={selectedDesign} onClose={() => setSelectedDesign(null)} />
    </div>
  );
};

const ProfileHeader = React.memo(({ user, designCount }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">
          Welcome back, <span className="text-blue-300">{user?.firstName || 'Designer'}</span>
        </h1>
        <p className="text-zinc-400 mt-1">
          {designCount > 0 ? `You have ${designCount} custom designs in your vault.` : 'Ready to create your first design?'}
        </p>
      </div>
      <button onClick={() => window.location.href = '/designer'} className="w-fit bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg shadow-white/5">
        <Plus size={18} strokeWidth={3} /> NEW DESIGN
      </button>
    </div>
  </motion.div>
));

const NotificationToast = React.memo(({ notification }) => {
  if (!notification) return null;
  return (
    <AnimatePresence>
      <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200]">
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className={`px-8 py-4 rounded-[1.5rem] shadow-2xl border-2 flex items-center gap-4 backdrop-blur-md ${notification.type === 'success' ? 'bg-zinc-900/90 border-green-500/30 text-green-400' : 'bg-zinc-900/90 border-red-500/30 text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} strokeWidth={3} /> : <AlertCircle size={20} strokeWidth={3} />}
          <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

const ProfileSidebar = React.memo(({ user, editingProfile, editForm, performanceMetrics, designStats, recentDesignsToShow, designsCount, showAllRecentDesigns, fileInputRef, uploadingImage, onEditFormChange, onEditProfile, onCancelEdit, onStartEdit, onImageUpload, onToggleRecentDesigns }) => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
      <div className="relative w-32 h-32 mx-auto mb-6 group">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-2 border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-xl">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-black text-zinc-700">{user?.firstName?.[0] || 'U'}</span>
          )}
          {uploadingImage && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-[2.5rem]">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-2.5 bg-zinc-100 text-black rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-[#09090b]">
          <Camera size={18} strokeWidth={2.5} />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={onImageUpload} accept="image/*" />
      </div>

      <div className="text-center mb-8">
        <div className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-black tracking-[0.2em] text-zinc-400 mb-2 uppercase">{performanceMetrics.rank}</div>
        <h2 className="text-xl font-black text-white tracking-tight">{user?.firstName} {user?.lastName}</h2>
        <p className="text-zinc-500 text-xs mt-1">{user?.email}</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <span>Level {performanceMetrics.level}</span>
          <span className="text-zinc-300">{performanceMetrics.xp} / {performanceMetrics.nextLevelXp} XP</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(performanceMetrics.xp / performanceMetrics.nextLevelXp) * 100}%` }} className="h-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        <QuickStat label="Total" value={designStats.total} />
        <QuickStat label="Week" value={designStats.thisWeek} />
        <QuickStat label="Month" value={designStats.thisMonth} />
      </div>

      {editingProfile ? (
        <div className="space-y-3">
          <input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-white outline-none transition-colors" value={editForm.firstName || ''} onChange={(e) => onEditFormChange({ ...editForm, firstName: e.target.value })} placeholder="First Name" />
          <input className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-white outline-none transition-colors" value={editForm.lastName || ''} onChange={(e) => onEditFormChange({ ...editForm, lastName: e.target.value })} placeholder="Last Name" />
          <div className="flex gap-2">
            <button onClick={onEditProfile} className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-xs uppercase">Save</button>
            <button onClick={onCancelEdit} className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-bold text-xs uppercase">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={onStartEdit} className="w-full py-3 rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-all text-xs font-bold uppercase tracking-widest">Edit Profile</button>
      )}
    </motion.div>

    {recentDesignsToShow.length > 0 && <RecentDesignsCard designs={recentDesignsToShow} designsCount={designsCount} showAll={showAllRecentDesigns} onToggleView={onToggleRecentDesigns} />}
  </div>
));

const QuickStat = ({ label, value }) => (
  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-center">
    <div className="text-lg font-black text-white">{value}</div>
    <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter">{label}</div>
  </div>
);

const RecentDesignsCard = React.memo(({ designs, designsCount, showAll, onToggleView }) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Recent</h3>
      {designsCount > 3 && (
        <button onClick={onToggleView} className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1">
          <Eye size={12} /> {showAll ? 'Less' : 'All'}
        </button>
      )}
    </div>
    <div className="space-y-3">
      {designs.map((design) => (
        <div key={design.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer" onClick={() => window.location.href = '/my-designs'}>
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg shadow-inner" style={{ backgroundColor: design.colors?.body || '#18181b' }}>{design.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-zinc-100 truncate">{design.name}</div>
            <div className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter">{new Date(design.createdAt).toLocaleDateString()}</div>
          </div>
          <ChevronRight size={14} className="text-zinc-600" />
        </div>
      ))}
    </div>
  </motion.div>
));

const TabNavigation = React.memo(({ tabs, activeTab, onTabChange }) => (
  <div className="flex bg-zinc-900/30 p-1.5 rounded-[1.5rem] border border-zinc-800/50 backdrop-blur-sm mb-8 overflow-x-auto no-scrollbar">
    {tabs.map((tab) => (
      <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-zinc-800 text-white shadow-xl border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>
        <span>{tab.icon}</span> <span>{tab.label}</span>
        {tab.count !== null && <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab.id ? 'bg-zinc-950 text-white' : 'bg-zinc-800 text-zinc-500'}`}>{tab.count}</span>}
      </button>
    ))}
  </div>
));

const DesignsTab = React.memo(({ designs, isLoading, onShare, onSelectDesign }) => {
  const displayDesigns = designs.slice(0, 4);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" /></div>
      ) : designs.length === 0 ? (
        <EmptyDesignsState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayDesigns.map((design) => <DesignCard key={design.id} design={design} onShare={onShare} onClick={() => onSelectDesign(design)} />)}
          {designs.length > 4 && (
            <div className="md:col-span-2 flex justify-center">
              <button onClick={() => window.location.href = '/my-designs'} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">View All {designs.length} Designs</button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});

const EmptyDesignsState = React.memo(() => (
  <div className="bg-zinc-900/40 border border-zinc-800 border-dashed rounded-[2.5rem] p-12 text-center">
    <div className="text-6xl mb-6 grayscale opacity-20">👟</div>
    <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">No Designs Yet</h3>
    <p className="text-zinc-500 text-sm mb-8">Start your creative journey in the 3D workshop.</p>
    <button onClick={() => window.location.href = '/customise'} className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">My Designs</button>
  </div>
));

const DesignCard = React.memo(({ design, onShare, onClick }) => (
  <motion.div whileHover={{ y: -5 }} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-[2.5rem] group cursor-pointer shadow-xl" onClick={onClick}>
    <div className="aspect-square bg-zinc-950 rounded-[2rem] border border-zinc-800 overflow-hidden mb-6 flex items-center justify-center p-8 relative">
      {design.preview ? <img src={design.preview} className="w-full h-full object-contain" /> : <div className="text-5xl">{design.emoji}</div>}
      <button onClick={(e) => { e.stopPropagation(); onShare(design); }} className="absolute top-4 right-4 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all"><Share2 size={16}/></button>
    </div>
    <div className="flex justify-between items-center px-2">
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-tighter">{design.name}</h3>
        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">{design.category}</p>
      </div>
      <div className="p-2.5 bg-zinc-800 rounded-xl text-zinc-400 group-hover:text-white transition-colors"><ChevronRight size={18}/></div>
    </div>
  </motion.div>
));

const StatsTab = React.memo(({ designStats, designs }) => {
  const avgPerWeek = useMemo(() => {
    if (designs.length === 0) return 0;
    const oldest = Math.min(...designs.map(d => new Date(d.createdAt).getTime()));
    const weeks = Math.max((Date.now() - oldest) / (1000 * 60 * 60 * 24 * 7), 1);
    return (designs.length / weeks).toFixed(1);
  }, [designs]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<BarChart3 />} label="Total Vault" value={designStats.total} color="text-blue-500" />
        <StatCard icon={<Zap />} label="Velocity" value={avgPerWeek} color="text-purple-500" />
        <StatCard icon={<Calendar />} label="Active" value={designs.length > 0 ? "Member" : "New"} color="text-emerald-500" />
      </div>
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Activity Timeline</h3>
        <div className="space-y-4">
          <TimelineRow label="This Week" value={designStats.thisWeek} max={designStats.total} />
          <TimelineRow label="This Month" value={designStats.thisMonth} max={designStats.total} />
        </div>
      </div>
    </motion.div>
  );
});

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] text-center shadow-xl">
    <div className={`w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800 ${color}`}>{icon}</div>
    <div className="text-3xl font-black text-white mb-1 tracking-tighter">{value}</div>
    <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{label}</div>
  </div>
);

const TimelineRow = ({ label, value, max }) => (
  <div className="p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 flex items-center justify-between">
    <div>
      <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">{label}</div>
      <div className="text-lg font-black text-white">{value} Designs</div>
    </div>
    <div className="text-zinc-700 font-black italic">Archive</div>
  </div>
);

const SettingsTab = React.memo(({ user, fileInputRef, uploadingImage, showPasswordFields, passwordData, onImageUpload, onPasswordDataChange, onTogglePasswordFields, onPasswordChange, onLogout }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 space-y-10 shadow-2xl">
      <div>
        <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
          <Camera size={16} className="text-zinc-500" /> Identity
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-zinc-950/50 rounded-[2rem] border border-zinc-800">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-zinc-700">
            {user?.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-800 flex items-center justify-center font-black">{user?.firstName?.[0]}</div>}
            {uploadingImage && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /></div>}
          </div>
          <div className="text-center sm:text-left flex-1">
             <p className="text-xs font-bold text-zinc-100">Upload new avatar</p>
             <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">JPG/PNG/WEBP MAX 5MB</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest">Select File</button>
        </div>
      </div>

      <div>
        <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
          <Lock size={16} className="text-zinc-500" /> Security
        </h3>
        {showPasswordFields ? (
          <div className="grid gap-3">
            <input type="password" placeholder="CURRENT PASSWORD" value={passwordData.currentPassword} onChange={(e) => onPasswordDataChange({ ...passwordData, currentPassword: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 outline-none focus:border-white text-xs font-bold tracking-widest" />
            <input type="password" placeholder="NEW PASSWORD" value={passwordData.newPassword} onChange={(e) => onPasswordDataChange({ ...passwordData, newPassword: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 outline-none focus:border-white text-xs font-bold tracking-widest" />
            <input type="password" placeholder="CONFIRM NEW PASSWORD" value={passwordData.confirmPassword} onChange={(e) => onPasswordDataChange({ ...passwordData, confirmPassword: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 outline-none focus:border-white text-xs font-bold tracking-widest" />
            <div className="flex gap-2">
              <button onClick={onPasswordChange} className="flex-1 bg-white text-black py-4 rounded-xl font-black text-[11px] uppercase tracking-widest">Update</button>
              <button onClick={onTogglePasswordFields} className="flex-1 bg-zinc-800 text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={onTogglePasswordFields} className="w-full py-5 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Change your password credentials</button>
        )}
      </div>

      <div className="pt-8 border-t border-zinc-800/50">
        <button onClick={onLogout} className="flex items-center gap-3 text-zinc-500 hover:text-red-500 transition-all text-xs font-black uppercase tracking-[0.2em]">
          <LogOut size={16} /> Terminate Session
        </button>
      </div>
    </div>
  </motion.div>
));

const DesignDetailModal = React.memo(({ design, onClose }) => {
  if (!design) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 sm:p-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{design.name}</h2>
              <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] mt-1">Design Archive</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"><X size={20}/></button>
          </div>
          <div className="aspect-[4/3] bg-black rounded-[2.5rem] border border-zinc-800 overflow-hidden mb-10 flex items-center justify-center p-6">
            <img src={design.preview} className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-wrap gap-4">
             <button onClick={() => window.location.href = '/designer'} className="flex-1 min-w-[200px] bg-white text-black py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
               <Edit3 size={18} /> Launch 3D Editor
             </button>
             <button className="p-5 bg-zinc-800 rounded-2xl text-white hover:bg-zinc-700 transition-all border border-white/5"><Share2 size={20} /></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default React.memo(Profile);