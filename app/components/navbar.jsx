'use client';
import Link from "next/link";
import { useState } from "react";

// For Tero, we have what we call a "Dynamic Navbar"
// This means that if you are a Doctor, you will see the Home tab & a Check-Ins Tab
// If you are a Patient, you will see Home tab & a Records Tab
// 
// We achieve this through FireBase ✨Context✨ 



const patientNavItems = [
	{path: '/', name: 'Home'},
	{path: '/records', name: 'Records'}
]

const doctorNavItems = [
	{path: '/', name: 'Home'},
	{path: '/check-in', name: 'Check-In'}
]

export function NavBar() {
	// In-place of FireBase context, FOR NOW🚨 we are using useState
	const [isLoggedIntoAccount, setIsLoggedIntoAccount]  = useState(true);
	const [isPatient, setIsPatient] = useState(false);

	// WE RETURN THE NAVBAR ONLY IF THE USER IS LOGGED INTO THE ACCOUNT
	if(isLoggedIntoAccount) {
		return (
			<div className="flex justify-center w-full">
				<nav
				className="
				sm:hidden
				fixed
				bottom-5
				w-4/5
				bg-gradient-to-b from-gray-200 dark:from-gray-800 to-gray-600
				rounded-4xl
				p-4
				flex
				justify-center
				gap-4
				shadow-lg
				"
				>
				
				{isPatient ? patientNavItems.map(({path, name}) => (
					<Link
					key={path}
					href={path}
					className="transition-all hover:text-neutral-300 flex align-middle relative"
					>
					{name}
					</Link>
				)) : doctorNavItems.map(({path, name}) => (
					<Link
					key={path}
					href={path}
					className="transition-all hover:text-neutral-300 flex align-middle relative"
					>
					{name}
					</Link>
				))}

				</nav>
			</div>
		);
	}
}