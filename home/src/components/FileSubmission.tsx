import { useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { Contract } from 'ethers';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import { mockIPFSUpload, ipfsToAddresses } from '../utils/ipfs';
import '../styles/FileApp.css';

export function FileSubmission() {
  const { address } = useAccount();
  const { instance, isLoading: zamaLoading, error } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setCid('');
    setStatus('');
    setName(f?.name || '');
  };

  const onUpload = async () => {
    if (!file) return alert('Select a file first');
    setStatus('Calculating CID...');
    const cid = await mockIPFSUpload(file);
    setCid(cid);
    setStatus('CID ready');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instance || !address) return alert('Connect wallet');
    if (!file || !cid) return alert('Upload file to get CID');
    if (!name.trim()) return alert('No file name');
    if (!CONTRACT_ADDRESS) return alert('Contract address not set');

    setIsSubmitting(true);
    setStatus('Encrypting and submitting...');
    try {
      const { addr1, addr2 } = ipfsToAddresses(cid);
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.addAddress(addr1);
      input.addAddress(addr2);
      const enc = await input.encrypt();

      const signer = await signerPromise!;
      const c = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await c.submitRecord(name, enc.handles[0], enc.handles[1], enc.inputProof);
      await tx.wait();
      setStatus('Submitted');
      setName('');
      setFile(null);
      setCid('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      setStatus('Failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isSubmitting && !!cid;
  const missing: string[] = [];
  if (!file) missing.push('file');
  if (!cid) missing.push('CID');

  return (
    <div className="card">
      <form onSubmit={onSubmit}>
        {file && (
          <div style={{ marginBottom: 12 }}>
            <label>File name</label>
            <div style={{ fontSize: 14 }}>{name}</div>
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label>Choose file</label>
          <input type="file" ref={fileInputRef} onChange={onSelectFile} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onUpload} disabled={!file}>
            Get CID
          </button>
          <button type="submit" disabled={!canSubmit}>
            Submit
          </button>
        </div>
        {cid && (
          <div style={{ marginTop: 8, fontSize: 12 }}>CID: {cid}</div>
        )}
        {!canSubmit && missing.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#a00' }}>
            Missing: {missing.join(', ')}
          </div>
        )}
        {status && (
          <div style={{ marginTop: 8, fontSize: 12 }}>{status}</div>
        )}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
}
