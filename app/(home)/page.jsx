"use client";

import { useState } from "react";
import UploadFile from "../components/upload_file";
import FileList from "../components/file_list";
import { AboutTero } from "./components/about_tero";

export default function Home() {
  
  // Change for debugging while FireBase Database isn't here
  const [isLoggedIntoAccount, setIsLoggedIntoAccount] = useState(true);

  return (
    <>
      {!isLoggedIntoAccount ? (
        <>
          {/* If you aren't Logged In, AboutTero is shown */}
          <AboutTero />
        </>
      ) : (
        <>
          {/* Else, this is shown */}
          <section className="h-screen flex items-center justify-center snap-start">
            <UploadFile />
          </section>
          <section className="h-screen flex items-center justify-center snap-start">
            <FileList />
          </section>
        </>
      )}
    </>
  );
}
