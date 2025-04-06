"use client";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { auth, db } from "../../../lib/firebase"; // Import Firebase auth and Firestore
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export function Profile() {
  const [user, setUser] = useState(null); // State to store the logged-in user
  const [profileData, setProfileData] = useState(null); // State to store the user's profile data
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State to track edit mode
  const [formData, setFormData] = useState({}); // State for form data
  const [updateLoading, setUpdateLoading] = useState(false); // State to track update progress

  // Fetch the logged-in user's profile data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser); // Set the logged-in user
        const userDocRef = doc(db, "users", currentUser.uid); // Reference to the user's Firestore document
        const userDoc = await getDoc(userDocRef); // Fetch the document
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData(data); // Set the profile data
          setFormData(data); // Initialize form data with current profile data
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null); // No user is logged in
        setProfileData(null); // Clear profile data
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, formData);
      setProfileData(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData(profileData); // Reset form data
    setIsEditing(false);
  };

  return (
    <section className="bg-white/30 backdrop-blur-md dark:bg-white/0 dark:from-neutral-800/50 dark:to-neutral-600/50 dark:bg-gradient-to-b rounded-3xl shadow-xl flex flex-col w-full sm:w-1/2 overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="bg-gradient-to-d from-white to-neutral-600 p-6">
        <h3 className={`text-white text-3xl font-bold text-center ${inter.variable}`}>Profile</h3>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          <p className="text-gray-300 mt-4">Loading your profile...</p>
        </div>
      ) : user && profileData ? (
        <div className="flex flex-col items-center p-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-t from-neutral-400 to-neutral-500 mb-6 ring-4 ring-white/10">
            {profileData.photoURL ? (
              <Image 
                src={profileData.photoURL} 
                alt="Profile picture"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-3xl font-bold">
                {profileData.name ? profileData.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="bg-white/20 rounded-xl p-6 w-full max-w-md backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name || ''} 
                    onChange={handleChange} 
                    className="bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Age</label>
                  <input 
                    type="number" 
                    name="age" 
                    value={formData.age || ''} 
                    onChange={handleChange} 
                    className="bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Gender</label>
                  <select 
                    name="sex" 
                    value={formData.sex || ''} 
                    onChange={handleChange} 
                    className="bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

              </div>
              
              <div className="flex justify-between mt-6">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="bg-white/20 rounded-xl p-6 w-full max-w-md backdrop-blur-sm">
                <div className="space-y-4 text-neutral-800 dark:text-white">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <div><span className="text-gray-400">Name:</span> {profileData.name || "Not set"}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <div><span className="text-gray-400">Email:</span> {user.email}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div><span className="text-gray-400">Age:</span> {profileData.age || "Not set"}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <div><span className="text-gray-400">Gender:</span> {profileData.sex || "Not set"}</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditing(true)} 
                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <p className="text-white mt-4">Please sign in to view your profile</p>
        </div>
      )}
    </section>
  );
}