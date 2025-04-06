'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';

export default function Page() {
  const { user, loading } = useAuth();
  const [hostID, setHostID] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch the hostID from Firebase
  useEffect(() => {
    const fetchHostID = async () => {
      if (!user) return;
      
      try {
        const hostDocRef = doc(db, 'hosts', user.uid);
        const snapshot = await getDoc(hostDocRef);
        
        if (snapshot.exists()) {
          setHostID(user.uid);
        } else {
          console.error('No host document found for this user.');
        }
      } catch (err) {
        console.error('Error fetching host document:', err);
      }
    };

    if (user) {
      fetchHostID();
    }
  }, [user]);

  const copyToClipboard = () => {
    const baseUrl = 'https://tero-seven.vercel.app/nfc-arrival/';
    const urlWithHostID = hostID ? `${baseUrl}${hostID}` : baseUrl;
    
    navigator.clipboard.writeText(urlWithHostID)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err);
      });
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-medium text-gray-600 mb-4">You need to be logged in to access this page</p>
        <a href="/login" className="text-blue-500 hover:text-blue-700">Go to login</a>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-8">Doc's Check-In Portal</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mb-8">
        <p className="text-gray-600 mb-6">
          Share this unique URL with your patients for easy check-in upon arrival.
        </p>
        
        <button
          onClick={copyToClipboard}
          className={`w-full py-3 px-4 rounded-lg transition-colors ${
            isCopied 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-blue-500 hover:bg-blue-600"
          } text-white font-medium`}
        >
          {isCopied ? "✓ Copied!" : "Copy Check-In URL"}
        </button>
      </div>
      
      {hostID && (
        <div className="bg-gray-50 rounded-lg p-4 w-full max-w-md border border-gray-200">
          <p className="text-gray-500 text-sm font-mono break-all">
            https://tero-seven.vercel.app/nfc-arrival/{hostID}
          </p>
        </div>
      )}
    </div>
  );
}