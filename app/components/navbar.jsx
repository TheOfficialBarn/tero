'use client';
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
// Import SVGs as components (SVGR must be configured)
import HomeIcon from "@/public/home.svg";
import AssignmentIcon from "@/public/assignment.svg";

const patientNavItems = [
  { path: '/', name: 'Home' },
  { path: '/records', name: 'Records' }
];

const doctorNavItems = [
  { path: '/', name: 'Home' },
  { path: '/check-in', name: 'Check-In' }
];

export function NavBar() {
  const [isLoggedIntoAccount] = useState(true);
  const [isPatient] = useState(false);
  const pathname = usePathname(); // This is so that we know which tab to highlight 😼

  if (!isLoggedIntoAccount) return null;

  const navItems = isPatient ? patientNavItems : doctorNavItems;
  const activeFill = "#ffffff";   // Active tab fill color 
  const inactiveFill = "#d1d5db"; // Inactive tab fill color

  return (
    <div className="flex justify-center w-full">
      <nav
        className="
          sm:hidden
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