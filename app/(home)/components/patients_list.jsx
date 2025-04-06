'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Inter } from 'next/font/google';

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
  });


export function PatientsList() {
  const [checkedInUsers, setCheckedInUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCheckedInUsers = async () => {
      if (!user || user.userType !== 'host') {
        setLoading(false);
        return;
      }

      try {
        // Get the host document to retrieve the checkedInUsers array
        const hostDocRef = doc(db, 'hosts', user.uid);
        const hostDoc = await getDoc(hostDocRef);
        
        if (hostDoc.exists() && hostDoc.data().checkedInUsers) {
          const userIds = hostDoc.data().checkedInUsers;
          
          // Fetch details for each checked-in user
          const userPromises = userIds.map(async (userId) => {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              return { id: userId, ...userDoc.data() };
            }
            return null;
          });
          
          const userData = await Promise.all(userPromises);
          setCheckedInUsers(userData.filter(Boolean)); // Remove any null values
        }
      } catch (error) {
        console.error('Error fetching checked-in users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckedInUsers();
  }, [user]);

  const handleUserClick = (patient) => {
    setSelectedUser(selectedUser?.id === patient.id ? null : patient);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-pulse text-blue-600 font-medium">
          Loading patients list...
        </div>
      </div>
    );
  }

  if (!user || user.userType !== 'host') {
    return (
      <div className="p-8 text-center">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 text-blue-700">
          Only hosts can view the patient list.
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white/30 dark:bg-white/0 dark:bg-gradient-to-b dark:from-neutral-800/30 dark:to-neutral-600/30 rounded-3xl shadow-lg backdrop-blur-md flex flex-col items-center justify-center gap-8 p-10 text-white">
      <h3 className={`text-3xl text-white font-bold mb-2 ${inter.variable}`}>
            Checked-In Patients
      </h3>
      
      {checkedInUsers.length === 0 ? (
        <div className="p-8 text-center bg-white/30 rounded-xl text-white">
          No patients have checked in yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {checkedInUsers.map((patient) => (
            <li 
              key={patient.id} 
              className="border rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div 
                onClick={() => handleUserClick(patient)}
                className="p-4 bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                    {(patient.name?.charAt(0) || '?').toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-800">
                    {patient.name || 'Unknown Patient'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${selectedUser?.id === patient.id ? 'text-blue-700' : 'text-blue-500'}`}>
                    {selectedUser?.id === patient.id ? 'Hide details' : 'View details'}
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${selectedUser?.id === patient.id ? 'rotate-180 text-blue-700' : 'text-blue-500'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              {selectedUser?.id === patient.id && (
                <div className="border-t border-blue-100 animate-fadeIn">
                  <div className="p-5 bg-blue-50">
                    <h3 className="font-semibold mb-4 text-blue-800 text-lg">Patient Details</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-5 pt-0 bg-blue-50">
                    <div className="grid sm:grid-cols-2 gap-4 pt-1">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <span className="text-sm text-gray-500">Name</span>
                        <div className="font-medium text-black">{patient.name || 'Not provided'}</div>
                      </div>
                      
                      {patient.age && (
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-sm text-gray-500">Age</span>
                          <div className="font-medium text-black">{patient.age}</div>
                        </div>
                      )}
                      
                      {patient.sex && (
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-sm text-gray-500">Sex</span>
                          <div className="font-medium text-black">{patient.sex}</div>
                        </div>
                      )}
                      
                      {patient.race && (
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-sm text-gray-500">Race</span>
                          <div className="font-medium text-black">{patient.race}</div>
                        </div>
                      )}
                      
                      {patient.ethnicity && (
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-sm text-gray-500">Ethnicity</span>
                          <div className="font-medium text-black">{patient.ethnicity}</div>
                        </div>
                      )}
                      
                      {patient.weight && (
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-sm text-gray-500">Weight</span>
                          <div className="font-medium text-black">{patient.weight}</div>
                        </div>
                      )}
                      
                      {patient.phone && (
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-sm text-gray-500">Phone</span>
                          <div className="font-medium text-black">{patient.phone}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}