"use client";
import { useState, useRef } from "react";
import { ethers } from "ethers";

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const getEncryptedKey = async (plaintextKey) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    // Get public key from wallet
    const message = "Access file encryption key"; // can be anything
    const signature = await signer.signMessage(message);
    const publicKey = ethers.utils.recoverPublicKey(
      ethers.utils.hashMessage(message),
      signature,
    );

    // Encrypt the password (e.g., AES key) using ECIES-like scheme
    // For simplicity, you can encrypt using `crypto.subtle` with a derived key from the publicKey
    // or use libraries like `eccrypto` (Node.js/Browser-compatible)

    // Placeholder for actual ECIES or derived key encryption
    const encryptedKey = btoa(plaintextKey); // ← Replace with real encryption in production

    return { encryptedKey, publicKey, address };
  };

  const storeOnBlockchain = async (ipfsHash, metadata) => {
    if (!window.ethereum) {
      console.warn("Ethereum wallet not detected");
      return;
    }

    try {
      // Prompt switch to Mainnet
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
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
      console.log("Transaction confirmed:", tx.hash);
    } catch (error) {
      console.error("Blockchain storage failed:", error);
    }
  };

  //bellow is where the file is encrypted
  const encryptFile = async (file, password) => {
    try {
      // Convert password to key
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
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"],
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const fileBuffer = await file.arrayBuffer();
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        fileBuffer,
      );

      // Combine salt + iv + encrypted data
      const encryptedBlob = new Blob([salt, iv, new Uint8Array(encrypted)], {
        type: "application/octet-stream",
      });

      return encryptedBlob;
    } catch (error) {
      console.error("Encryption failed:", error);
      throw error;
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
    }
  };
  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Derive encryption key from wallet signature
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const signature = await signer.signMessage("Access file encryption key");
      const password = signature; // Use this as the AES password

      // Encrypt the file
      const encryptedFile = await encryptFile(file, password);
      //Gets the encryptedkey
      const { encryptedKey, publicKey, address } =
        await getEncryptedKey(password);

      // Structure metadata properly for Pinata
      const metadata = {
        name: `${file.name}.enc`,
        keyvalues: {
          encryptedKey,
          publicKey,
          keyOwner: address,
          encryptionScheme: "AES-GCM-256",
          originalName: file.name,
          mimeType: file.type,
          encryptedAt: new Date().toISOString(),
        },
      };

      const options = {
        cidVersion: 1,
      };

      const formData = new FormData();
      formData.append("file", encryptedFile, `${file.name}.enc`);
      formData.append("pinataMetadata", JSON.stringify(metadata));
      formData.append("pinataOptions", JSON.stringify(options));

      const response = await fetch("/api/uploadToPinata", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Upload failed");

      const ipfsHash = data.IpfsHash;
      await storeOnBlockchain(ipfsHash, metadata);

      alert(`File uploaded successfully!\nIPFS CID: ${ipfsHash}`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload to IPFS</h1>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <button
        onClick={handleButtonClick}
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
    </div>
  );
}
