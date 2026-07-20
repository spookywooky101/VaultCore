import { useState, useEffect } from 'react';
import { 
  Folder, Image, FileText, Video, Archive, Upload, 
  Download, Trash2, Lock, User, Plus, Search, 
  LogOut, Eye, RefreshCw, File, AlertCircle, Sparkles, Share2
} from 'lucide-react';
import './App.css';

// Reads VITE_API_BASE from .env.local (local) or Vercel env vars (production)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const getErrorMessage = async (response, defaultMsg) => {
  try {
    const text = await response.text();
    if (!text) return defaultMsg;
    const data = JSON.parse(text);
    return data.message || defaultMsg;
  } catch (e) {
    return defaultMsg;
  }
};

const renderAvatarSvg = (avatarType, size = 40) => {
  const s = size;
  switch (avatarType) {
    case 'hacker-panda':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
          <circle cx="50" cy="50" r="48" fill="#1e293b" />
          <circle cx="25" cy="25" r="14" fill="#0f172a" />
          <circle cx="75" cy="25" r="14" fill="#0f172a" />
          <circle cx="50" cy="55" r="36" fill="#f8fafc" />
          <ellipse cx="38" cy="50" rx="10" ry="14" fill="#0f172a" transform="rotate(-15 38 50)" />
          <ellipse cx="62" cy="50" rx="10" ry="14" fill="#0f172a" transform="rotate(15 62 50)" />
          <circle cx="38" cy="48" r="4" fill="#38bdf8" />
          <circle cx="62" cy="48" r="4" fill="#38bdf8" />
          <rect x="25" y="42" width="50" height="12" rx="6" fill="#ec4899" opacity="0.9" />
          <line x1="30" y1="48" x2="70" y2="48" stroke="#ec4899" strokeWidth="6" />
          <polygon points="46,60 54,60 50,65" fill="#0f172a" />
          <path d="M46 68 Q50 71 54 68" stroke="#0f172a" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'cyber-monkey':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
          <circle cx="50" cy="50" r="48" fill="#312e81" />
          <circle cx="20" cy="50" r="12" fill="#854d0e" />
          <circle cx="20" cy="50" r="7" fill="#fef08a" />
          <circle cx="80" cy="50" r="12" fill="#854d0e" />
          <circle cx="80" cy="50" r="7" fill="#fef08a" />
          <circle cx="50" cy="48" r="30" fill="#a16207" />
          <path d="M 30,52 C 30,36 42,32 50,42 C 58,32 70,36 70,52 C 70,68 62,74 50,74 C 38,74 30,68 30,52 Z" fill="#fef08a" />
          <circle cx="42" cy="48" r="4" fill="#0284c7" />
          <circle cx="58" cy="48" r="4" fill="#0284c7" />
          <path d="M 22,50 A 28,28 0 0,1 78,50" stroke="#10b981" strokeWidth="6" fill="none" />
          <rect x="15" y="42" width="10" height="18" rx="4" fill="#10b981" />
          <rect x="75" y="42" width="10" height="18" rx="4" fill="#10b981" />
          <path d="M 44,62 Q 50,67 56,62" stroke="#854d0e" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'rocket-koala':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
          <circle cx="50" cy="50" r="48" fill="#111827" />
          <circle cx="50" cy="50" r="38" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="24" cy="38" r="16" fill="#9ca3af" />
          <circle cx="24" cy="38" r="10" fill="#e5e7eb" />
          <circle cx="76" cy="38" r="16" fill="#9ca3af" />
          <circle cx="76" cy="38" r="10" fill="#e5e7eb" />
          <circle cx="50" cy="52" r="26" fill="#d1d5db" />
          <ellipse cx="50" cy="56" rx="20" ry="16" fill="#f3f4f6" />
          <ellipse cx="50" cy="54" rx="6" ry="10" fill="#1f2937" />
          <circle cx="40" cy="46" r="3.5" fill="#111827" />
          <circle cx="60" cy="46" r="3.5" fill="#111827" />
          <path d="M 22,50 A 28,28 0 0,1 78,50 Z" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="2.5" />
          <path d="M 30,35 Q 40,25 60,35" stroke="white" strokeWidth="2" fill="none" opacity="0.6" />
        </svg>
      );
    case 'coding-owl':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
          <circle cx="50" cy="50" r="48" fill="#064e3b" />
          <polygon points="25,32 38,20 38,36" fill="#047857" />
          <polygon points="75,32 62,20 62,36" fill="#047857" />
          <circle cx="50" cy="54" r="30" fill="#059669" />
          <circle cx="38" cy="48" r="12" fill="#fff" />
          <circle cx="62" cy="48" r="12" fill="#fff" />
          <circle cx="38" cy="48" r="6" fill="#3b82f6" />
          <circle cx="62" cy="48" r="6" fill="#3b82f6" />
          <circle cx="38" cy="48" r="2" fill="#000" />
          <circle cx="62" cy="48" r="2" fill="#000" />
          <rect x="24" y="42" width="28" height="12" rx="4" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <rect x="48" y="42" width="28" height="12" rx="4" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <line x1="42" y1="48" x2="58" y2="48" stroke="#f59e0b" strokeWidth="3" />
          <polygon points="50,56 46,62 54,62" fill="#f59e0b" />
        </svg>
      );
    case 'detective-fox':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
          <circle cx="50" cy="50" r="48" fill="#7c2d12" />
          <polygon points="22,35 15,10 40,30" fill="#ea580c" />
          <polygon points="78,35 85,10 60,30" fill="#ea580c" />
          <polygon points="24,32 20,18 36,28" fill="#ffedd5" />
          <polygon points="76,32 80,18 64,28" fill="#ffedd5" />
          <polygon points="50,75 18,36 82,36" fill="#ea580c" />
          <polygon points="50,75 18,36 34,36" fill="#ffedd5" />
          <polygon points="50,75 82,36 66,36" fill="#ffedd5" />
          <circle cx="50" cy="74" r="5" fill="#000" />
          <ellipse cx="36" cy="46" rx="4" ry="6" fill="#000" />
          <ellipse cx="64" cy="46" rx="4" ry="6" fill="#000" />
          <circle cx="64" cy="46" r="10" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
          <line x1="74" y1="46" x2="84" y2="52" stroke="#fbbf24" strokeWidth="2" />
          <path d="M 28,32 L 72,32 L 66,16 L 34,16 Z" fill="#4b5563" />
          <ellipse cx="50" cy="32" rx="28" ry="4" fill="#374151" />
        </svg>
      );
    case 'cool-cat':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
          <circle cx="50" cy="50" r="48" fill="#581c87" />
          <polygon points="24,34 16,12 40,28" fill="#d8b4fe" />
          <polygon points="76,34 84,12 60,28" fill="#d8b4fe" />
          <circle cx="50" cy="54" r="30" fill="#c084fc" />
          <circle cx="38" cy="48" r="5" fill="#facc15" />
          <circle cx="62" cy="48" r="5" fill="#facc15" />
          <line x1="38" y1="44" x2="38" y2="52" stroke="black" strokeWidth="1.5" />
          <line x1="62" y1="44" x2="62" y2="52" stroke="black" strokeWidth="1.5" />
          <rect x="25" y="44" width="22" height="8" rx="2" fill="#000" opacity="0.85" />
          <rect x="53" y="44" width="22" height="8" rx="2" fill="#000" opacity="0.85" />
          <line x1="47" y1="48" x2="53" y2="48" stroke="#000" strokeWidth="2.5" />
          <path d="M 38,62 Q 50,56 62,62 Q 70,68 76,64 M 38,62 Q 30,68 24,64" stroke="#111827" strokeWidth="4" fill="none" strokeLinecap="round" />
          <polygon points="48,56 52,56 50,59" fill="#111827" />
        </svg>
      );
    default:
      return (
        <div style={{ width: s, height: s, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color), var(--accent-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: s * 0.4 }}>
          {avatarType?.charAt(0).toUpperCase() || '?'}
        </div>
      );
  }
};

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // Login Input State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Input State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('viewer');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Share Modal State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharingAsset, setSharingAsset] = useState(null);
  const [shareRecipient, setShareRecipient] = useState('');
  const [shareRole, setShareRole] = useState('READER');
  const [shareList, setShareList] = useState([]);
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Sidebar Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Short by default!

  // Profile Settings Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Asset Dashboard State
  const [assets, setAssets] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Images', 'Videos', 'Documents', 'Archives'

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch Assets when logged in
  useEffect(() => {
    if (token) {
      fetchAssets();
    }
  }, [token]);

  const fetchAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const response = await fetch(`${API_BASE}/api/assets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error("Failed to load assets");
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setLoginError("Please enter both username and password.");
      return;
    }
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      });

      if (!response.ok) {
        const msg = await getErrorMessage(response, "Invalid username or password");
        throw new Error(msg);
      }

      const text = await response.text();
      const data = JSON.parse(text);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        role: data.role,
        profilePicturePath: data.profilePicturePath,
        animalAvatarType: data.animalAvatarType
      }));

      setToken(data.token);
      setCurrentUser({
        id: data.id,
        username: data.username,
        role: data.role,
        profilePicturePath: data.profilePicturePath,
        animalAvatarType: data.animalAvatarType
      });
      setLoginUsername('');
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerUsername || !registerPassword) {
      setRegisterError("Please enter both username and password.");
      return;
    }
    setRegisterError('');
    setRegisterSuccess('');
    setIsRegistering(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
          role: registerRole
        })
      });

      if (!response.ok) {
        const msg = await getErrorMessage(response, "Registration failed");
        throw new Error(msg);
      }

      setRegisterSuccess("Account registered successfully! You can now log in.");
      setRegisterUsername('');
      setRegisterPassword('');
      setRegisterRole('viewer');
      setTimeout(() => {
        setIsRegisterMode(false);
        setRegisterSuccess('');
      }, 1800);
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    setAssets([]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }
    setUploadError('');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('description', uploadDescription);
    formData.append('tags', uploadTags);

    try {
      const response = await fetch(`${API_BASE}/api/assets/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const msg = await getErrorMessage(response, "Failed to upload asset");
        throw new Error(msg);
      }

      setUploadFile(null);
      setUploadDescription('');
      setUploadTags('');
      setIsUploadOpen(false);
      fetchAssets();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (asset) => {
    try {
      const response = await fetch(`${API_BASE}/api/assets/${asset.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Could not download file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = asset.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCompress = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/assets/${id}/compress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const msg = await getErrorMessage(response, "Failed to compress file");
        throw new Error(msg);
      }
      fetchAssets();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleExtract = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/assets/${id}/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const msg = await getErrorMessage(response, "Failed to extract archive");
        throw new Error(msg);
      }
      fetchAssets();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this asset?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/assets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const msg = await getErrorMessage(response, "Failed to delete asset");
        throw new Error(msg);
      }
      fetchAssets();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openShareModal = async (asset) => {
    setSharingAsset(asset);
    setIsShareOpen(true);
    setShareRecipient('');
    setShareRole('READER');
    setShareError('');
    setShareSuccess('');
    
    try {
      const response = await fetch(`${API_BASE}/api/assets/${asset.id}/shares`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setShareList(data);
      }
    } catch (err) {
      console.error("Failed to load shares", err);
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareRecipient) {
      setShareError("Please enter a username to share with.");
      return;
    }
    setShareError('');
    setShareSuccess('');
    setIsSharing(true);

    try {
      const response = await fetch(`${API_BASE}/api/assets/${sharingAsset.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: shareRecipient,
          role: shareRole
        })
      });

      if (!response.ok) {
        const msg = await getErrorMessage(response, "Failed to share asset");
        throw new Error(msg);
      }

      setShareSuccess(`Shared successfully with ${shareRecipient}!`);
      setShareRecipient('');
      
      const sharesRes = await fetch(`${API_BASE}/api/assets/${sharingAsset.id}/shares`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (sharesRes.ok) {
        const data = await sharesRes.json();
        setShareList(data);
      }
    } catch (err) {
      setShareError(err.message);
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async (shareId) => {
    if (!confirm("Are you sure you want to revoke this user's access?")) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/assets/${sharingAsset.id}/share/${shareId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const msg = await getErrorMessage(response, "Failed to revoke access");
        throw new Error(msg);
      }

      const sharesRes = await fetch(`${API_BASE}/api/assets/${sharingAsset.id}/shares`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (sharesRes.ok) {
        const data = await sharesRes.json();
        setShareList(data);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    e.preventDefault();
    if (!profileFile) {
      setProfileError("Please select an image file to upload.");
      return;
    }
    setProfileError('');
    setProfileSuccess('');
    setIsUpdatingProfile(true);

    const formData = new FormData();
    formData.append('file', profileFile);

    try {
      const response = await fetch(`${API_BASE}/api/users/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const msg = await getErrorMessage(response, "Failed to upload profile picture");
        throw new Error(msg);
      }

      const data = await response.json();
      const updatedUser = { 
        ...currentUser, 
        profilePicturePath: data.profilePicturePath,
        animalAvatarType: null
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setProfileSuccess("Profile picture uploaded successfully!");
      setProfileFile(null);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSelectAnimalAvatar = async (avatarType) => {
    setProfileError('');
    setProfileSuccess('');
    setIsUpdatingProfile(true);

    try {
      const response = await fetch(`${API_BASE}/api/users/animal-avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatarType })
      });

      if (!response.ok) {
        const msg = await getErrorMessage(response, "Failed to select avatar");
        throw new Error(msg);
      }

      const updatedUser = { 
        ...currentUser, 
        profilePicturePath: null,
        animalAvatarType: avatarType
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setProfileSuccess(`Avatar updated to ${avatarType.replace('-', ' ')}!`);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Helper formatting size bytes
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper asset icon
  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="asset-file-icon" size={40} />;
    const type = fileType.toLowerCase();
    if (type.startsWith('image/')) return <Image className="asset-file-icon" size={40} />;
    if (type.startsWith('video/')) return <Video className="asset-file-icon" size={40} />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="asset-file-icon" size={40} />;
    if (type.includes('text') || type.includes('pdf') || type.includes('document')) return <FileText className="asset-file-icon" size={40} />;
    return <File className="asset-file-icon" size={40} />;
  };

  // Filter & Search Assets
  const filteredAssets = assets.filter(asset => {
    // Search filter
    const matchesSearch = 
      asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.uploadedBy?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab Type Filter
    if (activeFilter === 'All') return true;
    if (!asset.fileType) return false;
    const type = asset.fileType.toLowerCase();

    switch (activeFilter) {
      case 'Images':
        return type.startsWith('image/');
      case 'Videos':
        return type.startsWith('video/');
      case 'Documents':
        return type.includes('text') || type.includes('pdf') || type.includes('document');
      case 'Archives':
        return type.includes('zip') || type.includes('archive');
      default:
        return true;
    }
  });

  // Render Login Panel
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <Sparkles size={28} />
            </div>
            <h1 className="auth-title">ValutCore</h1>
            <p className="auth-subtitle">
              {isRegisterMode 
                ? "Create a new portal account" 
                : "Sign in to manage your private assets portal"}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '10px' }}>
            <button 
              type="button"
              onClick={() => { setIsRegisterMode(false); setLoginError(''); setRegisterError(''); }}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: !isRegisterMode ? 'var(--bg-secondary)' : 'transparent', color: !isRegisterMode ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setIsRegisterMode(true); setLoginError(''); setRegisterError(''); }}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: isRegisterMode ? 'var(--bg-secondary)' : 'transparent', color: isRegisterMode ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              Register
            </button>
          </div>

          {/* Show Errors/Success message */}
          {!isRegisterMode && loginError && (
            <div className="auth-error">
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {loginError}
            </div>
          )}

          {isRegisterMode && registerError && (
            <div className="auth-error">
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {registerError}
            </div>
          )}

          {isRegisterMode && registerSuccess && (
            <div className="auth-error" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success-color)', color: '#a7f3d0' }}>
              <Sparkles size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {registerSuccess}
            </div>
          )}

          {/* Login Form */}
          {!isRegisterMode && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. admin"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    disabled={isLoggingIn}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoggingIn}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={isLoggingIn}>
                {isLoggingIn ? "Logging in..." : "Login Portal"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {isRegisterMode && (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. johndoe"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Min 6 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
              </div>

              {/* Removed global role selection dropdown to simplify signup */}

              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={isRegistering}>
                {isRegistering ? "Registering account..." : "Register Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="dashboard-layout">
      {/* Sidebar Panel */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Menu Toggle at the very top */}
        <div style={{ 
          display: 'flex', 
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-end', 
          width: '100%', 
          marginBottom: '16px' 
        }}>
          <button 
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="sidebar-toggle-btn"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>☰</span>
          </button>
        </div>

        {/* User Info profile card */}
        <div 
          className="user-profile-widget" 
          onClick={() => setIsProfileOpen(true)}
          style={{ 
            marginTop: 0, 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', 
            width: '100%',
            padding: isSidebarCollapsed ? '8px' : '16px',
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Click to edit profile"
        >
          <div className="user-avatar" style={{ margin: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentUser?.profilePicturePath ? (
              <img 
                src={currentUser.profilePicturePath} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              renderAvatarSvg(currentUser?.animalAvatarType || 'cool-cat', 40)
            )}
          </div>
          {!isSidebarCollapsed && (
            <div className="user-info" style={{ textAlign: 'left', marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
              <span className="user-username" style={{ fontSize: '14px', fontWeight: '600', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentUser?.username}</span>
              <span className="user-role-badge" style={{ fontSize: '10px', marginTop: '2px', display: 'inline-block' }}>{currentUser?.role?.replace('ROLE_', '')}</span>
            </div>
          )}
        </div>

        <button 
          onClick={handleLogout} 
          className="btn btn-secondary" 
          style={{ 
            padding: isSidebarCollapsed ? '10px' : '10px 16px', 
            marginTop: 'auto', 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: isSidebarCollapsed ? '0' : '8px' 
          }}
          title="Logout"
        >
          <LogOut size={16} /> 
          {!isSidebarCollapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Container */}
      <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <header className="dashboard-header">
          <div className="page-title-section">
            <h1 className="page-title">ValutCore Assets</h1>
            <p className="page-subtitle">Manage, compress, extract and backup files securely.</p>
          </div>

          {/* Only show top upload button if assets are already uploaded */}
          {assets.length > 0 && (currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_EDITOR') && (
            <button onClick={() => setIsUploadOpen(true)} className="btn btn-primary" style={{ width: 'auto' }}>
              <Plus size={18} /> Upload Asset
            </button>
          )}
        </header>

        {/* Only show search and filter tabs if assets are already uploaded */}
        {assets.length > 0 && (
          <>
            {/* Search Bar Row (Above Filter Tabs) */}
            <div className="search-section-wrapper" style={{ marginBottom: '20px' }}>
              <div className="search-box" style={{ maxWidth: '400px' }}>
                <Search className="input-icon" size={18} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search assets name, tag, desc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Section Row (Below Search Bar) */}
            <div className="filter-section-wrapper" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'flex-start' }}>
              <div className="filter-tabs">
                {['All', 'Images', 'Videos', 'Documents', 'Archives'].map(tab => (
                  <button 
                    key={tab} 
                    className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
                    onClick={() => setActiveFilter(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Asset Cards Grid */}
        {isLoadingAssets ? (
          <div className="empty-state">
            <RefreshCw className="empty-state-icon animate-spin" size={48} />
            <div className="empty-state-title">Loading assets...</div>
            <p className="empty-state-desc" style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Starting up cloud server (takes ~30-45s on Render free tier)...
            </p>
          </div>
        ) : assets.length === 0 ? (
          <div className="empty-state">
            <Folder className="empty-state-icon" size={48} />
            <div className="empty-state-title">No assets uploaded yet</div>
            <p className="empty-state-desc">Your secure vault is empty. Get started by uploading your first file!</p>
            
            {(currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_EDITOR') && (
              <button 
                onClick={() => setIsUploadOpen(true)} 
                className="btn btn-primary central-upload-btn"
                style={{ 
                  marginTop: '20px', 
                  padding: '16px 36px', 
                  fontSize: '16px', 
                  width: 'auto', 
                  borderRadius: '14px',
                  boxShadow: '0 0 25px var(--accent-glow)',
                  animation: 'pulse-button 2.5s infinite ease-in-out'
                }}
              >
                <Upload size={20} /> Upload Your First Asset
              </button>
            )}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="empty-state">
            <Folder className="empty-state-icon" size={48} />
            <div className="empty-state-title">No assets found</div>
            <p className="empty-state-desc">No files match your search query or active filter.</p>
          </div>
        ) : (
          <div className="assets-grid">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="asset-card">
                <div className="asset-preview-area">
                  {asset.fileType?.toLowerCase().startsWith('image/') ? (
                    <div className="thumbnail-container">
                      <img 
                        src={`${API_BASE}/api/assets/${asset.id}/download?token=${token}`} 
                        alt={asset.name} 
                        className="asset-thumbnail-img" 
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    getFileIcon(asset.fileType)
                  )}
                  <span className="asset-size-badge">{formatBytes(asset.fileSize)}</span>
                </div>

                <div className="asset-details">
                  <h3 className="asset-name" title={asset.name}>{asset.name}</h3>
                  {asset.description && <p className="asset-desc">{asset.description}</p>}
                  
                  {asset.tags && (
                    <div className="asset-tags-container">
                      {asset.tags.split(',').map((tag, idx) => (
                        <span key={idx} className="tag-badge">#{tag.trim()}</span>
                      ))}
                    </div>
                  )}

                  <div className="asset-meta-rows">
                    <div className="asset-meta-item">
                      <span>Uploaded by:</span>
                      <strong>{asset.uploadedBy} {asset.sharedRole === 'OWNER' ? "(You)" : `(Shared: ${asset.sharedRole})`}</strong>
                    </div>
                    <div className="asset-meta-item">
                      <span>Date:</span>
                      <strong>{new Date(asset.uploadedAt).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="asset-actions">
                  <button 
                    onClick={() => handleDownload(asset)} 
                    className="asset-action-btn" 
                    title="Download File"
                  >
                    <Download size={16} />
                  </button>

                  {/* Share option (owners only) */}
                  {asset.sharedRole === 'OWNER' && (
                    <button 
                      onClick={() => openShareModal(asset)} 
                      className="asset-action-btn" 
                      title="Share Asset"
                    >
                      <Share2 size={16} />
                    </button>
                  )}

                  {/* Compress & Extract options (owner and editors) */}
                  {(asset.sharedRole === 'OWNER' || asset.sharedRole === 'EDITOR') && (
                    <>
                      <button 
                        onClick={() => handleCompress(asset.id)} 
                        className="asset-action-btn" 
                        title="Zip Asset"
                      >
                        <Archive size={16} />
                      </button>
                      
                      {asset.fileType?.toLowerCase().includes('zip') && (
                        <button 
                          onClick={() => handleExtract(asset.id)} 
                          className="asset-action-btn" 
                          title="Extract Zip"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </>
                  )}

                  {/* Delete option (owners only) */}
                  {asset.sharedRole === 'OWNER' && (
                    <button 
                      onClick={() => handleDelete(asset.id)} 
                      className="asset-action-btn btn-delete" 
                      title="Delete Asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload File Modal */}
      {isUploadOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <header className="modal-header">
              <h2 className="modal-title">Upload Personal Asset</h2>
              <button onClick={() => setIsUploadOpen(false)} className="modal-close-btn">
                &times;
              </button>
            </header>

            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body">
                {uploadError && (
                  <div className="auth-error" style={{ marginBottom: '16px' }}>
                    {uploadError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Asset File</label>
                  <label className="file-dropzone">
                    <Upload className="file-dropzone-icon" size={32} />
                    <span className="file-dropzone-title">
                      {uploadFile ? uploadFile.name : "Click to select a file"}
                    </span>
                    <span className="file-dropzone-subtitle">Supports files up to 50MB</span>
                    <input 
                      type="file" 
                      style={{ display: 'none' }} 
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea 
                    className="form-input" 
                    rows="3"
                    style={{ paddingLeft: '14px', resize: 'vertical' }}
                    placeholder="Enter short description of this asset..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (Optional, comma-separated)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. bills, tax, pdf"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    disabled={isUploading}
                  />
                </div>
              </div>

              <footer className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsUploadOpen(false)} 
                  className="btn btn-secondary" 
                  style={{ width: 'auto' }}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: 'auto' }}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Asset"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      {isShareOpen && sharingAsset && (
        <div className="modal-overlay">
          <div className="modal-card">
            <header className="modal-header">
              <h2 className="modal-title">Share "{sharingAsset.name}"</h2>
              <button onClick={() => setIsShareOpen(false)} className="modal-close-btn">
                &times;
              </button>
            </header>

            <form onSubmit={handleShareSubmit}>
              <div className="modal-body" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                {shareError && (
                  <div className="auth-error" style={{ marginBottom: '16px' }}>
                    {shareError}
                  </div>
                )}
                {shareSuccess && (
                  <div className="auth-error" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success-color)', color: '#a7f3d0', marginBottom: '16px' }}>
                    <Sparkles size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    {shareSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Share with Username</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter recipient's username"
                      value={shareRecipient}
                      onChange={(e) => setShareRecipient(e.target.value)}
                      disabled={isSharing}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Permission Level</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <select 
                      className="form-input" 
                      style={{ paddingLeft: '42px', appearance: 'none', background: 'var(--bg-tertiary)', width: '100%' }}
                      value={shareRole}
                      onChange={(e) => setShareRole(e.target.value)}
                      disabled={isSharing}
                    >
                      <option value="READER">Reader (View & Download)</option>
                      <option value="EDITOR">Editor (Edit, Compress & Extract)</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSharing}
                  style={{ marginBottom: '24px' }}
                >
                  {isSharing ? "Sharing..." : "Grant Access"}
                </button>

                {/* List of current shares */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                    People with Access
                  </h3>
                  {shareList.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>This file isn't shared with anyone yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {shareList.map(share => (
                        <div key={share.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{share.sharedWith}</span>
                            <span style={{ fontSize: '11px', color: 'var(--accent-light)', textTransform: 'uppercase', fontWeight: '600', marginTop: '2px' }}>{share.role}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRevokeShare(share.id)} 
                            className="btn-delete"
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <footer className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsShareOpen(false)} 
                  className="btn btn-secondary" 
                  style={{ width: 'auto' }}
                >
                  Close
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {isProfileOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <header className="modal-header">
              <h2 className="modal-title">Profile Settings</h2>
              <button onClick={() => setIsProfileOpen(false)} className="modal-close-btn">
                &times;
              </button>
            </header>

            <div className="modal-body" style={{ maxHeight: '480px', overflowY: 'auto' }}>
              {profileError && (
                <div className="auth-error" style={{ marginBottom: '16px' }}>
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="auth-error" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success-color)', color: '#a7f3d0', marginBottom: '16px' }}>
                  <Sparkles size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  {profileSuccess}
                </div>
              )}

              {/* Upload Profile Pic Section */}
              <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  Upload Custom Profile Picture
                </h3>
                <form onSubmit={handleProfilePictureUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setProfileFile(e.target.files[0])}
                    style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
                    disabled={isUpdatingProfile}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-start' }}
                    disabled={isUpdatingProfile || !profileFile}
                  >
                    {isUpdatingProfile ? "Uploading..." : "Upload Photo"}
                  </button>
                </form>
              </div>

              {/* Select Cartoon Animal Avatar Section */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Or Choose a Cartoon Animal Avatar
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Select one of these cute cartoon avatars to represent your account:
                </p>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '12px' 
                }}>
                  {[
                    { id: 'hacker-panda', name: 'Cyber Panda' },
                    { id: 'cyber-monkey', name: 'Neon Monkey' },
                    { id: 'rocket-koala', name: 'Astro Koala' },
                    { id: 'coding-owl', name: 'Hacker Owl' },
                    { id: 'detective-fox', name: 'Sherlock Fox' },
                    { id: 'cool-cat', name: 'Mustache Cat' }
                  ].map(avatar => {
                    const isSelected = currentUser?.animalAvatarType === avatar.id && !currentUser?.profilePicturePath;
                    return (
                      <div 
                        key={avatar.id}
                        onClick={() => handleSelectAnimalAvatar(avatar.id)}
                        style={{ 
                          background: 'var(--bg-tertiary)', 
                          border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)', 
                          borderRadius: '12px', 
                          padding: '12px', 
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 0 10px rgba(139, 92, 246, 0.2)' : 'none'
                        }}
                      >
                        {renderAvatarSvg(avatar.id, 50)}
                        <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>{avatar.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => setIsProfileOpen(false)} 
                className="btn btn-secondary" 
                style={{ width: 'auto' }}
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Floating Watermark in Bottom Right */}
      <div className="valutcore-watermark">
        <Sparkles size={16} className="watermark-icon" />
        <span>ValutCore</span>
      </div>
    </div>
  );
}

export default App;
