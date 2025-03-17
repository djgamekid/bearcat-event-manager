import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

function AdminProfile() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [adminData, setAdminData] = useState({
    username: '',
    email: '',
    role: 'admin',
    permissions: [],
    lastLogin: null,
    createdAt: null
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const adminRef = doc(db, 'users', currentUser.uid);
        const adminDoc = await getDoc(adminRef);
        
        if (adminDoc.exists()) {
          setAdminData({
            ...adminDoc.data(),
            id: adminDoc.id
          });
        }
      } catch (err) {
        setError('Error fetching admin data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAdminData();
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const adminRef = doc(db, 'users', currentUser.uid);
      await updateDoc(adminRef, {
        username: adminData.username,
        email: adminData.email,
        updatedAt: new Date()
      });

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `avatars/${currentUser.uid}`);
      await uploadBytes(storageRef, avatarFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Update user profile with new avatar URL
      await updateProfile({
        photoURL: downloadURL
      });

      // Update Firestore document
      const adminRef = doc(db, 'users', currentUser.uid);
      await updateDoc(adminRef, {
        photoURL: downloadURL,
        updatedAt: new Date()
      });

      setSuccess('Avatar updated successfully!');
      setShowAvatarModal(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err) {
      setError('Error updating avatar: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-ghost btn-circle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Admin Profile</h1>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6">
            <span>{success}</span>
          </div>
        )}

        <div className="bg-base-100 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <div className="avatar">
                <div className="w-24 rounded-full">
                  <img
                    src={currentUser?.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                    alt="Admin avatar"
                  />
                </div>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="btn btn-circle btn-ghost text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">{adminData.username}</h2>
              <p className="text-base opacity-70">{adminData.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <div className="flex justify-end">
                  <input
                    type="text"
                    value={adminData.username}
                    onChange={(e) => setAdminData(prev => ({ ...prev, username: e.target.value }))}
                    className="input input-bordered w-full max-w-md"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <div className="flex justify-end">
                  <input
                    type="email"
                    value={adminData.email}
                    onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                    className="input input-bordered w-full max-w-md"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text">Role</span>
                    <div className="badge badge-primary text-base px-4 py-2">{adminData.role}</div>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Last Login</span>
                  </label>
                  <p className="text-base">
                    {adminData.lastLogin ? new Date(adminData.lastLogin.toDate()).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Permissions</h3>
              <div className="flex flex-wrap gap-3 justify-end">
                {adminData.permissions?.map((permission, index) => (
                  <div key={index} className="badge badge-secondary text-base px-4 py-2">
                    {permission}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>

        {/* Avatar Edit Modal */}
        <dialog className={`modal ${showAvatarModal ? 'modal-open' : ''}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Update Profile Picture</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="avatar">
                <div className="w-32 rounded-full">
                  <img
                    src={avatarPreview || currentUser?.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                    alt="Avatar preview"
                  />
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="file-input file-input-bordered w-full max-w-xs"
              />
              {error && (
                <div className="alert alert-error w-full">
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="alert alert-success w-full">
                  <span>{success}</span>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowAvatarModal(false);
                  setAvatarPreview(null);
                  setAvatarFile(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`btn btn-primary ${uploading ? 'loading' : ''}`}
                onClick={handleAvatarUpload}
                disabled={!avatarFile || uploading}
              >
                Update
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
}

export default AdminProfile; 