"use client";
import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import * as eccryptoJS from "eccrypto-js";

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [userSignature, setUserSignature] = useState(null);
  const fileInputRef = useRef(null);

  // Request wallet access and signature once when the component mounts
  useEffect(() => {
    const initializeWallet = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const signature = await signer.signMessage("Access file encryption key");

        setUserAddress(address);
        setUserSignature(signature);
      } else {
        console.warn("Ethereum wallet not detected");
      }
    };

    initializeWallet();
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current.click(); 
  };

  const getEncryptedKey = async (plaintextKey) => {
    if (!userAddress || !userSignature) {
      throw new Error("User not signed in. Please sign in first.");
    }

    const hashedMsg = ethers.utils.hashMessage("Access file encryption key");
    const recoveredPubKeyHex = ethers.utils.recoverPublicKey(
      hashedMsg,
      userSignature,
    ); // Uncompressed
    const publicKeyBuffer = Buffer.from(recoveredPubKeyHex.slice(2), "hex");

    if (publicKeyBuffer.length !== 65 || publicKeyBuffer[0] !== 0x04) {
      throw new Error("Recovered public key is not in correct uncompressed format");
    }

    const encryptedBuffer = await eccryptoJS.encrypt(publicKeyBuffer, Buffer.from(plaintextKey));

    const encryptedKey = {
      iv: encryptedBuffer.iv.toString("base64"),
      ephemPublicKey: encryptedBuffer.ephemPublicKey.toString("base64"),
      ciphertext: encryptedBuffer.ciphertext.toString("base64"),
      mac: encryptedBuffer.mac.toString("base64"),
    };

    return {
      encryptedKey: JSON.stringify(encryptedKey),
      publicKey: recoveredPubKeyHex,
      address: userAddress,
    };
  };

  const storeOnBlockchain = async (ipfsHash, metadata) => {
    if (!window.ethereum) {
      console.warn("Ethereum wallet not detected");
      return;
    }

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
      console.log("Transaction confirmed:", tx.hash);
    } catch (error) {
      console.error("Blockchain storage failed:", error);
    }
  };

  const encryptFile = async (file, password) => {
    try {
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

    if (!userAddress || !userSignature) {
      setUploadError("Please connect your wallet first");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const password = userSignature; // Use the signature as the AES password
      const encryptedFile = await encryptFile(file, password);
      const { encryptedKey, publicKey, address } = await getEncryptedKey(password);

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
      console.log(data);

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

  return ( // PLS FIX BARN ==========================================================
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

