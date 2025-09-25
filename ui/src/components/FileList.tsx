import React from 'react';
import { FileMetadata } from '../types';

interface FileListProps {
  files: FileMetadata[];
  onRemoveFile: (index: number) => Promise<void>;
  loading: boolean;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemoveFile, loading }) => {
  const handleRemove = async (index: number, fileName: string) => {
    if (window.confirm(`Are you sure you want to remove "${fileName}"?`)) {
      try {
        await onRemoveFile(index);
      } catch (error) {
        console.error('Error removing file:', error);
        alert('Failed to remove file');
      }
    }
  };

  if (loading && files.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div>Loading your files...</div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          No files yet
        </div>
        <div>
          Upload your first file to get started
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📋 Your Files ({files.length})
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {files.map((file) => (
          <div
            key={`${file.fileName}-${file.timestamp}`}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '20px' }}>📄</div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {file.fileName}
                </div>
              </div>
              
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                🕒 {new Date(file.timestamp * 1000).toLocaleString()}
              </div>
            </div>
            
            <button
              onClick={() => handleRemove(file.index, file.fileName)}
              disabled={loading}
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#fecaca';
                  e.currentTarget.style.borderColor = '#f87171';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                  e.currentTarget.style.borderColor = '#fecaca';
                }
              }}
            >
              🗑️ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};