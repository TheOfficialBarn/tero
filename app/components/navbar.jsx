'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
// Import SVGs as components (SVGR must be configured)
import HomeIcon from "@/public/home.svg";
import AssignmentIcon from "@/public/assignment.svg";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const patientNavItems = [
  { path: '/', name: 'Home' },
  { path: '/records', name: 'Records' }
];

const doctorNavItems = [
  { path: '/', name: 'Home' },
  { path: '/check-in', name: 'Check-In' }
];

export function NavBar() {
  const { user, loading } = useAuth();
  const [isPatient, setIsPatient] = useState(null);
  const pathname = usePathname(); // This is so that we know which tab to highlight 😼

  useEffect(() => {
    const fetchUserType = async () => {
      if (user) {
        // Try to get a document from the 'users' collection
        const patientDocRef = doc(db, 'users', user.uid);
        const patientDocSnap = await getDoc(patientDocRef);
        if (patientDocSnap.exists()) {
          setIsPatient(true);
        } else {
          setIsPatient(false);
        }
      }
    };
    fetchUserType();
  }, [user]);

  if (!loading && !user) return null;
  if (loading) return <div>Loading...</div>;

  const navItems = isPatient ? patientNavItems : doctorNavItems;
  const activeFill = "#ffffff";   // Active tab fill color 
  const inactiveFill = "#d1d5db"; // Inactive tab fill color

  return (
    <div className="flex justify-center w-full">
      <nav
        className="
          fixed
          bottom-5
          bg-gradient-to-b from-neutral-200/90 dark:from-neutral-800/90 to-neutral-400/90 dark:to-neutral-600/90
          rounded-4xl
          p-4
          flex
          justify-center
          gap-12
          shadow-lg
        "
      >
        {navItems.map(({ path, name }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              href={path}
              className="transition-all text-white hover:text-neutral-300 flex flex-col items-center relative"
            >
              {name === "Home" ? (
                <HomeIcon
                  className="h-6 w-6 mb-1"
                  fill={isActive ? activeFill : inactiveFill}
                />
              ) : (
                <AssignmentIcon
                  className="h-6 w-6 mb-1"
                  fill={isActive ? activeFill : inactiveFill}
                />
              )}
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}