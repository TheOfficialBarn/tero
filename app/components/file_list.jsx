// components/FileList.js
"use client";
import { useState, useEffect } from 'react';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/uploadToPinata?t=' + Date.now()); // Cache bust
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshFiles(); }, []);

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/uploadToPinata?cid=${file.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      onDelete();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{file.name}</h3>
          <p className="text-sm text-gray-500">
            {new Date(file.date).toLocaleDateString()} • 
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
            View
          </a>
        </div>
      </div>
    </div>
  );
}
