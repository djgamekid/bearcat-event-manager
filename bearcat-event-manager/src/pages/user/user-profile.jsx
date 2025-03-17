import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import NavbarUser from '../../components/navbar-user';
import { 
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    BellIcon,
    ShieldCheckIcon,
    KeyIcon
} from "@heroicons/react/24/outline";

function UserProfile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editMode, setEditMode] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
        phone: "",
        address: "",
        notificationPreferences: {
            email: true,
            push: true,
            sms: false
        },
        privacySettings: {
            showEmail: false,
            showPhone: false,
            showAddress: false
        }
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserProfile(userData);
                    setFormData({
                        displayName: userData.displayName || "",
                        email: userData.email || currentUser.email,
                        phone: userData.phone || "",
                        address: userData.address || "",
                        notificationPreferences: userData.notificationPreferences || {
                            email: true,
                            push: true,
                            sms: false
                        },
                        privacySettings: userData.privacySettings || {
                            showEmail: false,
                            showPhone: false,
                            showAddress: false
                        }
                    });
                }
            } catch (err) {
                setError("Failed to load profile data");
                console.error("Error fetching user profile:", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchUserProfile();
        }
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (type) => {
        setFormData(prev => ({
            ...prev,
            notificationPreferences: {
                ...prev.notificationPreferences,
                [type]: !prev.notificationPreferences[type]
            }
        }));
    };

    const handlePrivacyChange = (type) => {
        setFormData(prev => ({
            ...prev,
            privacySettings: {
                ...prev.privacySettings,
                [type]: !prev.privacySettings[type]
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                ...formData,
                updatedAt: new Date()
            });
            setSuccess("Profile updated successfully!");
            setEditMode(false);
        } catch (err) {
            setError("Failed to update profile");
            console.error("Error updating profile:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <NavbarUser />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <NavbarUser />
            <div className="min-h-screen bg-base-200 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary mb-4"
                    >
                        ← Back
                    </button>
                    <div className="flex flex-col gap-6">
                        {/* Profile Header */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="flex items-center gap-6">
                                    <div className="avatar">
                                        <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                            {currentUser?.photoURL ? (
                                                <img src={currentUser.photoURL} alt="Profile" />
                                            ) : (
                                                <div className="bg-primary/10 flex items-center justify-center">
                                                    <UserCircleIcon className="h-12 w-12 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold">{formData.displayName || "Your Profile"}</h1>
                                        <p className="text-base-content/60">Manage your personal information and preferences</p>
                                    </div>
                                    <button
                                        className={`btn ${editMode ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setEditMode(!editMode)}
                                    >
                                        {editMode ? 'Save Changes' : 'Edit Profile'}
                                    </button>
                                </div>

                                {/* Alert Messages */}
                                {error && (
                                    <div className="alert alert-error mt-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}
                                {success && (
                                    <div className="alert alert-success mt-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{success}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <UserCircleIcon className="h-6 w-6 text-primary" />
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Display Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="displayName"
                                                value={formData.displayName}
                                                onChange={handleInputChange}
                                                className="input input-bordered"
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Email</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="input input-bordered"
                                                disabled={true}
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Phone Number</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="input input-bordered"
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Address</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="input input-bordered"
                                                disabled={!editMode}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Preferences */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <BellIcon className="h-6 w-6 text-primary" />
                                        Notification Preferences
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-primary"
                                                    checked={formData.notificationPreferences.email}
                                                    onChange={() => handleNotificationChange('email')}
                                                    disabled={!editMode}
                                                />
                                                <span className="label-text">Email Notifications</span>
                                            </label>
                                        </div>
                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-primary"
                                                    checked={formData.notificationPreferences.push}
                                                    onChange={() => handleNotificationChange('push')}
                                                    disabled={!editMode}
                                                />
                                                <span className="label-text">Push Notifications</span>
                                            </label>
                                        </div>
                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-primary"
                                                    checked={formData.notificationPreferences.sms}
                                                    onChange={() => handleNotificationChange('sms')}
                                                    disabled={!editMode}
                                                />
                                                <span className="label-text">SMS Notifications</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Settings */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <ShieldCheckIcon className="h-6 w-6 text-primary" />
                                        Privacy Settings
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-primary"
                                                    checked={formData.privacySettings.showEmail}
                                                    onChange={() => handlePrivacyChange('showEmail')}
                                                    disabled={!editMode}
                                                />
                                                <span className="label-text">Show email to other users</span>
                                            </label>
                                        </div>
                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-primary"
                                                    checked={formData.privacySettings.showPhone}
                                                    onChange={() => handlePrivacyChange('showPhone')}
                                                    disabled={!editMode}
                                                />
                                                <span className="label-text">Show phone number to other users</span>
                                            </label>
                                        </div>
                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-primary"
                                                    checked={formData.privacySettings.showAddress}
                                                    onChange={() => handlePrivacyChange('showAddress')}
                                                    disabled={!editMode}
                                                />
                                                <span className="label-text">Show address to other users</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {editMode && (
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => setEditMode(false)}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="loading loading-spinner"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>

                        {/* Security Section */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <KeyIcon className="h-6 w-6 text-primary" />
                                    Security
                                </h2>
                                <div className="space-y-4">
                                    <button
                                        className="btn btn-outline w-full md:w-auto"
                                        onClick={() => navigate('/change-password')}
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserProfile; 