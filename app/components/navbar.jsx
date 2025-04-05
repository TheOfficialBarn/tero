'use client';
import Link from "next/link";

const navItems = [
	{path: '/', name: 'home'},
	{path: '/records', name: 'records'}
]

export function NavBar() {
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
		{navItems.map(({path, name}) => (
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