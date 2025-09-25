import React, { useState, useRef } from 'react';
import { mockIPFSUpload, ipfsHashToAddresses } from '../utils/ipfs';

interface FileUploadProps {
  onFileUploaded: (fileName: string, address1: string, address2: string) => Promise<void>;
  loading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!fileName.trim()) {
      alert('Please enter a file name before uploading');
      return;
    }

    setUploading(true);
    try {
      const ipfsHash = await mockIPFSUpload(file);
      console.log(`File uploaded to IPFS: ${ipfsHash}`);
      
      const [address1, address2] = ipfsHashToAddresses(ipfsHash);
      console.log(`Generated addresses: ${address1}, ${address2}`);
      
      await onFileUploaded(fileName, address1, address2);
      
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: '#374151'
        }}>
          File Name
        </label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter file name..."
          disabled={uploading || loading}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        style={{
          border: `2px dashed ${dragActive ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: dragActive ? '#eff6ff' : '#f9fafb',
          cursor: uploading || loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: uploading || loading ? 0.6 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={uploading || loading}
        />
        
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          color: dragActive ? '#3b82f6' : '#6b7280'
        }}>
          📁
        </div>
        
        {uploading ? (
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#3b82f6', marginBottom: '8px' }}>
              Uploading to IPFS...
            </div>
            <div style={{ color: '#6b7280' }}>
              Please wait while we process your file
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
            </div>
            <div style={{ color: '#6b7280' }}>
              Upload your file to encrypted IPFS storage
            </div>
          </div>
        )}
      </div>
      
      {!fileName && (
        <div style={{ 
          marginTop: '12px', 
          padding: '12px',
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '6px',
          color: '#92400e',
          fontSize: '14px'
        }}>
          Please enter a file name before uploading
        </div>
      )}
    </div>
  );
};