'use client';
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation'; // Import Next.js router for navigation
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { withCoalescedInvoke } from 'next/dist/lib/coalesced-function';
export default function Page() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [age, setAge] = useState(''); // State to store age
	const [gender, setGender] = useState('');
	const [name, setName] = useState(''); // State to store name
	const [phone, setPhone] = useState(''); // State to store phone number	
	const [ethnicity, setEthnicity] = useState('');
	const [race, setRace] = useState('');
	const [weight, setWeight] = useState(''); // State to store weight
	const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
	const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup
	const router = useRouter(); // Initialize the router

	const handleLogin = async () => {
	  try {
		// Sign in the user with email and password
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
  
		console.log('User signed in:', user);
		setIsLoggedIn(true); // Update the login status
		alert(`Welcome back, ${user.email}!`);
	  } catch (error) {
		if (error.code === 'auth/user-not-found') {
		  alert('U dont exist srry blud');
		} else {
		  console.error('Error signing in:', error);
		  alert('Error signing in. Please try again.');
		}
		};
	}

	const handleSignUp = async () => {
		setIsLogin(false); // Set to false to indicate signup mode
	  try{
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;

		await setDoc(doc(db, 'users', user.uid), {
			email: user.email,
			name: name,
			age: age,
			gender: gender,
			race: race,
			ethnicity: ethnicity,
			weight: weight,
			phone: phone,
			createdAt: new Date(),
		});

		console.log('New user created and profile saved:', user);
		alert(`Welcome, ${user.email}!`);
		router.push('/'); // Redirect to home page after signup

	  } catch (error) {
		console.error('Error creating account:', error);
		alert('Error creating account. Please try again.');
	  }
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (isLogin) {
		  handleLogin();
		} else {
		  handleSignUp();
		}
	  };

	return (
	<div>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
	  <form onSubmit = {handleSubmit} className="flex flex-col items-center">
      	<input
        	type="email"
        	placeholder="Email"
        	value={email}
        	onChange={(e) => setEmail(e.target.value)}
        	className="mb-2 px-4 py-2 border rounded-md"
      	/>
      	<input
        	type="password"
        	placeholder="Password"
        	value={password}
        	onChange={(e) => setPassword(e.target.value)}
        	className="mb-4 px-4 py-2 border rounded-md"
      	/>
		{!isLogin && (
			<>
				<input
					type="name"
					placeholder="Enter your Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mb-4 px-4 py-2 border rounded-md"
				/>
				<input
					type="age"
					placeholder="Enter your age"
					value={age}
					onChange={(e) => setAge(e.target.value)}
					className="mb-4 px-4 py-2 border rounded-md"
				/>
				<input
					type="weight"
					placeholder="Enter your weight (lbs)"
					value={weight}
					onChange={(e) => setWeight(e.target.value)}
					className="mb-4 px-4 py-2 border rounded-md"
				/>
				<input
					type="phone"
					placeholder="Enter your phone number"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					className="mb-4 px-4 py-2 border rounded-md"
				/>
				<select
					value={race}
					onChange ={(e) => setRace(e.target.value)}
					className="mb-4 px-4 py-2 border rounded-md"
				>
					<option value = "" disabled> Select your race</option>
					<option value = "white">White</option>
					<option value = "black">Black</option>
					<option value = "asian">Asian</option>
					<option value = "hispanic">Hispanic</option>
					<option value = "native american">Native American</option>
					<option value = "other">Other</option>
				</select>
				<input
					type="ethnicity"
					placeholder="Enter your ethnicity"
					value={ethnicity}
					onChange={(e) => setEthnicity(e.target.value)}
					className="mb-4 px-4 py-2 border rounded-md"
				/>
				<button type="submit" className="buttonStyle" onClick={handleSignUp}>Sign Up</button>
			</>
		)}
	</form>
      <button
        onClick={handleLogin}
        className="bg-rose-900 text-teal-600 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
      >
        Sign in
      </button>
	  <div className="mt-4">
        <p className="text-gray-600">Don't have an account?</p>
        <button
          onClick= {() => setIsLogin(false)}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
        >
          Go to Signup
        </button>
      </div>
    </div>
	);

}