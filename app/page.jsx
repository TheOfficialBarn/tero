'use client';
import Image from "next/image";

// Custom components to use in sections
const Component1 = () => (
  <div className="justify-items-center p-6 font-[family-name:var(--font-geist-sans)]">
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
      <Image
        className="dark:invert"
        src="/icon-192x192.png"
        alt="Logo"
        width={180}
        height={180}
        priority
      />
      <p className="list-inside text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
        You can download website as app ✨
        <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">!</code>
      </p>
    </main>
  </div>
);

// Orange
const Component2 = () => (
  <div className="bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg p-6 m-2 flex flex-col items-center justify-center h-3/4">
    <h3 className="text-white text-2xl font-bold mb-4">Component 2</h3>
    <p className="text-white">This is a custom component with some content.</p>
  </div>
);

// Green
const Component3 = () => (
  <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg p-6 m-2 flex flex-col items-center justify-center">
    <h3 className="text-white text-2xl font-bold mb-4">Component 3</h3>
    <button className="bg-white text-teal-600 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
      Click me
    </button>
  </div>
);

export default function Home() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {/* Sections */}
      <section className="h-screen flex items-center justify-center snap-start">
        <Component1 />
      </section>
      <section className="h-screen flex items-center justify-center snap-start">
        <Component2/>
      </section>
      <section className="h-screen flex items-center justify-center snap-start">
        <Component3 />
      </section>
    </div>
  );
}
