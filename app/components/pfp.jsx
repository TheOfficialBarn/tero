import Link from "next/link";

export function PFP() {
	return (
	  <div className="w-15 h-15 bg-white fixed top-15 right-3 rounded-full shadow-2xl flex items-center justify-center p-1">
			<Link
				href="/login"
				className="w-full h-full rounded-full bg-black text-white flex items-center justify-center"
			>
				P
			</Link>
	  </div>
	)
}