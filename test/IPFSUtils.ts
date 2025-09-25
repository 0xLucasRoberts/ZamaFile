import { ethers } from "hardhat";
import { expect } from "chai";

describe("IPFSUtils Library", function () {
  let testContract: any;

  beforeEach(async function () {
    const TestIPFSUtilsFactory = await ethers.getContractFactory("TestIPFSUtils");
    testContract = await TestIPFSUtilsFactory.deploy();
  });

  describe("IPFS Hash to Addresses Conversion", function () {
    it("should convert IPFS hash to two different addresses", async function () {
      const testHash = ethers.keccak256(ethers.toUtf8Bytes("test-ipfs-hash"));
      
      const [address1, address2] = await testContract.ipfsHashToAddresses(testHash);
      
      expect(address1).to.not.equal(address2);
      expect(ethers.isAddress(address1)).to.be.true;
      expect(ethers.isAddress(address2)).to.be.true;
    });

    it("should produce consistent addresses for the same hash", async function () {
      const testHash = ethers.keccak256(ethers.toUtf8Bytes("consistent-test"));
      
      const [address1a, address2a] = await testContract.ipfsHashToAddresses(testHash);
      const [address1b, address2b] = await testContract.ipfsHashToAddresses(testHash);
      
      expect(address1a).to.equal(address1b);
      expect(address2a).to.equal(address2b);
    });

    it("should produce different addresses for different hashes", async function () {
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("hash1"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("hash2"));
      
      const [addr1a, addr2a] = await testContract.ipfsHashToAddresses(hash1);
      const [addr1b, addr2b] = await testContract.ipfsHashToAddresses(hash2);
      
      expect(addr1a).to.not.equal(addr1b);
      expect(addr2a).to.not.equal(addr2b);
    });
  });

  describe("Addresses to IPFS Hash Conversion", function () {
    it("should convert addresses to a hash", async function () {
      const address1 = "0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234";
      const address2 = "0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678";
      
      const hash = await testContract.addressesToIPFSHash(address1, address2);
      
      expect(hash).to.not.equal(ethers.ZeroHash);
      expect(typeof hash).to.equal("string");
      expect(hash).to.match(/^0x[a-fA-F0-9]{64}$/);
    });

    it("should produce different hashes for different address pairs", async function () {
      const address1a = "0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234";
      const address2a = "0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678";
      const address1b = "0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc9999";
      const address2b = "0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc8888";
      
      const hash1 = await testContract.addressesToIPFSHash(address1a, address2a);
      const hash2 = await testContract.addressesToIPFSHash(address1b, address2b);
      
      expect(hash1).to.not.equal(hash2);
    });

    it("should produce consistent hashes for the same address pairs", async function () {
      const address1 = "0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234";
      const address2 = "0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678";
      
      const hash1 = await testContract.addressesToIPFSHash(address1, address2);
      const hash2 = await testContract.addressesToIPFSHash(address1, address2);
      
      expect(hash1).to.equal(hash2);
    });
  });

  describe("IPFS Address Validation", function () {
    it("should validate correct IPFS addresses", async function () {
      const originalHash = ethers.keccak256(ethers.toUtf8Bytes("validation-test"));
      const [address1, address2] = await testContract.ipfsHashToAddresses(originalHash);
      
      const isValid = await testContract.validateIPFSAddresses(originalHash, address1, address2);
      
      expect(isValid).to.be.true;
    });

    it("should reject incorrect IPFS addresses", async function () {
      const originalHash = ethers.keccak256(ethers.toUtf8Bytes("validation-test"));
      const wrongAddress1 = "0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234";
      const wrongAddress2 = "0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678";
      
      const isValid = await testContract.validateIPFSAddresses(originalHash, wrongAddress1, wrongAddress2);
      
      expect(isValid).to.be.false;
    });

    it("should reject when only one address is correct", async function () {
      const originalHash = ethers.keccak256(ethers.toUtf8Bytes("validation-test"));
      const [correctAddress1] = await testContract.ipfsHashToAddresses(originalHash);
      const wrongAddress2 = "0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678";
      
      const isValid = await testContract.validateIPFSAddresses(originalHash, correctAddress1, wrongAddress2);
      
      expect(isValid).to.be.false;
    });
  });
});

// We need to create a test contract to expose the library functions
// This would be added to the contracts folder for testing purposes