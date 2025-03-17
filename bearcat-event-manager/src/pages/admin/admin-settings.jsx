import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

function AdminSettings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    eventNotifications: true,
    userNotifications: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
    twoFactorAuth: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const adminRef = doc(db, 'users', currentUser.uid);
        const adminDoc = await getDoc(adminRef);
        
        if (adminDoc.exists() && adminDoc.data().settings) {
          setSettings(adminDoc.data().settings);
        }
      } catch (err) {
        setError('Error fetching settings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchSettings();
    }
  }, [currentUser]);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const adminRef = doc(db, 'users', currentUser.uid);
      await updateDoc(adminRef, {
        settings: settings,
        updatedAt: new Date()
      });

      setSuccess('Settings updated successfully!');
    } catch (err) {
      setError('Error updating settings: ' + err.message);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold">Admin Settings</h1>
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
          <form onSubmit={handleUpdateSettings} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label cursor-pointer justify-between">
                    <span className="label-text text-base">Email Notifications</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-between">
                    <span className="label-text text-base">Event Notifications</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.eventNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, eventNotifications: e.target.checked }))}
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-between">
                    <span className="label-text text-base">User Notifications</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.userNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, userNotifications: e.target.checked }))}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base">Language</span>
                  </label>
                  <div className="flex justify-end">
                    <select
                      className="select select-bordered text-base w-full max-w-md"
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base">Timezone</span>
                  </label>
                  <div className="flex justify-end">
                    <select
                      className="select select-bordered text-base w-full max-w-md"
                      value={settings.timezone}
                      onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="CST">Central Time</option>
                      <option value="MST">Mountain Time</option>
                      <option value="PST">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label cursor-pointer justify-between">
                    <span className="label-text text-base">Two-Factor Authentication</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => setSettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                    />
                  </label>
                </div>
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
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings; 