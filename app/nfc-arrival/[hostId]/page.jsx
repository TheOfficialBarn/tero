"use client";
import { Inter } from "next/font/google";
import Image from "next/image";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "@/lib/firebase";
import { useState, useEffect, use } from "react";  // Add use to the imports

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function Page({ params }) {
  const unwrappedParams = use(params);  // Unwrap the params Promise
  const { hostId } = unwrappedParams;   // Now safely access hostId
  
  const [hostName, setHostName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHostName = async () => {
      try {
        const db = getFirestore(app);
        // Updated to fetch directly from the host document
        const hostDocRef = doc(db, 'hosts', hostId);
        const hostDocSnap = await getDoc(hostDocRef);

        if (!hostDocSnap.exists()) {
          throw new Error('Host not found');
        }

        // Access the hostName directly from the host document
        const name = hostDocSnap.data().hostName;
        if (!name) throw new Error('Host name not available');
        
        setHostName(name);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostName();
  }, [hostId]);

  // Append the PATIENT's ID to HOST ARRAY
  // MAYBE WE NEED TO SEE IF THE USER IS EVEN A PATIENT WE DON'T WANT DOCTOR STUFF
  const handleCheckIn = async () => {
    console.log("Handling check in begins")
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("No user logged in");

      const db = getFirestore(app);
      const hostDocRef = doc(db, "hosts", hostId);

      await updateDoc(hostDocRef, {
        checkedInUsers: arrayUnion(user.uid),
      });
      alert("You have been checked in!");
    } catch (error) {
      console.error("Check-in error:", error);
      alert(error.message);
    }
  };

  if (isLoading) return (
    <section className="h-screen flex items-center justify-center">
      <div className="text-white text-xl font-medium">Loading...</div>
    </section>
  );

  if (error) return (
    <section className="h-screen flex items-center justify-center">
      <div className="text-red-500 text-xl font-medium">
        Error: {error}
      </div>
    </section>
  );

  return (
    <section className="h-screen flex items-center justify-center snap-start p-4">
      <div className="bg-white/30 dark:bg-white/0 dark:bg-gradient-to-b dark:from-neutral-800/30 dark:to-neutral-600/30 rounded-3xl shadow-lg backdrop-blur-md flex flex-col items-center justify-center gap-8 p-10">
        <h3 className={`text-3xl text-white font-bold mb-2 ${inter.variable}`}>
          ✨ Check-In with {hostName || 'Your Host'} ✨
        </h3>
        
        <div className="p-6">
          <Image 
            src="/nfc.png" 
            width={160} 
            height={160} 
            alt="NFC clipart" 
            className="invert"
            priority // Important for LCP
          />
        </div>
        
        <button 
          className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-400 transition-colors duration-300 font-medium shadow-md flex items-center justify-center w-3/4"
          onClick={handleCheckIn}
        >
          Confirm Check-In
        </button>
        
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 text-center">
          Tap your device to share your medical information
        </p>
      </div>
    </section>
  );
}