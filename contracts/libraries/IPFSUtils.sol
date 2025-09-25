// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library IPFSUtils {
    function ipfsHashToAddresses(bytes32 hash) internal pure returns (address address1, address address2) {
        bytes32 hash1 = keccak256(abi.encodePacked(hash, uint256(1)));
        bytes32 hash2 = keccak256(abi.encodePacked(hash, uint256(2)));
        
        address1 = address(uint160(uint256(hash1)));
        address2 = address(uint160(uint256(hash2)));
    }
    
    function addressesToIPFSHash(address address1, address address2) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(address1, address2));
    }
    
    function validateIPFSAddresses(bytes32 originalHash, address address1, address address2) internal pure returns (bool) {
        (address expectedAddr1, address expectedAddr2) = ipfsHashToAddresses(originalHash);
        return (address1 == expectedAddr1 && address2 == expectedAddr2);
    }
}