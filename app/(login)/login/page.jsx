'use client';

import { Inter } from "next/font/google";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { useRouter } from 'next/navigation';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
} from 'firebase/auth';

// A reusable form component for both login and sign up
function AuthForm({
	isLogin,
	onSubmit,
	email,
	setEmail,
	password,
	setPassword,
	extraFields,
	setExtraFields,
}) {
	return (
		<form onSubmit={onSubmit} className="flex flex-col items-center w-full">
			<input 
				type="email" 
				placeholder="Email" 
				value={email} 
				onChange={(e) => setEmail(e.target.value)} 
				className="w-full mb-2 px-4 py-2 bg-white/30 rounded-md" 
			/>
			<input 
				type="password" 
				placeholder="Password" 
				value={password} 
				onChange={(e) => setPassword(e.target.value)} 
				className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
			/>
			{!isLogin && (
				<>
					<input 
						type="text" 
						placeholder="Full Name" 
						value={extraFields.name} 
						onChange={(e) =>
							setExtraFields({ ...extraFields, name: e.target.value })
						} 
						className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
					/>
					<input 
						type="number" 
						placeholder="Age" 
						value={extraFields.age} 
						onChange={(e) =>
							setExtraFields({ ...extraFields, age: e.target.value })
						} 
						className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
					/>
					<input 
						type="number" 
						placeholder="Weight (lbs)" 
						value={extraFields.weight} 
						onChange={(e) =>
							setExtraFields({ ...extraFields, weight: e.target.value })
						} 
						className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
					/>
					<input 
						type="tel" 
						placeholder="Phone Number" 
						value={extraFields.phone} 
						onChange={(e) =>
							setExtraFields({ ...extraFields, phone: e.target.value })
						} 
						className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
					/>
					<select
						value={extraFields.race}
						onChange={(e) =>
							setExtraFields({ ...extraFields, race: e.target.value })
						}
						className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md"
					>
						<option value="" disabled>Race</option>
						<option value="white">White</option>
						<option value="black">Black</option>
						<option value="asian">Asian</option>
						<option value="native american">Native American</option>
						<option value="other">Other</option>
					</select>
					<input 
						type="text" 
						placeholder="Ethnicity" 
						value={extraFields.ethnicity} 
						onChange={(e) =>
							setExtraFields({ ...extraFields, ethnicity: e.target.value })
						} 
						className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
					/>
					<select
						value={extraFields.sex}
						onChange={(e) =>
							setExtraFields({ ...extraFields, sex: e.target.value })
						}
						className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md"
					>
						<option value="" disabled>Sex</option>
						<option value="male">Male</option>
						<option value="female">Female</option>
					</select>
				</>
			)}
		</form>
	);
}

export default function Page() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [extraFields, setExtraFields] = useState({
		name: '',
		age: '',
		sex: '',
		phone: '',
		ethnicity: '',
		race: '',
		weight: '',
	});
	const [user, setUser] = useState(null);
	const [isLogin, setIsLogin] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
		});
		return unsubscribe;
	}, []);

	const handleLogin = async (e) => {
		e && e.preventDefault();
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;
			console.log('User signed in:', user);
			setUser(user);
			alert(`Welcome back, ${user.email}!`);
		} catch (error) {
			if (error.code === 'auth/user-not-found') {
				alert('User not found.');
			} else {
				console.error('Error signing in:', error);
				alert('Error signing in. Please try again.');
			}
		}
	};

	const handleSignUp = async (e) => {
		e && e.preventDefault();
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;
			await setDoc(doc(db, 'users', user.uid), {
				email: user.email,
				name: extraFields.name,
				age: extraFields.age,
				sex: extraFields.sex,
				race: extraFields.race,
				ethnicity: extraFields.ethnicity,
				weight: extraFields.weight,
				phone: extraFields.phone,
				createdAt: new Date(),
			});
			setUser(user);
			router.push('/');
		} catch (error) {
			console.error('Error creating account:', error);
			alert('Error creating account. Please try again.');
		}
	};

	const handleLogout = async () => {
		try {
			await signOut(auth);
			console.log('User logged out');
			setEmail('');
			setPassword('');
			setExtraFields({
				name: '',
				age: '',
				sex: '',
				phone: '',
				ethnicity: '',
				race: '',
				weight: '',
			});
			setUser(null);
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		isLogin ? handleLogin() : handleSignUp();
	};

	return user ? (
		<section className="h-screen flex justify-center items-center">
			<div className="bg-[rgba(130,130,130,0.5)] rounded-3xl p-6 m-2 flex flex-col items-center justify-center ">
			<h3 className={`text-white text-3xl font-bold mb-4 text-center ${inter.variable}`}>Logged In 🥳</h3>
			<button
				onClick={handleLogout}
				className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors mt-4"
			>
				Logout
			</button>
			<p className="mt-4">Logged in as: {user.email}</p>
			</div>
		</section>
	) : (
		<section className="h-screen flex justify-center items-center">
			<div className="bg-[rgba(130,130,130,0.5)] rounded-3xl p-6 m-2 flex flex-col items-center justify-center ">
				<h3 className={`text-white text-3xl font-bold mb-4 text-center ${inter.variable}`}>
					Secure. Easy.
				</h3>
				<h3 className={`text-white text-3xl font-bold mb-4 text-center ${inter.variable}`}>
					Blazing Fast.
				</h3>
				<AuthForm
					isLogin={isLogin}
					onSubmit={handleSubmit}
					email={email}
					setEmail={setEmail}
					password={password}
					setPassword={setPassword}
					extraFields={extraFields}
					setExtraFields={setExtraFields}
				/>
				<button
					onClick={isLogin ? handleLogin : handleSignUp}
					className="w-full px-4 py-2 rounded-md bg-black text-white hover:bg-gray-700 transition-colors"
				>
					{isLogin ? 'Login' : 'Sign Up'}
				</button>
				<div className="mt-4 w-full">
					<button
						onClick={() => setIsLogin(!isLogin)}
						className="w-full px-4 py-2 rounded-md bg-white text-black hover:bg-gray-200 transition-colors"
					>
						{isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
					</button>
				</div>
			</div>
		</section>
	);
}