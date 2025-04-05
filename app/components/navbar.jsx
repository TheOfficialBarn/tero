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
			  <button>Home</button>
			  <button>Search</button>
			  <button>Profile</button>
		  </nav>
	  </div>
	);
  }