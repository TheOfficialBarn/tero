"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Geist } from "next/font/google";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Ethereum wallet not detected");
      return null;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      return address;
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
      return null;
    }
  };

  const refreshFiles = async () => {
    setLoading(true);
    try {
      const address = walletAddress || (await connectWallet());
      if (!address) return;

      const res = await fetch(`/api/uploadToPinata?wallet=${address}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load files");
      setFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      refreshFiles();
    }
  }, [walletAddress]);

  return (
    <div className="rounded-3xl p-6 m-4 flex flex-col gap-4 w-full max-w-2xl mx-auto h-5/8 bg-white/30 backdrop-blur-md dark:bg-white/0 dark:from-neutral-800/50 dark:to-neutral-600/50 dark:bg-gradient-to-b">
      <div className="flex justify-between items-center">
        <h3
          className={`text-foreground text-2xl font-bold ${geist.variable} font-[family-name:var(--font-geist-sans)]`}
        >
          {walletAddress ? "✨ Your Medical Records ✨" : "Connect Wallet to View Files"}
        </h3>
        <div className="flex gap-2">
          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={refreshFiles}
              disabled={loading}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Refreshing..."
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        {!walletAddress ? (
          <div className="text-yellow-600 text-center p-12">
            Connect your wallet to view files
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-300" />
          </div>
        ) : error ? (
          <div className="bg-red-600 bg-opacity-20 p-4 rounded-lg text-red-500 text-center">
            Error: {error}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center p-12 text-neutral-300">
            No files found. Upload your first medical record.
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <FileItem key={file.id} file={file} onDelete={refreshFiles} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileItem({ file, onDelete }) {
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleDecrypt = async () => {
    setIsDecrypting(true);
    try {
      if (!window.ethereum) throw new Error("Ethereum wallet not detected");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Verify ownership
      if (file.keyOwner.toLowerCase() !== address.toLowerCase()) {
        throw new Error("You don't have permission to decrypt this file");
      }

      const res = await fetch(file.url);
      if (!res.ok) throw new Error("Failed to download file");

      const encryptedBlob = await res.blob();
      const encryptedData = await encryptedBlob.arrayBuffer();

      // Extract encryption parameters
      const salt = encryptedData.slice(0, 16);
      const iv = encryptedData.slice(16, 28);
      const ciphertext = encryptedData.slice(28);

      // Derive key using the same method as upload
      const signature = await signer.signMessage("Access file encryption key");
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(signature),
        "PBKDF2",
        false,
        ["deriveKey"]
      );

      const aesKey = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: new Uint8Array(salt),
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      const decryptedContent = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        aesKey,
        ciphertext
      );

      // Create a download with the proper filename and type
      const decryptedBlob = new Blob([decryptedContent], {
        type: file.mimeType || "application/octet-stream",
      });
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName || "decrypted_file";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Decryption failed:", err);
      alert(`Decryption failed: ${err.message}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="bg-white/30 dark:bg-white/0 rounded-xl p-4 hover:bg-gray-200/30 transition-colors shadow-md backdrop-filter backdrop-blur-md border-t-2 border-neutral-300/30">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-grow">
          <h3 className="text-foreground font-bold truncate">
            {file.originalName || file.name.replace(".enc", "")}
          </h3>
          <p className="text-sm text-neutral-300">
            {new Date(file.date).toLocaleDateString()} •{" "}
            {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            View Encrypted
          </a>
          <button
            onClick={handleDecrypt}
            disabled={isDecrypting}
            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isDecrypting ? "Decrypting..." : "Decrypt"}
          </button>
        </div>
      </div>
    </div>
  );
}
