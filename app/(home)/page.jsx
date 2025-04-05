'use client';
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  });

function Welcome() {
  return (
    <div className="justify-items-center p-6 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* WELCOME TO TERO */}
        <h1 className={`text-5xl font-bold ${inter.variable}`}>Welcome to <span className="bg-gradient-to-r from-yellow-300 via-orange-500 to-red-700 bg-clip-text text-transparent">Tero.</span></h1>
        {/* OUR BIRD!!!!!! */}
        <Image src="/tero_512_2.png" alt="Logo" width={180} height={180} priority/>
      </main>
    </div>
  );
}

function About() { 
  return (
    <div className="bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg p-6 m-2 flex flex-col items-center justify-center h-3/4">
      <h3 className="text-white text-2xl font-bold mb-4">Component 2</h3>
      <p className="text-white">This is a custom component with some content.</p>
    </div>
  );
}

function OurMission() {
  return (
    <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg p-6 m-2 flex flex-col items-center justify-center">
      <h3 className="text-white text-2xl font-bold mb-4">Component 3</h3>
      <button className="bg-white text-teal-600 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
        Click me
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="h-screen flex items-center justify-center snap-start">
        <Welcome />
      </section>
      <section className="h-screen flex items-center justify-center snap-start">
        <About/>
      </section>
      <section className="h-screen flex items-center justify-center snap-start">
        <OurMission />
      </section>
    </>
  );
}
