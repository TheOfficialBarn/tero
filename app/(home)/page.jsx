"use client";

import { useState } from "react";
import UploadFile from "../components/upload_file";
import FileList from "../components/file_list";
import { AboutTero } from "./components/about_tero";
import { Profile } from "./components/profile";
import { SymptomChecker } from "./components/symptom_checker";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  // Change for debugging while FireBase Database isn't here
  const { user, loading } = useAuth();
  const [isPatient, setIsPatient] = useState(false);

  return (
    <>
      {!user && !loading ? (
        <>
          {/* If you aren't Logged In, AboutTero is shown */}
          <AboutTero />
        </>
      ) : (
        <>
          {/* If logged-in, we need to know if you are DOCTOR or PATIENT */}
          {!isPatient ? (
            <>
              {/* Is DOCTOR */}
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
                <Profile/>
              </section>
              <section className="h-screen flex items-center justify-center snap-start">
                <SymptomChecker/>
              </section>
            </>
          )}
        </>
      )}
    </>
  );
}
