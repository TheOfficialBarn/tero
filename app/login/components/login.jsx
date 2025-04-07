'use client';

export default function Login({ 
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  switchToSignup,
  inter
}) {
  return (
    <div className="bg-[rgba(130,130,130,0.5)] rounded-3xl p-6 flex flex-col items-center justify-center w-full sm:w-1/2">
      <h3 className={`text-white text-3xl font-bold mb-4 text-center ${inter.variable}`}>
        Secure. Easy.
      </h3>
      <h3 className={`text-white text-3xl font-bold mb-4 text-center ${inter.variable}`}>
        Blazing Fast.
      </h3>
      <form onSubmit={handleLogin} className="flex flex-col items-center w-full">
        <div className="w-full max-h-[20vh] overflow-y-auto pr-2 mb-2 custom-scrollbar">
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
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-md bg-black text-white hover:bg-gray-700 transition-colors"
        >
          Login
        </button>
      </form>
      <div className="mt-4 w-full">
        <button
          onClick={switchToSignup}
          className="w-full px-4 py-2 rounded-md bg-white text-black hover:bg-gray-200 transition-colors"
        >
          Switch to Sign Up
        </button>
      </div>
    </div>
  );
}