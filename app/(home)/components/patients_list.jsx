'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { inter } from '@/app/fonts';

export function PatientsList() {
  const [checkedInUsers, setCheckedInUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState({});
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
    if (selectedUser?.id !== patient.id) {
      setIsEditing(false);
    }
    setSelectedUser(selectedUser?.id === patient.id ? null : patient);
  };

  const handleEdit = () => {
    setEditingData(selectedUser);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, editingData);
      setCheckedInUsers((prev) =>
        prev.map((patient) =>
          patient.id === selectedUser.id ? { ...patient, ...editingData } : patient
        )
      );
      setSelectedUser((prev) => ({ ...prev, ...editingData }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleRemove = async () => {
    try {
      // Remove the patient from the checkedInUsers array in the host document
      const hostDocRef = doc(db, 'hosts', user.uid);
      await updateDoc(hostDocRef, {
        checkedInUsers: arrayRemove(selectedUser.id),
      });
      setCheckedInUsers(prev => prev.filter(patient => patient.id !== selectedUser.id));
      setSelectedUser(null);
    } catch (error) {
      console.error('Error removing patient:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-pulse text-blue-500 font-medium">
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
        <div className="p-8 text-center bg-gradient-to-b from-neutral-800/30 to-neutral-600/30 dark:from-neutral-800/90 dark:to-neutral-700/90 rounded-xl text-white">
          No patients have checked in yet.
        </div>
      ) : (
        <ul
          className={`space-y-4 bg-gradient-to-b from-neutral-800/30 to-neutral-600/30 dark:from-neutral-800/90 dark:to-neutral-700/90 rounded-xl shadow-xl ${
            !selectedUser && "divide-y-2 divide-neutral-300/30 dark:divide-neutral-600"}`
          }
        >
          {checkedInUsers.map((patient) => (
            <li 
              key={patient.id} 
              className="overflow-hidden"
            >
              <div 
                onClick={() => handleUserClick(patient)}
                className="p-4 hover:bg-neutral-700/60 dark:hover:bg-neutral-600/90 cursor-pointer flex justify-between gap-15 items-center transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  {/* PFP */}
                  <div className='bg-gradient-to-b from-neutral-200/40 to-neutral-400/40 dark:from-neutral-400/40 dark:to-neutral-700/40 rounded-full shadow-lg dark:shadow-neutral-900/30 flex items-center justify-center p-0.5 transition-all duration-300 w-8 h-8'>
                    <div className="w-full h-full bg-white/50 dark:bg-black/50 rounded-full flex items-center justify-center text-blue-500 font-medium">
                      {(patient.name?.charAt(0) || '?').toUpperCase()}
                    </div>
                  </div>

                  {/* Patient Name */}
                  <span className="font-medium text-white">
                    {patient.name || 'Unknown Patient'}
                  </span>
                </div>

                {/* Drop Down */}
                <div className="flex items-center gap-2">
                  <span className="text-md text-blue-500">
                    {selectedUser?.id === patient.id ? 'Hide details' : 'View details'}
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${selectedUser?.id === patient.id && 'rotate-180'} text-blue-500`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              {selectedUser?.id === patient.id && (
                <div className="animate-fadeIn border-t-2 border-neutral-300/30 dark:border-neutral-600">
                  <div className="p-5 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Patient Details</h3>
                    {!isEditing && (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleRemove}
                          title="Remove Patient"
                          className="p-2 rounded-md bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 text-white" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2h1l.447 8.894A2 2 0 007.447 16h5.106a2 2 0 001.999-1.106L15 6h1a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 6h6l-.447 8H7.447L7 6z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          onClick={handleEdit} 
                          className="px-3 py-1 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="p-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-sm text-neutral-300">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={editingData.name || ''}
                            onChange={handleInputChange}
                            className="p-2 bg-white/30 rounded-md"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm text-neutral-300">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={editingData.age || ''}
                            onChange={handleInputChange}
                            className="p-2 bg-white/30 rounded-md"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm text-neutral-300">Sex</label>
                          <input
                            type="text"
                            name="sex"
                            value={editingData.sex || ''}
                            onChange={handleInputChange}
                            className="p-2 bg-white/30 rounded-md"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm text-neutral-300">Race</label>
                          <input
                            type="text"
                            name="race"
                            value={editingData.race || ''}
                            onChange={handleInputChange}
                            className="p-2 bg-white/30 rounded-md"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm text-neutral-300">Ethnicity</label>
                          <input
                            type="text"
                            name="ethnicity"
                            value={editingData.ethnicity || ''}
                            onChange={handleInputChange}
                            className="p-2 bg-white/30 rounded-md"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm text-neutral-300">Weight</label>
                          <input
                            type="text"
                            name="weight"
                            value={editingData.weight || ''}
                            onChange={handleInputChange}
                            className="p-2 bg-white/30 rounded-md"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm text-neutral-300">Phone</label>
                          <input
                            type="text"
                            name="phone"
                            value={editingData.phone || ''}
                            onChange={handleInputChange}
                            className="p-2 bg-white/30 rounded-md"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex gap-4">
                        <button 
                          onClick={handleSave}
                          className="px-3 py-1 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="px-3 py-1 bg-white/50 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto p-5 pt-0">
                      <div className="grid sm:grid-cols-2 gap-4 pt-1">
                        <div className="bg-white/30 p-3 rounded-lg shadow-sm">
                          <span className="text-sm text-neutral-300">Name</span>
                          <div className="font-medium ">{patient.name || 'Not provided'}</div>
                        </div>
                        
                        {patient.age && (
                          <div className="bg-white/30 p-3 rounded-lg shadow-sm">
                            <span className="text-sm text-neutral-300">Age</span>
                            <div className="font-medium ">{patient.age}</div>
                          </div>
                        )}
                        
                        {patient.sex && (
                          <div className="bg-white/30 p-3 rounded-lg shadow-sm">
                            <span className="text-sm text-neutral-300">Sex</span>
                            <div className="font-medium ">{patient.sex}</div>
                          </div>
                        )}
                        
                        {patient.race && (
                          <div className="bg-white/30 p-3 rounded-lg shadow-sm">
                            <span className="text-sm text-neutral-300">Race</span>
                            <div className="font-medium ">{patient.race}</div>
                          </div>
                        )}
                        
                        {patient.ethnicity && (
                          <div className="bg-white/30 p-3 rounded-lg shadow-sm">
                            <span className="text-sm text-neutral-300">Ethnicity</span>
                            <div className="font-medium ">{patient.ethnicity}</div>
                          </div>
                        )}
                        
                        {patient.weight && (
                          <div className="bg-white/30 p-3 rounded-lg shadow-sm">
                            <span className="text-sm text-neutral-300">Weight</span>
                            <div className="font-medium ">{patient.weight}</div>
                          </div>
                        )}
                        
                        {patient.phone && (
                          <div className="bg-white/30 p-3 rounded-lg shadow-sm">
                            <span className="text-sm text-neutral-300">Phone</span>
                            <div className="font-medium ">{patient.phone}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}