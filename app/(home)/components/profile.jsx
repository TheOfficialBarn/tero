// For seeing profile stuff and being able to edit it

import { Inter } from "next/font/google";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export function Profile() {
	return (
		<>
			<div className="bg-[rgba(130,130,130,0.5)] rounded-3xl p-6 m-2 flex flex-col items-center justify-center w-full h-5/8">
				<h3 className={`text-white text-3xl font-bold mb-4 ${inter.variable}`}>✨ Profile ✨</h3>
			</div>
		</>
	);
}