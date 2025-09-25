// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../libraries/IPFSUtils.sol";

contract TestIPFSUtils {
    using IPFSUtils for bytes32;

    function ipfsHashToAddresses(bytes32 hash) external pure returns (address address1, address address2) {
        return IPFSUtils.ipfsHashToAddresses(hash);
    }
    
    function addressesToIPFSHash(address address1, address address2) external pure returns (bytes32) {
        return IPFSUtils.addressesToIPFSHash(address1, address2);
    }
    
    function validateIPFSAddresses(bytes32 originalHash, address address1, address address2) external pure returns (bool) {
        return IPFSUtils.validateIPFSAddresses(originalHash, address1, address2);
    }
}