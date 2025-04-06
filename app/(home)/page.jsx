"use client";

import { useState, useEffect } from "react";
import UploadFile from "../components/upload_file";
import FileList from "../components/file_list";
import { AboutTero } from "./components/about_tero";
import { Profile } from "./components/profile";
import { SymptomChecker } from "./components/symptom_checker";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PatientsList } from "./components/patients_list";

export default function Home() {
const { user, loading } = useAuth();
const [isPatient, setIsPatient] = useState(null);

useEffect(() => {
	const fetchUserType = async () => {
	if (user) {
		// Check if a document exists in the "users" collection.
		const patientDocRef = doc(db, "users", user.uid);
		const patientDocSnap = await getDoc(patientDocRef);
		setIsPatient(patientDocSnap.exists());
	}
	};
	fetchUserType();
}, [user]);

if (!user && !loading) {
	return <AboutTero />;
}

if (loading) {
	return <div>Loading...</div>;
}

return (
	<>
	{!isPatient ? (
		<>
		{/* IS DOCTOR */}
		<section className="h-screen flex items-center justify-center snap-start">
			<PatientsList/>
		</section>
		<section className="h-screen flex items-center justify-center snap-start">
			<UploadFile />
		</section>
		<section className="h-screen flex items-center justify-center snap-start">
			<FileList />
		</section>
		</>
	) : (
		<>
		{/* IS PATIENT */}
		<section className="h-screen flex items-center justify-center snap-start">
			<Profile />
		</section>
		<section className="h-screen flex items-center justify-center snap-start">
			<SymptomChecker />
		</section>
		</>
	)}
	</>
);
}
