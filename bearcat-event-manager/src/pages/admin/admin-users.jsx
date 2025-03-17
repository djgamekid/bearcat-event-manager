import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EyeIcon } from '@heroicons/react/24/solid';

function AdminUsers() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingAsUser, setViewingAsUser] = useState(false);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (err) {
        setError('Error fetching users: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user status update
  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: newStatus });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (err) {
      setError('Error updating user status: ' + err.message);
    }
  };

  // Handle viewing as user
  const handleViewAsUser = (user) => {
    setViewingAsUser(true);
    // Store admin state in localStorage
    localStorage.setItem('adminViewingAsUser', 'true');
    localStorage.setItem('viewingAsUserId', user.id);
    // Redirect to user view
    navigate('/');
  };

  // Handle returning to admin view
  const handleReturnToAdmin = () => {
    localStorage.removeItem('adminViewingAsUser');
    localStorage.removeItem('viewingAsUserId');
    setViewingAsUser(false);
    navigate('/admin');
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
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-ghost btn-circle"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered w-full max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table className="table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img
                            src={user.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                            alt={user.username}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm opacity-50">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="select select-bordered select-sm"
                      value={user.status || 'active'}
                      onChange={(e) => handleStatusUpdate(user.id, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.role === 'admin' ? 'badge-primary' : 'badge-secondary'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleViewAsUser(user)}
                        title="View as User"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">User Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-24 rounded-full">
                      <img
                        src={selectedUser.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                        alt={selectedUser.username}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedUser.username}</h4>
                    <p className="text-sm opacity-70">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-70">Status</p>
                    <p className="font-medium">{selectedUser.status || 'active'}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Role</p>
                    <p className="font-medium">{selectedUser.role || 'user'}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Joined</p>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Last Login</p>
                    <p className="font-medium">
                      {selectedUser.lastLogin ? 
                        new Date(selectedUser.lastLogin).toLocaleString() : 
                        'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewAsUser(selectedUser)}
                  >
                    View as User
                  </button>
                </div>
              </div>

              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers; 