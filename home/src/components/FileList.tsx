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

  if (!address) return <div>Please connect wallet</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {items.length === 0 && <div>No files yet</div>}
      {items.map((it, i) => (
        <div key={i} className="card" style={{ textAlign: 'left' }}>
          <div><strong>{it.name}</strong></div>
          <div style={{ fontSize: 12, color: '#555' }}>Timestamp: {it.timestamp.toString()}</div>
          {it.cid ? (
            <div style={{ marginTop: 8 }}>CID: {it.cid}</div>
          ) : (
            <button style={{ marginTop: 8 }} onClick={() => onReveal(i)}>Reveal CID</button>
          )}
        </div>
      ))}
    </div>
  );
}
