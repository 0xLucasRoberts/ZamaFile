// Utilities for mock IPFS CID handling and reversible conversion with two EVM addresses

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes: Uint8Array): string {
  let x = BigInt(0);
  for (const b of bytes) x = (x << 8n) + BigInt(b);
  let out = '';
  while (x > 0n) {
    const mod = Number(x % 58n);
    out = BASE58_ALPHABET[mod] + out;
    x = x / 58n;
  }
  // handle leading zeros
  let i = 0;
  while (i < bytes.length && bytes[i] === 0) {
    out = '1' + out; i++;
  }
  return out || '1';
}

function base58Decode(s: string): Uint8Array {
  let x = BigInt(0);
  for (const c of s) {
    const v = BASE58_ALPHABET.indexOf(c);
    if (v < 0) throw new Error('invalid base58 character');
    x = x * 58n + BigInt(v);
  }
  // convert to bytes
  const out: number[] = [];
  while (x > 0n) {
    out.push(Number(x & 0xffn));
    x >>= 8n;
  }
  out.reverse();
  // leading zeros
  let leading = 0;
  for (const c of s) {
    if (c === '1') leading++; else break;
  }
  return new Uint8Array([...new Array(leading).fill(0), ...out]);
}

export async function mockIPFSUpload(file: File): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));
  // CIDv0 = base58btc( 0x12 0x20 || sha256(file) )
  const prefixed = new Uint8Array(2 + digest.length);
  prefixed[0] = 0x12; // sha2-256
  prefixed[1] = 0x20; // 32 bytes
  prefixed.set(digest, 2);
  return base58Encode(prefixed);
}

function hexToBytes(hex: string): Uint8Array {
  const h = hex.replace(/^0x/, '');
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(2 * i, 2 * i + 2), 16);
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function ipfsToAddresses(cid: string): { addr1: string; addr2: string } {
  const mh = base58Decode(cid); // multihash bytes
  const buf = new Uint8Array(40);
  const len = Math.min(mh.length, 39); // reserve last byte for length
  buf.set(mh.subarray(0, len), 0);
  buf[39] = mh.length; // original length
  const a1 = bytesToHex(buf.subarray(0, 20));
  const a2 = bytesToHex(buf.subarray(20, 40));
  return { addr1: a1 as string, addr2: a2 as string };
}

export function addressesToIpfs(addr1: string, addr2: string): string {
  const b1 = hexToBytes(addr1);
  const b2 = hexToBytes(addr2);
  if (b1.length !== 20 || b2.length !== 20) throw new Error('invalid address bytes');
  const buf = new Uint8Array(40);
  buf.set(b1, 0);
  buf.set(b2, 20);
  const l = buf[39];
  const mh = buf.subarray(0, l);
  return base58Encode(mh);
}

