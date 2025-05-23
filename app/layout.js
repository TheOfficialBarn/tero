
import "./globals.css";
import { PFP } from "./components/pfp";
import { NavBar } from "./components/navbar";
import { AuthProvider } from "@/context/AuthContext";
import { geistSans, geistMono } from "./fonts";

export const metadata = {
	title: "Tero SMD",
	description: "The Check-In Process, Simplified",
	icons: {
		icon: [{ url: "/tero_192_2.png", sizes: "192x192", type: "image/png" }],
		apple: [{ url: "/tero_192_2.png" }],
	},
	appleTouchIcon: "/tero_192_2.png",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
	},
};

export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	minimumScale: 1,
	userScalable: false,
	viewportFit: "cover",
};

export default async function RootLayout({ children }) {
	// Fetch data directly in the component (this runs on server)
	let wallpaper = null;
	try {
		const res = await fetch('https://peapix.com/bing/feed?country=us');
		const data = await res.json();

		if (data && data.length > 0) {
			wallpaper = data[0];
		}
	} catch (error) {
		console.error('Failed to fetch wallpaper:', error);
	}

	return (
		<html lang="en">
			<head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, viewport-fit=cover"
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<AuthProvider>
				{wallpaper && (
					<div 
					className="fixed w-full h-full -z-10 blur-md scale-110 dark:brightness-50 transition-all duration-300"
					style={{
						backgroundImage: `url(${wallpaper.fullUrl})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						transform: 'scale(1.1)'
					}}
				/>
				)}
				
				{/* Status bar blur overlay */}
				<PFP/>
				<div className="h-screen overflow-y-scroll snap-y snap-mandatory mx-2">
				{children}
				<NavBar/>
				</div>
			</AuthProvider>
			</body>
		</html>
	);
}
