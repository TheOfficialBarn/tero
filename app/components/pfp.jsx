import Link from "next/link";
import Image from "next/image";

// This File has PFP (Profile) Button and our glorious TERO 😍
export function PFP() {
    return (
        <>
            {/* Combined seamless blur effect for status bar and header */}
            <div className="fixed top-0 left-0 w-full backdrop-filter backdrop-blur-md bg-white/0 dark:bg-black/0 z-10 pointer-events-none rounded-b-2xl" 
                 style={{ 
                     height: "calc(env(safe-area-inset-top) + 60px)" 
                 }} 
            />
            
            {/* Tero + PFP */}
            <section className="fixed top-12 w-full px-4 flex justify-between items-center z-20">
                {/* Tero ☺️ */}
                <div className="
                    h-15
                    flex
                    items-center
                    align-middle
                    gap-2
                    rounded-full
                ">
                    <Image src="/tero_192_2.png" alt="Logo" width={50} height={50} priority />
                    <p className="bg-gradient-to-r from-yellow-600 via-orange-500 to-red-700 bg-clip-text text-transparent font-bold text-2xl">Tero</p>
                </div>
                {/* PFP 😮 */}
                <div className="w-15 h-15 bg-gradient-to-b from-neutral-200/30 to-neutral-400/30 dark:from-neutral-700/40 dark:to-neutral-900/40 rounded-full shadow-lg dark:shadow-neutral-900/30 flex items-center justify-center p-1 transition-all duration-300">
                    <Link
                        href="/login"
                        className="w-full h-full rounded-full bg-white/50 dark:bg-black/50 text-neutral-800 dark:text-white hover:bg-white dark:hover:bg-black flex items-center justify-center transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </section>
        </>
    );
}