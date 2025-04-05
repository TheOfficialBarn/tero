"use client";
import { useState, useRef } from 'react';

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/uploadToPinata', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - the browser will set it automatically with the boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      alert(`File uploaded successfully!\nIPFS CID: ${data.IpfsHash}`);
      setFile(null); // Reset file selection
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload file');
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
        {file ? `Selected: ${file.name}` : 'Choose File'}
      </button>
      
      {file && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload to IPFS'}
        </button>
      )}
      
      {uploadError && (
        <p className="text-red-500 text-sm mt-2">{uploadError}</p>
      )}
    </div>
  );
}
