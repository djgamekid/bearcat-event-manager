import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewingAsUser, setViewingAsUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role: 'user', // Default role
            createdAt: new Date().toISOString()
          });
          setIsAdmin(false);
        } else {
          // Check if user is admin
          const isUserAdmin = userDoc.data().role === 'admin';
          setIsAdmin(isUserAdmin);
          
          // Check if admin is viewing as user
          const adminViewing = localStorage.getItem('adminViewingAsUser') === 'true';
          setViewingAsUser(isUserAdmin && adminViewing);
        }
      } else {
        setIsAdmin(false);
        setViewingAsUser(false);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email, password, role = 'user') => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role,
        createdAt: new Date().toISOString()
      });

      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      // Clear admin viewing state before logout
      localStorage.removeItem('adminViewingAsUser');
      localStorage.removeItem('viewingAsUserId');
      setViewingAsUser(false);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const switchToUserView = () => {
    if (isAdmin) {
      localStorage.setItem('adminViewingAsUser', 'true');
      setViewingAsUser(true);
    }
  };

  const returnToAdminView = () => {
    localStorage.removeItem('adminViewingAsUser');
    localStorage.removeItem('viewingAsUserId');
    setViewingAsUser(false);
  };

  const value = {
    currentUser,
    loading,
    error,
    isAdmin,
    viewingAsUser,
    signup,
    login,
    resetPassword,
    logout,
    switchToUserView,
    returnToAdminView
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 