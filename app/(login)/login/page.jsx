'use client';
import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { useRouter } from 'next/navigation'; // Import Next.js router for navigation
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
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
	const [user, setUser] = useState(null); // State to store user
	const router = useRouter(); // Initialize the router

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			if (currentUser) {
				setUser(currentUser);
				setIsLoggedIn(true); // Update the login status
			} else {
				setUser(null);
				setIsLoggedIn(false); // Update the login status
			}
		});
		return () => unsubscribe(); // Cleanup subscription on unmount
	}, []);

	const handleLogin = async () => {
	  try {
		// Sign in the user with email and password
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
  
		console.log('User signed in:', user);
		setIsLoggedIn(true); // Update the login status
		setUser(user); // Set the user state
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

		router.push('/'); // Redirect to home page after signup
	  } catch (error) {
		console.error('Error creating account:', error);
		alert('Error creating account. Please try again.');
	  }
	};

	  const handleLogout = () => {
		// Perform logout logic
		auth.signOut()
		  .then(() => {
			console.log('User logged out');
			setEmail(''); // Clear the email field
			setPassword(''); // Clear the password field
			setIsLoggedIn(false); // Update the logged-in state
		  })
		  .catch((error) => {
			console.error('Error logging out:', error);
		  });
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
				<select
					value={gender}
					onChange = {(e) => setGender(e.target.value)}
					className="mb-4 px-4 py-2 border rounded-md"
				>
					<option value = "" disabled> Select your gender</option>
					<option value = "male">Male</option>
					<option value = "female">Female</option>
				</select>
				setIsLogin(true);
			</>
		)}
	</form>
      <button
        onClick={isLogin ? handleLogin : handleSignUp}
        className="bg-rose-900 text-teal-600 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
      >
        {isLogin ? 'Login' : 'Sign Up'}
      </button>
	  <div className="mt-4">
        <p className="text-gray-600">Don't have an account?</p>
        <button
          onClick= {() => setIsLogin(!isLogin)}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
        >
          {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
        </button> 
      </div>
	  {isLoggedIn && user && <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">Logout</button>}
	  {user && (
		<>
			<p className = 'mt-4'>Logged in as: {user.email}</p>
		</>
	  )}
    </div>
	);

	}