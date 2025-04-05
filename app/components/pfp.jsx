import Link from "next/link";
import Image from "next/image";

// This File has PFP (Profile) Button and our glorious TERO 😍
export function PFP() {
    return (
        <>
            {/* Combined seamless blur effect for status bar and header */}
            <div className="fixed top-0 left-0 w-full backdrop-filter backdrop-blur-md bg-white/0 z-10 pointer-events-none rounded-b-2xl" 
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
                <div className="w-15 h-15 bg-gradient-to-b from-neutral-200/30 dark:from-neutral-800/30 to-neutral-400/30 dark:to-neutral-600/30 rounded-full shadow-2xl flex items-center justify-center p-1">
                    <Link
                        href="/login"
                        className="w-full h-full rounded-full bg-black text-white flex items-center justify-center"
                    >
                        P
                    </Link>
                </div>
            </section>
        </>
    );
}