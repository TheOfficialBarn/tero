'use client';

import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firestore functions
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Auth functions
import firebaseApp from '../../lib/firebase'; // Import your Firebase configuration

export default function Page() {
  const [hostID, setHostID] = useState(null);

  // Fetch the hostID from Firebase
  useEffect(() => {
	const fetchHostID = async (uid) => {
	  try {
		const db = getFirestore(firebaseApp);
		const hostDocRef = doc(db, 'hosts', uid); // Use the logged-in user's UID as the document ID
		const snapshot = await getDoc(hostDocRef);
		if (snapshot.exists()) {
		  setHostID(uid); // Set the hostID to the logged-in user's UID
		} else {
		  console.error('No host document found for this user.');
		}
	  } catch (err) {
		console.error('Error fetching host document:', err);
	  }
	};

	const auth = getAuth(firebaseApp);
	const unsubscribe = onAuthStateChanged(auth, (user) => {
	  if (user) {
		fetchHostID(user.uid); // Pass the logged-in user's UID to fetchHostID
	  } else {
		console.error('No user is logged in.');
	  }
	});

	return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

const copyToClipboard = () => {
  const baseUrl = 'https://tero-7.vercel.app/nfc-arrival/'; // Custom base URL
  const urlWithHostID = hostID ? `${baseUrl}${hostID}` : baseUrl; // Append hostID if available
  navigator.clipboard.writeText(urlWithHostID) // Copy the URL to the clipboard
	.then(() => {
	  alert(`URL copied to clipboard: ${urlWithHostID}`); // Notify the user
	})
	.catch((err) => {
	  console.error('Failed to copy URL:', err);
	  alert('Failed to copy URL. Please try again.');
	});
};

  return (
	<div style={{ textAlign: 'center', marginTop: '50px' }}>
	  <h1>Doc's Check-In</h1>
	  <button
		onClick={copyToClipboard}
		style={{
		  backgroundColor: '#4CAF50',
		  color: 'white',
		  padding: '10px 20px',
		  fontSize: '16px',
		  border: 'none',
		  borderRadius: '5px',
		  cursor: 'pointer',
		  transition: 'background-color 0.3s ease',
		}}
		onMouseOver={(e) => (e.target.style.backgroundColor = '#45a049')}
		onMouseOut={(e) => (e.target.style.backgroundColor = '#4CAF50')}
	  >
		Copy URL to Clipboard
	  </button>
	</div>
  );
}