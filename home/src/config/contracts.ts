// ZamaFile contract (Sepolia). Replace with deployed address after deploy.
export const CONTRACT_ADDRESS = '0x62EF08334314d6a38086569bDA9af198aadC71Bb';

// ABI generated from deployments/sepolia/ZamaFile.json (copy after deploy)
export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "index", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RecordSubmitted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "externalEaddress", "name": "_addr1", "type": "bytes32" },
      { "internalType": "externalEaddress", "name": "_addr2", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ],
    "name": "submitRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ],
    "name": "getRecordCount",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "getRecord",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "eaddress", "name": "addr1", "type": "bytes32" },
      { "internalType": "eaddress", "name": "addr2", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ],
    "name": "getRecordNames",
    "outputs": [ { "internalType": "string[]", "name": "", "type": "string[]" } ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
