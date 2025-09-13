import React, { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { useZamaFile } from './hooks/useZamaFile';

function App() {
  const { isConnected } = useAccount();
  const { files, loading, error, storeFile, loadFiles, removeFile } = useZamaFile();

  useEffect(() => {
    if (isConnected) {
      loadFiles();
    }
  }, [isConnected, loadFiles]);

  const handleFileUploaded = async (fileName: string, address1: string, address2: string) => {
    try {
      await storeFile(fileName, address1, address2);
    } catch (error) {
      console.error('Error storing file:', error);
      throw error;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '48px',
          padding: '24px 0',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#111827',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              🔐 ZamaFile
            </h1>
            <p style={{
              color: '#6b7280',
              margin: '8px 0 0 0',
              fontSize: '16px'
            }}>
              Encrypted file storage on the blockchain
            </p>
          </div>
          <ConnectButton />
        </header>

        {/* Main Content */}
        {!isConnected ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '12px'
            }}>
              Connect Your Wallet
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              marginBottom: '32px'
            }}>
              Connect your wallet to start uploading and managing your encrypted files
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Upload Section */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              padding: '32px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⬆️ Upload File
              </h2>
              <FileUpload 
                onFileUploaded={handleFileUploaded} 
                loading={loading} 
              />
            </div>

            {/* Error Display */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                color: '#dc2626'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚠️</span>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            {/* Files Section */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              padding: '32px'
            }}>
              <FileList 
                files={files} 
                onRemoveFile={removeFile} 
                loading={loading} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '64px',
        padding: '24px',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          Built with Zama FHE • Powered by encrypted blockchain technology
        </div>
        <div>
          Your files are encrypted end-to-end and stored securely on IPFS
        </div>
      </footer>
    </div>
  );
}

export default App;