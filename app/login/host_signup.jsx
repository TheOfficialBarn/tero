'use client';

export default function HostSignup({ 
  email,
  setEmail,
  password,
  setPassword,
  extraFields,
  setExtraFields,
  handleSignUp,
  switchToLogin,
  switchToUser,
  inter
}) {
  return (
    <div className="bg-white/30 backdrop-blur-md dark:bg-white/0 dark:from-neutral-800/50 dark:to-neutral-600/50 dark:bg-gradient-to-b rounded-3xl p-6 flex flex-col items-center justify-center w-full sm:w-1/2">
      <h3 className={`text-white text-3xl font-bold mb-4 text-center ${inter.variable}`}>
        Create Account (Host)
      </h3>
      <form onSubmit={handleSignUp} className="flex flex-col items-center w-full">
        <div className="w-full max-h-[25vh] overflow-y-auto pr-2 mb-2 custom-scrollbar">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
          />
          <input 
            type="text" 
            placeholder="Full Name" 
            value={extraFields.name} 
            onChange={(e) =>
              setExtraFields({ ...extraFields, name: e.target.value })
            } 
            className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-md bg-black text-white hover:bg-gray-700 transition-colors"
        >
          Sign Up
        </button>
      </form>
      <div className="mt-4 w-full">
        <button
          onClick={switchToLogin}
          className="w-full px-4 py-2 rounded-md bg-white text-black hover:bg-gray-200 transition-colors"
        >
          Switch to Login
        </button>
        <p 
          className="flex justify-center mt-4 text-sm text-blue-300 dark:text-blue-500 cursor-pointer"
          onClick={switchToUser}
        >
          Switch to Sign Up as a Patient
        </p>
      </div>
    </div>
  );
}