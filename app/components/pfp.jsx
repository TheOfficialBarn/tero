import Link from "next/link";
import Image from "next/image";

// This File has PFP (Profile) Button and our glorious TERO 😍
export function PFP() {
    return (
        <div className="fixed top-15 w-full px-4 flex justify-between items-center">
            {/* Tero ☺️ */}
            <Image src="/tero_192_2.png" alt="Logo" width={50} height={50} priority />
            {/* PFP 😮 */}
            <div className="w-15 h-15 bg-white rounded-full shadow-2xl flex items-center justify-center p-1">
                <Link
                    href="/login"
                    className="w-full h-full rounded-full bg-black text-white flex items-center justify-center"
                >
                    P
                </Link>
            </div>
        </div>
    );
}