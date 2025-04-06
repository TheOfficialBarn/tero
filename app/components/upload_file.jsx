"use client";
import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import * as eccryptoJS from "eccrypto-js";
import { connectWallet, isMobile, isPWA } from "/lib/wallet";
import FileItem from "./file_list"; // Assuming FileItem is a reusable component

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [userSignature, setUserSignature] = useState(null);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [files, setFiles] = useState([]); // Maintain a list of uploaded files

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (walletAddress) {
      // Optional: fetch uploaded files when wallet is connected
      fetchUploadedFiles();
    }
  }, [walletAddress]);

  // components/upload_file.jsx
  const connectWalletHandler = async () => {
    if (connectingWallet) return;
    setConnectingWallet(true);
    setUploadError(null);

    try {
      // First check HTTPS
      if (window.location.protocol !== "https:") {
        window.location.href = `https://${window.location.host}${window.location.pathname}`;
        return;
      }

      const connection = await connectWallet();
      // Rest of logic...
    } catch (err) {
      setUploadError(
        err.message.includes("user rejected")
          ? "Connection cancelled"
          : "Wallet connection failed: " + err.message,
      );
    } finally {
      setConnectingWallet(false);
    }
  };
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  // Fetch uploaded files from Pinata (or any other source)
  const fetchUploadedFiles = async () => {
    try {
      const res = await fetch(
        `/api/fetchUploadedFiles?wallet=${walletAddress}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch files");
      setFiles(data.files);
    } catch (err) {
      setUploadError(err.message);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Ensure wallet is connected
      const wallet =
        walletAddress && userSignature
          ? { address: walletAddress, signature: userSignature }
          : await connectWalletHandler();

      if (!wallet) return; // Connection failed

      // 2. Encrypt the file
      const encryptedFile = await encryptFile(file, wallet.signature);

      // 3. Prepare metadata
      const publicKey = await getPublicKey(wallet.signature);
      const encryptedKey = await getEncryptedKey(wallet.signature, publicKey);

      const metadata = {
        name: `${file.name}.enc`,
        keyvalues: {
          encryptedKey,
          publicKey,
          keyOwner: wallet.address,
          encryptionScheme: "AES-GCM-256",
          originalName: file.name,
          mimeType: file.type,
          encryptedAt: new Date().toISOString(),
        },
      };

      // 4. Upload to IPFS
      const formData = new FormData();
      formData.append("file", encryptedFile, `${file.name}.enc`);
      formData.append("pinataMetadata", JSON.stringify(metadata));
      formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

      const res = await fetch("/api/uploadToPinata", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();

      // 5. Store reference on blockchain
      await storeOnBlockchain(data.IpfsHash, metadata);

      // 6. Update the list of files
      setFiles((prevFiles) => [
        ...prevFiles,
        {
          id: data.IpfsHash,
          name: file.name,
          url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
          ...metadata.keyvalues,
        },
      ]);

      // 7. Reset form
      alert(`File uploaded successfully!\nIPFS CID: ${data.IpfsHash}`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadError(err.message || "File upload failed");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper functions
  const getPublicKey = async (signature) => {
    const hashedMsg = ethers.utils.hashMessage("Access file encryption key");
    return ethers.utils.recoverPublicKey(hashedMsg, signature);
  };

  const getEncryptedKey = async (signature, publicKey) => {
    const publicKeyBuffer = Buffer.from(publicKey.slice(2), "hex");
    const encryptedBuffer = await eccryptoJS.encrypt(
      publicKeyBuffer,
      Buffer.from(signature),
    );
    return JSON.stringify({
      iv: encryptedBuffer.iv.toString("base64"),
      ephemPublicKey: encryptedBuffer.ephemPublicKey.toString("base64"),
      ciphertext: encryptedBuffer.ciphertext.toString("base64"),
      mac: encryptedBuffer.mac.toString("base64"),
    });
  };

  const encryptFile = async (file, password) => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      await file.arrayBuffer(),
    );

    return new Blob([salt, iv, new Uint8Array(encrypted)], {
      type: "application/octet-stream",
    });
  };

  const storeOnBlockchain = async (ipfsHash, metadata) => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        [
          "function storeFile(string memory ipfsHash, string memory metadata) public",
        ],
        signer,
      );
      const tx = await contract.storeFile(ipfsHash, JSON.stringify(metadata));
      await tx.wait();
    } catch (error) {
      console.error("Blockchain storage failed:", error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload to IPFS</h1>

      {/* Login Button */}
      <button
        onClick={connectWalletHandler}
        disabled={isUploading}
        className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {walletAddress
          ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          : "Login with MetaMask"}
      </button>

      {/* File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <button
        onClick={() => fileInputRef.current.click()}
        disabled={isUploading}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {file ? `Selected: ${file.name}` : "Choose File"}
      </button>

      {file && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload to IPFS"}
        </button>
      )}

      {uploadError && (
        <p className="text-red-500 text-sm mt-2">{uploadError}</p>
      )}

      {/* Display uploaded files */}
      {files.length > 0 && (
        <div className="mt-6 w-full">
          <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>
          <div className="space-y-3">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onDelete={() => fetchUploadedFiles()} // Refresh files
                provider={null} // You can pass a provider if needed
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
