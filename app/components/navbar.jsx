'use client';
import Link from "next/link";
import { useState } from "react";

// For Tero, we have what we call a "Dynamic Navbar"
// This means that if you are a Doctor, you will see the Home tab & a Check-Ins Tab
// If you are a Patient, you will see Home tab & a Records Tab
// 
// We achieve this through FireBase ✨Context✨ 
// 
// WE ONLY RETURN THE NAVBAR IF USER IS LOGGED-IN

const patientNavItems = [
  { path: '/', name: 'Home' },
  { path: '/records', name: 'Records' }
];

const doctorNavItems = [
  { path: '/', name: 'Home' },
  { path: '/check-in', name: 'Check-In' }
];

export function NavBar() {
  // In-place of FireBase context, FOR NOW🚨 we are using useState
  const [isLoggedIntoAccount] = useState(true);
  const [isPatient] = useState(false);

  if (!isLoggedIntoAccount) return null;

  // Below sets the navItems to the proper array.
  const navItems = isPatient ? patientNavItems : doctorNavItems;

  return (
    <div className="flex justify-center w-full">
      <nav
        className="
          sm:hidden
          fixed
          bottom-5
          w-4/5
          bg-gradient-to-b from-neutral-200/90 dark:from-neutral-800/90 to-neutral-600/90
          rounded-4xl
          p-4
          flex
          justify-center
          gap-4
          shadow-lg
        "
      >
        {navItems.map(({ path, name }) => (
          <Link
            key={path}
            href={path}
            className="transition-all text-white hover:text-neutral-300 flex align-middle relative"
          >
            {name}
          </Link>
        ))}
      </nav>
    </div>
  );
}