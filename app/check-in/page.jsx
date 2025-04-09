'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { inter } from '../fonts';

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
    const baseUrl = 'https://terosecuremd.vercel.app/nfc-arrival/';
    const urlWithHostID = hostID ? `${baseUrl}${hostID}` : baseUrl;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(urlWithHostID)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Clipboard API failed:', err);
          fallbackCopyToClipboard(urlWithHostID);
        });
    } else {
      // Use fallback for iOS
      fallbackCopyToClipboard(urlWithHostID);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    // Create temporary input element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';  // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      // Execute copy command
      const successful = document.execCommand('copy');
      setIsCopied(successful);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Fallback clipboard method failed:', err);
    }
    
    document.body.removeChild(textArea);
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
    <section className="h-screen flex items-center justify-center snap-start">
      <div className="bg-white/30 dark:bg-white/0 dark:bg-gradient-to-b dark:from-neutral-800/30 dark:to-neutral-600/30 rounded-3xl shadow-lg backdrop-blur-md p-10 text-white flex flex-col gap-6 w-full max-w-md mx-4">
        <h3 className={`text-3xl text-white font-bold text-center ${inter.variable}`}>
          Doc's Check-In Portal
        </h3>
        
        <div className="p-6 text-center bg-white/30 rounded-xl text-white">
          <p className="mb-4">
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
          <div className="bg-gray-50 rounded-lg p-4 w-full border border-gray-200">
            <p className="text-gray-500 text-sm font-mono break-all select-text cursor-text">
              https://terosecuremd.vercel.app/nfc-arrival/{hostID}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}