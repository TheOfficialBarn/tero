import Image from "next/image";
import { inter } from "@/app/fonts";

function Welcome() {
  return (
    <section className="justify-items-center p-6 font-[family-name:var(--font-geist-sans)] w-full">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* WELCOME TO TERO */}
        <h1 className={`text-5xl font-bold text-white ${inter.variable}`}>
          Welcome to{" "}
          <span className="bg-gradient-to-r from-yellow-600 via-orange-500 to-red-700 bg-clip-text text-transparent">
            Tero.
          </span>
        </h1>
        {/* OUR BIRD!!!!!! */}
        <Image src="/tero_512_2.png" alt="Logo" width={180} height={180} priority/>
        <div className="bg-white/30 backdrop-blur-md dark:bg-white/0 dark:from-neutral-800/50 dark:to-neutral-600/50 dark:bg-gradient-to-b rounded-xl p-4">
          <p className="text-white">
            Skip the front desk—check in fast and let your doctor know you’ve arrived. Get live updates, secure messaging, and personalized care, all from your phone
          </p>
        </div>
      </main>
    </section>
  );
}

function About() {
  return (
    <section className="bg-white/30 backdrop-blur-md dark:bg-white/0 dark:from-neutral-800/50 dark:to-neutral-600/50 dark:bg-gradient-to-b rounded-3xl p-6 flex flex-col items-center justify-center w-full sm:w-1/2">
      <h3 className={`text-white text-3xl font-bold mb-4 ${inter.variable}`}> About Us </h3>
      <p className="text-white">
        We are a team of passionate hackers dedicated to solving real-world problems through innovative technology. At HackKU25, we set out to tackle one of the most critical issues in healthcare—reducing medical errors—by streamlining patient check-ins and improving data accuracy. Our team brings expertise in full-stack development, security, and AI, and we thrive on pushing boundaries to create efficient, scalable, and impactful solutions.
      </p>
    </section>
  );
}

function OurMission() {
  return (
    <section className="bg-white/30 backdrop-blur-md dark:bg-white/0 dark:from-neutral-800/50 dark:to-neutral-600/50 dark:bg-gradient-to-b rounded-3xl p-6 flex flex-col items-center justify-center w-full sm:w-1/2">
      <h3 className={`text-white text-3xl font-bold mb-4 ${inter.variable}`}> Our Mission </h3>
      <p className="text-white">
      Our mission is to redefine the patient check-in experience by eliminating outdated paper forms, minimizing human error, and ensuring that doctors have instant, secure, and accurate patient data at their fingertips. We believe that leveraging NFC, voice recognition, and secure data handling can create a seamless healthcare experience that improves patient outcomes and reduces administrative burdens.
      </p>
    </section>
  );
}

export function AboutTero() {
	return (
			<>
			  <section className="h-screen flex items-center justify-center snap-start w-full">
				<Welcome />
			  </section>
			  <section className="h-screen flex items-center justify-center snap-start w-full">
				<About />
			  </section>
			  <section className="h-screen flex items-center justify-center snap-start w-full">
				<OurMission />
			  </section>
			</>
	);
}