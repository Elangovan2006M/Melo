import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    
    const userDoc = doc(db, 'users', uid);
    await setDoc(userDoc, {
      email: email,
      createdAt: new Date(),
    });

    const libraryOrderDoc = doc(db, 'users', uid, 'libraryOrder', 'main');
    await setDoc(libraryOrderDoc, { songOrder: [] });
    
    const favoritesOrderDoc = doc(db, 'users', uid, 'favoritesOrder', 'main');
    await setDoc(favoritesOrderDoc, { songOrder: [] });

    return userCredential;
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};