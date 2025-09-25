import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk';
import { FileMetadata } from '../types';

const CONTRACT_ADDRESS = '0x8Fdb26641d14a80FCCBE87BF455338Dd9C539a50'; // Update with deployed contract address

const CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "encryptedAddr1", "type": "bytes"},
      {"name": "encryptedAddr2", "type": "bytes"},
      {"name": "fileName", "type": "string"},
      {"name": "inputProof", "type": "bytes"}
    ],
    "name": "storeFile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllUserFiles",
    "outputs": [
      {"name": "fileNames", "type": "string[]"},
      {"name": "timestamps", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUserFileCount",
    "outputs": [{"name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "index", "type": "uint256"}],
    "name": "removeFile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const useZamaFile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const storeFile = useCallback(async (fileName: string, address1: string, address2: string) => {
    if (!address || !walletClient) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const instance = await createInstance(SepoliaConfig);
      
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.addAddress(address1);
      input.addAddress(address2);
      const encryptedInput = await input.encrypt();

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'storeFile',
        args: [
          encryptedInput.handles[0],
          encryptedInput.handles[1],
          fileName,
          encryptedInput.inputProof
        ],
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      
      await loadFiles();
      
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, walletClient, publicClient]);

  const loadFiles = useCallback(async () => {
    if (!address || !publicClient) return;

    setLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getAllUserFiles',
      }) as [string[], bigint[]];

      const [fileNames, timestamps] = result;
      
      const fileList: FileMetadata[] = fileNames.map((name, index) => ({
        fileName: name,
        timestamp: Number(timestamps[index]),
        index,
        exists: true,
      }));

      setFiles(fileList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient]);

  const removeFile = useCallback(async (index: number) => {
    if (!address || !walletClient) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'removeFile',
        args: [index],
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      
      await loadFiles();
      
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove file';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, walletClient, publicClient]);

  return {
    files,
    loading,
    error,
    storeFile,
    loadFiles,
    removeFile,
  };
};