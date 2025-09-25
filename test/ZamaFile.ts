import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("ZamaFile", function () {
  let zamaFileContract: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ZamaFileFactory = await ethers.getContractFactory("ZamaFile");
    zamaFileContract = await ZamaFileFactory.deploy();
  });

  describe("File Storage", function () {
    it("should store a file with encrypted addresses", async function () {
      const contractAddress = await zamaFileContract.getAddress();
      const userAddress = user1.address;

      const input = fhevm.createEncryptedInput(contractAddress, userAddress);
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234");
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678");
      const encryptedInput = await input.encrypt();

      const tx = await zamaFileContract
        .connect(user1)
        .storeFile(
          encryptedInput.handles[0],
          encryptedInput.handles[1],
          "test-file.txt",
          encryptedInput.inputProof
        );

      await expect(tx)
        .to.emit(zamaFileContract, "FileStored")
        .withArgs(user1.address, "test-file.txt", await ethers.provider.getBlock("latest").then(b => b?.timestamp));
    });

    it("should not allow empty file names", async function () {
      const contractAddress = await zamaFileContract.getAddress();
      const userAddress = user1.address;

      const input = fhevm.createEncryptedInput(contractAddress, userAddress);
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234");
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678");
      const encryptedInput = await input.encrypt();

      await expect(
        zamaFileContract
          .connect(user1)
          .storeFile(
            encryptedInput.handles[0],
            encryptedInput.handles[1],
            "",
            encryptedInput.inputProof
          )
      ).to.be.revertedWith("File name cannot be empty");
    });

    it("should not allow file names longer than 256 characters", async function () {
      const contractAddress = await zamaFileContract.getAddress();
      const userAddress = user1.address;

      const input = fhevm.createEncryptedInput(contractAddress, userAddress);
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234");
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678");
      const encryptedInput = await input.encrypt();

      const longFileName = "a".repeat(257);

      await expect(
        zamaFileContract
          .connect(user1)
          .storeFile(
            encryptedInput.handles[0],
            encryptedInput.handles[1],
            longFileName,
            encryptedInput.inputProof
          )
      ).to.be.revertedWith("File name too long");
    });
  });

  describe("File Count", function () {
    it("should return correct encrypted file count", async function () {
      const contractAddress = await zamaFileContract.getAddress();
      const userAddress = user1.address;

      const input = fhevm.createEncryptedInput(contractAddress, userAddress);
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234");
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678");
      const encryptedInput = await input.encrypt();

      await zamaFileContract
        .connect(user1)
        .storeFile(
          encryptedInput.handles[0],
          encryptedInput.handles[1],
          "file1.txt",
          encryptedInput.inputProof
        );

      const encryptedCount = await zamaFileContract.connect(user1).getUserFileCount();
      const decryptedCount = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedCount,
        contractAddress,
        user1
      );

      expect(decryptedCount).to.equal(1);
    });

    it("should increment file count when adding multiple files", async function () {
      const contractAddress = await zamaFileContract.getAddress();
      const userAddress = user1.address;

      for (let i = 0; i < 3; i++) {
        const input = fhevm.createEncryptedInput(contractAddress, userAddress);
        input.addAddress(`0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc123${i}`);
        input.addAddress(`0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc567${i}`);
        const encryptedInput = await input.encrypt();

        await zamaFileContract
          .connect(user1)
          .storeFile(
            encryptedInput.handles[0],
            encryptedInput.handles[1],
            `file${i}.txt`,
            encryptedInput.inputProof
          );
      }

      const encryptedCount = await zamaFileContract.connect(user1).getUserFileCount();
      const decryptedCount = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedCount,
        contractAddress,
        user1
      );

      expect(decryptedCount).to.equal(3);
    });
  });

  describe("File Retrieval", function () {
    beforeEach(async function () {
      const contractAddress = await zamaFileContract.getAddress();
      const userAddress = user1.address;

      const input = fhevm.createEncryptedInput(contractAddress, userAddress);
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234");
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678");
      const encryptedInput = await input.encrypt();

      await zamaFileContract
        .connect(user1)
        .storeFile(
          encryptedInput.handles[0],
          encryptedInput.handles[1],
          "test-file.txt",
          encryptedInput.inputProof
        );
    });

    it("should retrieve file data correctly", async function () {
      const fileData = await zamaFileContract.connect(user1).getFile(0);
      
      expect(fileData.fileName).to.equal("test-file.txt");
      expect(fileData.exists).to.be.true;
      expect(fileData.timestamp).to.be.a("bigint");
    });

    it("should get all user files", async function () {
      const [fileNames, timestamps] = await zamaFileContract.connect(user1).getAllUserFiles();
      
      expect(fileNames).to.have.lengthOf(1);
      expect(fileNames[0]).to.equal("test-file.txt");
      expect(timestamps).to.have.lengthOf(1);
    });

    it("should revert when accessing non-existent file index", async function () {
      await expect(
        zamaFileContract.connect(user1).getFile(999)
      ).to.be.revertedWith("File index out of bounds");
    });
  });

  describe("File Removal", function () {
    beforeEach(async function () {
      const contractAddress = await zamaFileContract.getAddress();
      const userAddress = user1.address;

      const input = fhevm.createEncryptedInput(contractAddress, userAddress);
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234");
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678");
      const encryptedInput = await input.encrypt();

      await zamaFileContract
        .connect(user1)
        .storeFile(
          encryptedInput.handles[0],
          encryptedInput.handles[1],
          "test-file.txt",
          encryptedInput.inputProof
        );
    });

    it("should remove a file successfully", async function () {
      const tx = await zamaFileContract.connect(user1).removeFile(0);
      
      await expect(tx)
        .to.emit(zamaFileContract, "FileRemoved")
        .withArgs(user1.address, 0, await ethers.provider.getBlock("latest").then(b => b?.timestamp));

      await expect(
        zamaFileContract.connect(user1).getFile(0)
      ).to.be.revertedWith("File does not exist");
    });

    it("should decrement file count when removing file", async function () {
      await zamaFileContract.connect(user1).removeFile(0);

      const contractAddress = await zamaFileContract.getAddress();
      const encryptedCount = await zamaFileContract.connect(user1).getUserFileCount();
      const decryptedCount = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedCount,
        contractAddress,
        user1
      );

      expect(decryptedCount).to.equal(0);
    });

    it("should revert when removing non-existent file", async function () {
      await expect(
        zamaFileContract.connect(user1).removeFile(999)
      ).to.be.revertedWith("File index out of bounds");
    });

    it("should revert when removing already removed file", async function () {
      await zamaFileContract.connect(user1).removeFile(0);
      
      await expect(
        zamaFileContract.connect(user1).removeFile(0)
      ).to.be.revertedWith("File does not exist");
    });
  });

  describe("File Name Updates", function () {
    beforeEach(async function () {
      const contractAddress = await zamaFileContract.getAddress();
      const userAddress = user1.address;

      const input = fhevm.createEncryptedInput(contractAddress, userAddress);
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234");
      input.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678");
      const encryptedInput = await input.encrypt();

      await zamaFileContract
        .connect(user1)
        .storeFile(
          encryptedInput.handles[0],
          encryptedInput.handles[1],
          "original-name.txt",
          encryptedInput.inputProof
        );
    });

    it("should update file name successfully", async function () {
      await zamaFileContract.connect(user1).updateFileName(0, "new-name.txt");
      
      const fileData = await zamaFileContract.connect(user1).getFile(0);
      expect(fileData.fileName).to.equal("new-name.txt");
    });

    it("should not allow empty file name updates", async function () {
      await expect(
        zamaFileContract.connect(user1).updateFileName(0, "")
      ).to.be.revertedWith("File name cannot be empty");
    });

    it("should not allow file name updates longer than 256 characters", async function () {
      const longFileName = "a".repeat(257);
      
      await expect(
        zamaFileContract.connect(user1).updateFileName(0, longFileName)
      ).to.be.revertedWith("File name too long");
    });
  });

  describe("Access Control", function () {
    it("should isolate files between different users", async function () {
      const contractAddress = await zamaFileContract.getAddress();

      const input1 = fhevm.createEncryptedInput(contractAddress, user1.address);
      input1.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc1234");
      input1.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc5678");
      const encryptedInput1 = await input1.encrypt();

      await zamaFileContract
        .connect(user1)
        .storeFile(
          encryptedInput1.handles[0],
          encryptedInput1.handles[1],
          "user1-file.txt",
          encryptedInput1.inputProof
        );

      const input2 = fhevm.createEncryptedInput(contractAddress, user2.address);
      input2.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc9999");
      input2.addAddress("0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc8888");
      const encryptedInput2 = await input2.encrypt();

      await zamaFileContract
        .connect(user2)
        .storeFile(
          encryptedInput2.handles[0],
          encryptedInput2.handles[1],
          "user2-file.txt",
          encryptedInput2.inputProof
        );

      const [user1Files] = await zamaFileContract.connect(user1).getAllUserFiles();
      const [user2Files] = await zamaFileContract.connect(user2).getAllUserFiles();

      expect(user1Files).to.have.lengthOf(1);
      expect(user1Files[0]).to.equal("user1-file.txt");
      expect(user2Files).to.have.lengthOf(1);
      expect(user2Files[0]).to.equal("user2-file.txt");
    });
  });
});