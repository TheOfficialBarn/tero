"use client";
import { useEffect, useState } from "react";
import { inter } from "@/app/fonts";
import { auth, db } from "../../../lib/firebase"; // Import Firebase auth and Firestore
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";

export function Profile() {
  const [user, setUser] = useState(null); // State to store the logged-in user
  const [profileData, setProfileData] = useState(null); // State to store the user's profile data
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State to track edit mode
  const [formData, setFormData] = useState({}); // State for form data
  const [updateLoading, setUpdateLoading] = useState(false); // State to track update progress

  // Fetch the logged-in user's profile data
  useEffect(() => {
    function unsubscribe() {
      onAuthStateChanged(auth, async (currentUser) => {
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
    }

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
              <div className="space-y-4 h-56 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name || ''} 
                    onChange={handleChange} 
                    className="bg-neutral-200 dark:bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Age</label>
                  <input 
                    type="number" 
                    name="age" 
                    value={formData.age || ''} 
                    onChange={handleChange} 
                    className="bg-neutral-200 dark:bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Gender</label>
                  <select 
                    name="sex" 
                    value={formData.sex || ''} 
                    onChange={handleChange} 
                    className="bg-neutral-200 dark:bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Weight (lbs)</label>
                  <input 
                    type="number" 
                    name="weight" 
                    value={formData.weight || ''} 
                    onChange={handleChange} 
                    className="bg-neutral-200 dark:bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleChange} 
                    className="bg-neutral-200 dark:bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Race</label>
                  <select 
                    name="race" 
                    value={formData.race || ''} 
                    onChange={handleChange} 
                    className="bg-neutral-200 dark:bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  >
                    <option value="">Select race</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="asian">Asian</option>
                    <option value="native american">Native American</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-gray-400 mb-1">Ethnicity</label>
                  <input 
                    type="text" 
                    name="ethnicity" 
                    value={formData.ethnicity || ''} 
                    onChange={handleChange} 
                    className="bg-neutral-200 dark:bg-white/30 rounded-lg px-3 py-2 text-neutral-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
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
                <div className="space-y-4 text-neutral-800 dark:text-white h-48 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
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
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                    <div><span className="text-gray-400">Weight:</span> {profileData.weight ? `${profileData.weight} lbs` : "Not set"}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <div><span className="text-gray-400">Phone:</span> {profileData.phone || "Not set"}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div><span className="text-gray-400">Race:</span> {profileData.race ? profileData.race.charAt(0).toUpperCase() + profileData.race.slice(1) : "Not set"}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <div><span className="text-gray-400">Ethnicity:</span> {profileData.ethnicity || "Not set"}</div>
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