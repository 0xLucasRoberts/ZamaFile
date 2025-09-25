import { IPFSFile } from '../types';

export const mockIPFSUpload = async (file: File): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const content = await file.arrayBuffer();
  const hashInput = new Uint8Array(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', hashInput);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `Qm${hashHex.substring(0, 44)}`;
};

export const ipfsHashToAddresses = (hash: string): [string, string] => {
  const encoder = new TextEncoder();
  const hashBytes = encoder.encode(hash + '1');
  const hashBytes2 = encoder.encode(hash + '2');
  
  const generateAddress = async (bytes: Uint8Array): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = new Uint8Array(hashBuffer);
    const addressBytes = hashArray.slice(0, 20);
    const addressHex = Array.from(addressBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${addressHex}`;
  };

  const addr1Promise = generateAddress(hashBytes);
  const addr2Promise = generateAddress(hashBytes2);
  
  return [`0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          `0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`];
};

export const addressesToIPFSHash = (addr1: string, addr2: string): string => {
  const combined = addr1 + addr2;
  const hashInput = new TextEncoder().encode(combined);
  return `Qm${Array.from(hashInput).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 44)}`;
};