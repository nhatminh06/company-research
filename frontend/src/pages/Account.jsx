import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}
function getToken() {
  return localStorage.getItem('token');
}
function isImageFile(file) {
  return file && file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024;
}

export default function Account() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwVisible, setPwVisible] = useState({ old: false, new: false });
  const [emailValid, setEmailValid] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTokenHint, setShowTokenHint] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Fetch user info and avatar
  useEffect(() => {
    async function fetchUser() {
      setLoadingUser(true);
      const token = getToken();
      if (!token) {
        setUser(null);
        navigate('/auth');
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email, name: payload.name || '', id: payload.id });
        setEditName(payload.name || '');
        setEmailValid(validateEmail(payload.email));
        const res = await axios.get('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } });
        setAvatar(res.data.user.avatar || '');
        setAvatarPreview(res.data.user.avatar || '');
      } catch (e) {
        setUser(null);
        navigate('/auth');
      }
      setLoadingUser(false);
    }
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth');
  };

  const getInitials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    if (email) return email[0].toUpperCase();
    return '?';
  };

  const handleEdit = () => setEditing(true);
  const handleCancel = () => { setEditing(false); setEditName(user.name || ''); setError(''); };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const res = await axios.put('/api/user/profile', { name: editName }, { headers: { Authorization: `Bearer ${token}` } });
      setUser({ ...user, name: res.data.user.name });
      setEditing(false);
      setShowTokenHint(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update name');
    }
    setLoading(false);
  };

  const handleAvatarChange = e => {
    setAvatarError('');
    const file = e.target.files[0];
    if (!isImageFile(file)) {
      setAvatarError('Only image files up to 2MB are allowed.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) return;
    setAvatarLoading(true);
    setAvatarError('');
    try {
      const token = getToken();
      const res = await axios.post('/api/user/avatar', { avatar: avatarPreview }, { headers: { Authorization: `Bearer ${token}` } });
      setAvatar(res.data.avatar);
      setAvatarPreview(res.data.avatar);
    } catch (err) {
      setAvatarError(err.response?.data?.error || 'Failed to upload avatar');
    }
    setAvatarLoading(false);
  };

  const handleAvatarReset = () => {
    setAvatarPreview(avatar);
    setAvatarError('');
  };

  const handlePwChange = e => {
    setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setPwError('');
    setPwSuccess('');
  };

  const handlePwSubmit = async e => {
    e.preventDefault();
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      const token = getToken();
      await axios.post('/api/user/change-password', pwForm, { headers: { Authorization: `Bearer ${token}` } });
      setPwSuccess('Password changed successfully');
      setPwForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    }
    setPwLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const token = getToken();
      await axios.delete('/api/user/delete', { headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem('token');
      setUser(null);
      navigate('/auth');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account');
    }
    setDeleteLoading(false);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch {
      setCopySuccess(false);
    }
  };

  if (loadingUser) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center animate-fade-in border">
        {/* Avatar skeleton */}
        <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 animate-pulse" />
        {/* Name skeleton */}
        <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
        {/* Email skeleton */}
        <div className="h-4 w-48 bg-gray-100 rounded mb-4 animate-pulse" />
        {/* Password skeleton */}
        <div className="w-full mt-6">
          <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded mb-2 animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded mb-2 animate-pulse" />
          <div className="h-8 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
        </div>
        {/* Logout/Delete skeleton */}
        <div className="h-10 w-32 bg-gray-200 rounded mt-8 animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded mt-4 animate-pulse" />
      </div>
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center animate-fade-in border">
        <div className="w-20 h-20 rounded-full bg-blue-700 flex items-center justify-center text-white text-3xl font-bold mb-4 transition-all duration-300 overflow-hidden relative animate-fade-in">
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            getInitials(user.name, user.email)
          )}
          <button
            className="absolute bottom-0 right-0 bg-white text-blue-700 rounded-full p-1 shadow hover:bg-blue-100 transition"
            onClick={() => fileInputRef.current.click()}
            type="button"
            title="Upload avatar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
          {avatarPreview && avatarPreview !== avatar && (
            <button onClick={handleAvatarReset} className="absolute top-0 left-0 bg-gray-200 rounded-full px-2 py-0.5 m-1 hover:bg-gray-300 transition">Reset</button>
          )}
        </div>
        {avatarError && <div className="text-red-600 text-sm mb-2">{avatarError}</div>}
        {avatarPreview && avatarPreview !== avatar && (
          <button onClick={handleAvatarUpload} disabled={avatarLoading} className="mb-2 px-3 py-1 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 transition">{avatarLoading ? 'Uploading...' : 'Save Avatar'}</button>
        )}
        <h2 className="text-2xl font-bold mb-2">My Account</h2>
        <div className="mb-4 text-center animate-fade-in">
          {editing ? (
            <>
              <input
                className="border px-3 py-2 rounded w-48 text-center mb-2"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <div className="flex gap-2 justify-center">
                <button onClick={handleSave} disabled={loading} className="px-3 py-1 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 transition">Save</button>
                <button onClick={handleCancel} disabled={loading} className="px-3 py-1 bg-gray-300 rounded font-medium hover:bg-gray-400 transition">Cancel</button>
              </div>
              {showTokenHint && <div className="text-xs text-yellow-600 mt-2">Name changes may not reflect until your next login.</div>}
            </>
          ) : (
            <>
              <div className="text-gray-700 font-medium flex items-center gap-2">
                {user.name || <span className="italic text-gray-400">No name set</span>}
                <button onClick={handleEdit} className="ml-2 text-xs text-blue-600 underline">Edit</button>
              </div>
              <div className={`flex items-center justify-center gap-2 mt-1 ${!emailValid ? 'text-red-600 font-bold' : 'text-green-700 font-bold'}`}> 
                <span>{user.email}</span>
                <button onClick={handleCopyEmail} className="ml-1 text-xs px-2 py-0.5 bg-gray-200 rounded hover:bg-gray-300 transition">Copy</button>
                {copySuccess && <span className="text-green-600 text-xs ml-1">Copied!</span>}
                {emailValid ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-green-600 text-xs">Valid email</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    <span className="text-red-600 text-xs">Invalid email address</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <div className="w-full mt-6 animate-fade-in">
          <h3 className="text-lg font-bold mb-2">Change Password</h3>
          <form onSubmit={handlePwSubmit} className="flex flex-col gap-2">
            <div className="relative">
              <input type={pwVisible.old ? 'text' : 'password'} name="oldPassword" placeholder="Current password" className="border px-3 py-2 rounded w-full" value={pwForm.oldPassword} onChange={handlePwChange} disabled={pwLoading} required />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setPwVisible(v => ({ ...v, old: !v.old }))} tabIndex={-1}>
                {pwVisible.old ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10S6.477-1 12-1s10 4.477 10 10c0 2.042-.613 3.94-1.663 5.525M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 1112 0 6 6 0 01-12 0z" /></svg>
                )}
              </button>
            </div>
            <div className="relative">
              <input type={pwVisible.new ? 'text' : 'password'} name="newPassword" placeholder="New password" className="border px-3 py-2 rounded w-full" value={pwForm.newPassword} onChange={handlePwChange} disabled={pwLoading} required />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setPwVisible(v => ({ ...v, new: !v.new }))} tabIndex={-1}>
                {pwVisible.new ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10S6.477-1 12-1s10 4.477 10 10c0 2.042-.613 3.94-1.663 5.525M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 1112 0 6 6 0 01-12 0z" /></svg>
                )}
              </button>
            </div>
            <button type="submit" className="px-3 py-1 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 transition" disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</button>
            {pwError && <div className="text-red-600 text-sm">{pwError}</div>}
            {pwSuccess && <div className="text-green-600 text-sm">{pwSuccess}</div>}
          </form>
        </div>
        <button onClick={handleLogout} className="mt-8 px-6 py-2 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 transition-all duration-300">Logout</button>
        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
        <button
          onClick={handleDeleteAccount}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-all duration-300"
          disabled={deleteLoading}
        >
          {deleteLoading ? 'Deleting...' : 'Delete Account'}
        </button>
        {deleteError && <div className="mt-2 text-red-600 text-sm">{deleteError}</div>}
      </div>
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
} 