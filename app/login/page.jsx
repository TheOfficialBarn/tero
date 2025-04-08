'use client';

import { inter } from '../fonts';

import { useState, useEffect } from 'react';
import { auth } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

import Login from "./components/login";
import UserSignup from "./components/user_signup";
import HostSignup from "./host_signup";
import SignOut from "./components/signout";
import { handleLogin, handleSignUp, handleLogout } from "./handling";

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extraFields, setExtraFields] = useState({
    name: '',
    age: '',
    sex: '',
    phone: '',
    ethnicity: '',
    race: '',
    weight: '',
  });
  const [user, setUser] = useState(null);
  // mode: "login", "user_signup", "host_signup"
  const [mode, setMode] = useState('login');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Switch functions to change the mode
  const switchToSignup = () => setMode('user_signup');
  const switchToLogin = () => setMode('login');
  const switchToHost = () => setMode('host_signup');
  const switchToUser = () => setMode('user_signup');

  if (user) {
    return (
      <SignOut 
        user={user} 
        handleLogout={() => handleLogout({ setEmail, setPassword, setExtraFields, setUser, setMode })} 
        inter={inter} 
      />
    );
  }

  return (
    <section className="h-screen flex justify-center items-center w-full">
      {mode === 'login' && (
        <Login 
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={(e) => handleLogin({ e, email, password, setUser, router })}
          switchToSignup={switchToSignup}
          inter={inter}
        />
      )}
      {mode === 'user_signup' && (
        <UserSignup
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          extraFields={extraFields}
          setExtraFields={setExtraFields}
          handleSignUp={(e) =>
            handleSignUp({ e, email, password, extraFields, setUser, mode: 'user_signup', router })
          }
          switchToLogin={switchToLogin}
          switchToHost={switchToHost}
          inter={inter}
        />
      )}
      {mode === 'host_signup' && (
        <HostSignup
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          extraFields={extraFields}
          setExtraFields={setExtraFields}
          handleSignUp={(e) =>
            handleSignUp({ e, email, password, extraFields, setUser, mode: 'host_signup', router })
          }
          switchToLogin={switchToLogin}
          switchToUser={switchToUser}
          inter={inter}
        />
      )}
    </section>
  );
}