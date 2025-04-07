'use client';

export default function SignOut({ user, handleLogout, inter }) {
  return (
    <section className="h-screen flex justify-center items-center w-full">
      <div className="bg-[rgba(130,130,130,0.5)] rounded-3xl p-6 flex flex-col items-center justify-center w-full sm:w-1/2">
        <h3 className={`text-white text-3xl font-bold mb-4 text-center ${inter.variable}`}>
          Logged In! 🥳
        </h3>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors mt-4"
        >
          Logout
        </button>
        <p className="mt-4">Account: <code>{user.email}</code></p>
      </div>
    </section>
  );
}