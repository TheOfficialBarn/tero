"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

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
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {walletAddress ? "Your Files" : "Connect Wallet to View Files"}
        </h2>
        <div className="flex gap-2">
          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={refreshFiles}
              disabled={loading}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>
      </div>

      {!walletAddress ? (
        <div className="text-yellow-600">Connect your wallet to view files</div>
      ) : loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : files.length === 0 ? (
        <div>No files found for your wallet</div>
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

      // Extract encryption parameters (matches upload logic)
      const salt = encryptedData.slice(0, 16);
      const iv = encryptedData.slice(16, 28);
      const ciphertext = encryptedData.slice(28);

      // Derive key using same method as upload
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
          hash: "SHA-256"
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

      // Create download with proper filename and type
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
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">
            {file.originalName || file.name.replace(".enc", "")}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(file.date).toLocaleString()} •{" "}
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
