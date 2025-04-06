"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'; 
import { auth, db } from '../lib/firebase'; // Adjust the path as necessary
import {onAuthStateChanged} from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            // Check if user exists in 'users' collection (patients)
            const patientDoc = await getDoc(doc(db, 'users', currentUser.uid));
            
            if (patientDoc.exists()) {
              // User is a patient
              setUser({ 
                ...currentUser, 
                ...patientDoc.data(),
                userType: 'patient' 
              });
            } else {
              // Check if user exists in 'hosts' collection
              const hostDoc = await getDoc(doc(db, 'hosts', currentUser.uid));
              
              if (hostDoc.exists()) {
                // User is a host
                setUser({ 
                  ...currentUser, 
                  ...hostDoc.data(),
                  userType: 'host' 
                });
              } else {
                // User exists in Firebase Auth but not in Firestore
                console.warn('User exists in Auth but not in Firestore:', currentUser.uid);
                setUser({ ...currentUser, userType: 'unknown' });
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUser({ ...currentUser, userType: 'unknown' });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    return (
      <AuthContext.Provider value={{ user, loading }}>
        {!loading && children}
      </AuthContext.Provider>
    );
  };
