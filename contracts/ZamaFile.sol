// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, eaddress, euint32, externalEaddress } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import "./libraries/IPFSUtils.sol";

contract ZamaFile is SepoliaConfig {
    using IPFSUtils for bytes32;

    struct EncryptedFile {
        eaddress encryptedAddress1;
        eaddress encryptedAddress2;
        string fileName;
        uint256 timestamp;
        bool exists;
    }

    mapping(address => EncryptedFile[]) private userFiles;
    mapping(address => euint32) private userFileCount;

    event FileStored(address indexed user, string fileName, uint256 timestamp);
    event FileRemoved(address indexed user, uint256 index, uint256 timestamp);

    constructor() {
        // Initialize empty file counts for users
    }

    function storeFile(
        externalEaddress encryptedAddr1,
        externalEaddress encryptedAddr2,
        string calldata fileName,
        bytes calldata inputProof
    ) external {
        require(bytes(fileName).length > 0, "File name cannot be empty");
        require(bytes(fileName).length <= 256, "File name too long");

        eaddress addr1 = FHE.fromExternal(encryptedAddr1, inputProof);
        eaddress addr2 = FHE.fromExternal(encryptedAddr2, inputProof);

        EncryptedFile memory newFile = EncryptedFile({
            encryptedAddress1: addr1,
            encryptedAddress2: addr2,
            fileName: fileName,
            timestamp: block.timestamp,
            exists: true
        });

        userFiles[msg.sender].push(newFile);
        userFileCount[msg.sender] = FHE.add(userFileCount[msg.sender], 1);

        FHE.allowThis(addr1);
        FHE.allow(addr1, msg.sender);
        FHE.allowThis(addr2);
        FHE.allow(addr2, msg.sender);
        FHE.allowThis(userFileCount[msg.sender]);
        FHE.allow(userFileCount[msg.sender], msg.sender);

        emit FileStored(msg.sender, fileName, block.timestamp);
    }

    function getUserFileCount() external view returns (euint32) {
        return userFileCount[msg.sender];
    }

    function getFile(uint256 index) external view returns (
        eaddress encryptedAddress1,
        eaddress encryptedAddress2,
        string memory fileName,
        uint256 timestamp,
        bool exists
    ) {
        require(index < userFiles[msg.sender].length, "File index out of bounds");
        
        EncryptedFile storage file = userFiles[msg.sender][index];
        require(file.exists, "File does not exist");

        return (
            file.encryptedAddress1,
            file.encryptedAddress2,
            file.fileName,
            file.timestamp,
            file.exists
        );
    }

    function getAllUserFiles() external view returns (
        string[] memory fileNames,
        uint256[] memory timestamps
    ) {
        uint256 length = userFiles[msg.sender].length;
        uint256 existingCount = 0;

        for (uint256 i = 0; i < length; i++) {
            if (userFiles[msg.sender][i].exists) {
                existingCount++;
            }
        }

        fileNames = new string[](existingCount);
        timestamps = new uint256[](existingCount);

        uint256 currentIndex = 0;
        for (uint256 i = 0; i < length; i++) {
            if (userFiles[msg.sender][i].exists) {
                fileNames[currentIndex] = userFiles[msg.sender][i].fileName;
                timestamps[currentIndex] = userFiles[msg.sender][i].timestamp;
                currentIndex++;
            }
        }
    }

    function removeFile(uint256 index) external {
        require(index < userFiles[msg.sender].length, "File index out of bounds");
        require(userFiles[msg.sender][index].exists, "File does not exist");

        userFiles[msg.sender][index].exists = false;
        userFileCount[msg.sender] = FHE.sub(userFileCount[msg.sender], 1);

        FHE.allowThis(userFileCount[msg.sender]);
        FHE.allow(userFileCount[msg.sender], msg.sender);

        emit FileRemoved(msg.sender, index, block.timestamp);
    }

    function updateFileName(uint256 index, string calldata newFileName) external {
        require(index < userFiles[msg.sender].length, "File index out of bounds");
        require(userFiles[msg.sender][index].exists, "File does not exist");
        require(bytes(newFileName).length > 0, "File name cannot be empty");
        require(bytes(newFileName).length <= 256, "File name too long");

        userFiles[msg.sender][index].fileName = newFileName;
    }

    function getTotalUserFiles() external view returns (uint256) {
        return userFiles[msg.sender].length;
    }
}