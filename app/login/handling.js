import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export const handleLogin = async ({ e, email, password, setUser, router }) => {
    e && e.preventDefault();
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;
        console.log('User signed in:', authUser);
        setUser(authUser);
        alert(`Welcome back, ${authUser.email}!`);
        router.push('/'); // Redirect after sign in
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            alert('User not found.');
        } else {
            console.error('Error signing in:', error);
            alert('Error signing in. Please try again.');
        }
    }
};

export const handleSignUp = async ({ e, email, password, extraFields, setUser, mode, router }) => {
    e && e.preventDefault();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;
        const userData = {
            email: authUser.email,
            name: extraFields.name,
            createdAt: new Date(),
        };

        if (mode === 'user_signup') {
            // Additional fields for patients
            const patientData = {
                ...userData,
                age: extraFields.age,
                sex: extraFields.sex,
                race: extraFields.race,
                ethnicity: extraFields.ethnicity,
                weight: extraFields.weight,
                phone: extraFields.phone,
            };
            await setDoc(doc(db, 'users', authUser.uid), patientData);
        } else if (mode === 'host_signup') {
            // For hosts
            const hostData = {
                ...userData,
                checkedInUsers: [],
                hostName: userData.name || 'Your Host',
            };
            await setDoc(doc(db, 'hosts', authUser.uid), hostData);
        }

        setUser(authUser);
        router.push('/');
    } catch (error) {
        console.error('Error creating account:', error);
        alert('Error creating account. Please try again.');
    }
};

export const handleLogout = async ({ setEmail, setPassword, setExtraFields, setUser, setMode }) => {
    try {
        await signOut(auth);
        console.log('User logged out');
        setEmail('');
        setPassword('');
        setExtraFields({
            name: '',
            age: '',
            sex: '',
            phone: '',
            ethnicity: '',
            race: '',
            weight: '',
        });
        setUser(null);
        setMode('login');
    } catch (error) {
        console.error('Error logging out:', error);
    }
};