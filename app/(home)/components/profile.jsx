// For seeing profile stuff and being able to edit it

"use client";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { auth, db } from "../../../lib/firebase"; // Import Firebase auth and Firestore
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export function Profile() {
  const [user, setUser] = useState(null); // State to store the logged-in user
  const [profileData, setProfileData] = useState(null); // State to store the user's profile data

  // Fetch the logged-in user's profile data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the logged-in user
        const userDocRef = doc(db, "users", currentUser.uid); // Reference to the user's Firestore document
        const userDoc = await getDoc(userDocRef); // Fetch the document
        if (userDoc.exists()) {
          setProfileData(userDoc.data()); // Set the profile data
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null); // No user is logged in
        setProfileData(null); // Clear profile data
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  return (
    <>
      <div className="bg-[rgba(130,130,130,0.5)] rounded-3xl m-2 flex flex-col items-center justify-center p-20">
        <h3 className={`text-white text-3xl font-bold mb-4 ${inter.variable}`}>✨ Profile ✨</h3>
        {user && profileData ? (
          <div className="text-white text-lg">
            <p><strong>Name:</strong> {profileData.name || "N/A"}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Age:</strong> {profileData.age || "N/A"}</p>
            <p><strong>Gender:</strong> {profileData.gender || "N/A"}</p>
          </div>
        ) : (
          <p className="text-white">Loading profile...</p>
        )}
      </div>
    </>
  );
}