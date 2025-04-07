'use client';

export default function UserSignup({ 
  email,
  setEmail,
  password,
  setPassword,
  extraFields,
  setExtraFields,
  handleSignUp,
  switchToLogin,
  switchToHost,
  inter
}) {
  return (
    <div className="bg-[rgba(130,130,130,0.5)] rounded-3xl p-6 flex flex-col items-center justify-center w-full sm:w-1/2">
      <h3 className={`text-white text-3xl font-bold mb-4 text-center ${inter.variable}`}>
        Create Account (Patient)
      </h3>
      <form onSubmit={handleSignUp} className="flex flex-col items-center w-full">
        <div className="w-full max-h-[35vh] overflow-y-auto pr-2 mb-2 custom-scrollbar">
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
          {/* Patient additional fields */}
          <input 
            type="number" 
            placeholder="Age" 
            value={extraFields.age} 
            onChange={(e) =>
              setExtraFields({ ...extraFields, age: e.target.value })
            } 
            className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
          />
          <input 
            type="number" 
            placeholder="Weight (lbs)" 
            value={extraFields.weight} 
            onChange={(e) =>
              setExtraFields({ ...extraFields, weight: e.target.value })
            } 
            className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={extraFields.phone} 
            onChange={(e) =>
              setExtraFields({ ...extraFields, phone: e.target.value })
            } 
            className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
          />
          <select
            value={extraFields.race}
            onChange={(e) =>
              setExtraFields({ ...extraFields, race: e.target.value })
            }
            className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md"
          >
            <option value="" disabled>Race</option>
            <option value="white">White</option>
            <option value="black">Black</option>
            <option value="asian">Asian</option>
            <option value="native american">Native American</option>
            <option value="other">Other</option>
          </select>
          <input 
            type="text" 
            placeholder="Ethnicity" 
            value={extraFields.ethnicity} 
            onChange={(e) =>
              setExtraFields({ ...extraFields, ethnicity: e.target.value })
            } 
            className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md" 
          />
          <select
            value={extraFields.sex}
            onChange={(e) =>
              setExtraFields({ ...extraFields, sex: e.target.value })
            }
            className="w-full mb-4 px-4 py-2 bg-white/30 rounded-md"
          >
            <option value="" disabled>Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
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
          onClick={switchToHost}
        >
          Switch to Sign Up as a Host
        </p>
      </div>
    </div>
  );
}