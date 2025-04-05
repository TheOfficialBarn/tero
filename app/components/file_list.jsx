"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/uploadToPinata?t=" + Date.now()); // Cache bust
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
    refreshFiles();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Files</h2>
        <button
          onClick={refreshFiles}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : files.length === 0 ? (
        <div>No files found</div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <FileItem key={file.id} file={file} onDelete={refreshFiles} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileItem({ file, onDelete }) {
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleDecrypt = async () => {
    setIsDecrypting(true);
    try {
      // 1. First verify we have all required metadata
      if (!file.encryptedKey) {
        throw new Error(
          "This file cannot be decrypted - missing encryption key",
        );
      }

      // 2. Download the encrypted file
      const res = await fetch(file.url);
      if (!res.ok) throw new Error("Failed to download file");
      const encryptedBlob = await res.blob();
      const encryptedData = await encryptedBlob.arrayBuffer();

      // 3. Extract the salt (16 bytes), iv (12 bytes), and ciphertext
      const salt = encryptedData.slice(0, 16);
      const iv = encryptedData.slice(16, 28);
      const ciphertext = encryptedData.slice(28);

      // 4. Get user signature (must match exactly what was used during encryption)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const message = "Access file encryption key"; // Must match encryption message
      const signature = await signer.signMessage(message);

      // 5. Decode the stored encrypted key (base64 to string)
      const decodedKey = atob(file.encryptedKey);

      // 6. Recreate the encryption key using same parameters as encryption
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(decodedKey),
        "PBKDF2",
        false,
        ["deriveKey"],
      );

      const aesKey = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: new Uint8Array(salt), // Must use same salt as encryption
          iterations: 100000, // Must match encryption iterations
          hash: "SHA-256", // Must match encryption hash
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 }, // Must match encryption algorithm
        false,
        ["decrypt"],
      );

      // 7. Decrypt the content
      const decryptedContent = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(iv), // Must use same IV as encryption
        },
        aesKey,
        ciphertext,
      );

      // 8. Create download for user
      const decryptedBlob = new Blob([decryptedContent]);
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName || file.name.replace(".enc", "");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Decryption failed:", err);
      alert(`Decryption failed: ${err.message}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">
            {file.originalName || file.name.replace(".enc", "")}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(file.date).toLocaleDateString()} •{" "}
            {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View Encrypted
          </a>
          <button
            onClick={handleDecrypt}
            disabled={isDecrypting}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isDecrypting ? "Decrypting..." : "Decrypt"}
          </button>
        </div>
      </div>
    </div>
  );
}
