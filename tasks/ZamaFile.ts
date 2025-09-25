import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:deployZamaFile")
  .setDescription("Deploy the ZamaFile contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const signers = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("ZamaFile");
    const contract = await contractFactory.connect(signers[0]).deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`ZamaFile deployed to: ${contractAddress}`);
  });

task("task:storeFile")
  .addParam("contract", "The ZamaFile contract address")
  .addParam("filename", "The file name to store")
  .setDescription("Store a file with encrypted addresses")
  .setAction(async function (taskArguments: TaskArguments, { ethers, fhevm }) {
    const contractAddress = taskArguments.contract;
    const fileName = taskArguments.filename;
    
    const signers = await ethers.getSigners();
    const signer = signers[0];

    const contractFactory = await ethers.getContractFactory("ZamaFile");
    const contract = contractFactory.attach(contractAddress);

    // Generate mock addresses for demonstration
    const mockAddr1 = "0x742d35Cc6634C0532925a3b8D4C1df6bE8Cc" + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const mockAddr2 = "0x742d35Cc6634C0532925a3b8D4C1df6bE9Cc" + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    const input = fhevm.createEncryptedInput(contractAddress, signer.address);
    input.addAddress(mockAddr1);
    input.addAddress(mockAddr2);
    const encryptedInput = await input.encrypt();

    const transaction = await contract.connect(signer).storeFile(
      encryptedInput.handles[0],
      encryptedInput.handles[1],
      fileName,
      encryptedInput.inputProof,
    );
    await transaction.wait();

    console.log(`File "${fileName}" stored successfully in transaction: ${transaction.hash}`);
  });

task("task:getUserFileCount")
  .addParam("contract", "The ZamaFile contract address")
  .setDescription("Get the user's file count")
  .setAction(async function (taskArguments: TaskArguments, { ethers, fhevm }) {
    const contractAddress = taskArguments.contract;
    const signers = await ethers.getSigners();
    const signer = signers[0];

    const contractFactory = await ethers.getContractFactory("ZamaFile");
    const contract = contractFactory.attach(contractAddress);

    const encryptedFileCount = await contract.connect(signer).getUserFileCount();
    const fileCount = await fhevm.userDecryptEuint(
      "euint32",
      encryptedFileCount,
      contractAddress,
      signer
    );

    console.log(`User file count: ${fileCount}`);
  });

task("task:getAllUserFiles")
  .addParam("contract", "The ZamaFile contract address")
  .setDescription("Get all user files")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const contractAddress = taskArguments.contract;
    const signers = await ethers.getSigners();
    const signer = signers[0];

    const contractFactory = await ethers.getContractFactory("ZamaFile");
    const contract = contractFactory.attach(contractAddress);

    const [fileNames, timestamps] = await contract.connect(signer).getAllUserFiles();

    console.log("User files:");
    for (let i = 0; i < fileNames.length; i++) {
      const date = new Date(Number(timestamps[i]) * 1000);
      console.log(`${i + 1}. ${fileNames[i]} (uploaded: ${date.toISOString()})`);
    }
  });

task("task:removeFile")
  .addParam("contract", "The ZamaFile contract address")
  .addParam("index", "The file index to remove")
  .setDescription("Remove a file by index")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const contractAddress = taskArguments.contract;
    const fileIndex = parseInt(taskArguments.index);
    
    const signers = await ethers.getSigners();
    const signer = signers[0];

    const contractFactory = await ethers.getContractFactory("ZamaFile");
    const contract = contractFactory.attach(contractAddress);

    const transaction = await contract.connect(signer).removeFile(fileIndex);
    await transaction.wait();

    console.log(`File at index ${fileIndex} removed successfully in transaction: ${transaction.hash}`);
  });