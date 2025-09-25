import { useEffect, useMemo, useState } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { addressesToIpfs } from '../utils/ipfs';

type RecordItem = {
  name: string;
  timestamp: bigint;
  addr1: string;
  addr2: string;
  cid?: string;
};

export function FileList() {
  const { address } = useAccount();
  const { instance } = useZamaInstance();
  const { signTypedDataAsync } = useSignTypedData();
  const [items, setItems] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const client = useMemo(
    () => createPublicClient({ chain: sepolia, transport: http() }),
    []
  );

  useEffect(() => {
    const run = async () => {
      if (!address || !CONTRACT_ADDRESS) return;
      setLoading(true);
      try {
        const count = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI as any,
          functionName: 'getRecordCount',
          args: [address],
        });

        const res: RecordItem[] = [];
        for (let i = 0n; i < (count as bigint); i++) {
          const rec = await client.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI as any,
            functionName: 'getRecord',
            args: [address, i],
          });
          const [name, timestamp, addr1, addr2] = rec as any;
          res.push({ name, timestamp, addr1, addr2 });
        }
        setItems(res);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [address, client]);

  const onReveal = async (idx: number) => {
    if (!instance || !address) return;
    const it = items[idx];
    const handleContractPairs = [
      { handle: it.addr1 as string, contractAddress: CONTRACT_ADDRESS },
      { handle: it.addr2 as string, contractAddress: CONTRACT_ADDRESS },
    ];
    const keypair = instance.generateKeypair();
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '10';
    const contractAddresses = [CONTRACT_ADDRESS];
    const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);

    const signature = await signTypedDataAsync({
      domain: eip712.domain as any,
      types: { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification } as any,
      primaryType: 'UserDecryptRequestVerification',
      message: eip712.message as any,
    });

    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      (signature as string).replace('0x', ''),
      contractAddresses,
      address,
      startTimeStamp,
      durationDays
    );

    const a1 = result[it.addr1 as string] as string;
    const a2 = result[it.addr2 as string] as string;
    const cid = addressesToIpfs(a1, a2);
    const updated = [...items];
    updated[idx] = { ...it, cid };
    setItems(updated);
  };

  if (!address) {
    return (
      <div className="connect-wallet-container">
        <h2 className="connect-wallet-title">🔗 Connect Your Wallet</h2>
        <p className="connect-wallet-description">
          Please connect your wallet to view and manage your encrypted files
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="connect-wallet-container">
        <h2 className="connect-wallet-title">🔄 Loading Files...</h2>
        <p className="connect-wallet-description">
          Fetching your encrypted files from the blockchain
        </p>
      </div>
    );
  }

  return (
    <div>
      {items.length === 0 && (
        <div className="connect-wallet-container">
          <h2 className="connect-wallet-title">📁 No Files Yet</h2>
          <p className="connect-wallet-description">
            You haven't uploaded any files yet. Switch to the Submit File tab to get started!
          </p>
        </div>
      )}
      {items.map((it, i) => (
        <div key={i} className="card hover-glow" style={{ textAlign: 'left' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--spacing-md)'
          }}>
            <div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text-inverse)',
                marginBottom: 'var(--spacing-xs)'
              }}>
                📄 <strong>{it.name}</strong>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'Consolas, Monaco, Courier New, monospace'
              }}>
                ⏰ {new Date(Number(it.timestamp) * 1000).toLocaleString()}
              </div>
            </div>
          </div>

          {it.cid ? (
            <div style={{
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              wordBreak: 'break-all'
            }}>
              <strong style={{ color: '#10b981' }}>🔗 IPFS HASH:</strong>
              <div style={{
                marginTop: 'var(--spacing-xs)',
                fontFamily: 'Consolas, Monaco, Courier New, monospace',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                {it.cid}
              </div>
            </div>
          ) : (
            <button
              style={{
                marginTop: 'var(--spacing-md)',
                background: 'var(--gradient-accent)',
                minWidth: '140px'
              }}
              onClick={() => onReveal(i)}
            >
              🔓 Reveal Ipfs Hash
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
