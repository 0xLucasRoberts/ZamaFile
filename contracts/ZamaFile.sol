// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, eaddress, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ZamaFile - Encrypted address storage for IPFS-hash mappings
/// @notice Stores two encrypted addresses (derived from an IPFS hash) and a cleartext filename per user entry.
/// @dev Uses FHEVM encrypted address type (eaddress) and validates external encrypted input via a single inputProof.
contract ZamaFile is SepoliaConfig {
    struct Record {
        // Cleartext metadata
        string name; // user-provided file name (not encrypted)
        uint256 timestamp;
        // Encrypted payload (two addresses derived from IPFS hash)
        eaddress addr1;
        eaddress addr2;
    }

    /// @dev Per-user list of records
    mapping(address => Record[]) private _records;

    /// @notice Emitted when a new record is submitted
    event RecordSubmitted(address indexed user, uint256 indexed index, string name, uint256 timestamp);

    /// @notice Submit a new record with two encrypted addresses
    /// @param _name Plaintext file name (not encrypted)
    /// @param _addr1 Encrypted address part 1 (external handle)
    /// @param _addr2 Encrypted address part 2 (external handle)
    /// @param inputProof Input proof returned by the relayer SDK encrypt() call
    function submitRecord(
        string calldata _name,
        externalEaddress _addr1,
        externalEaddress _addr2,
        bytes calldata inputProof
    ) external {
        // Validate external encrypted inputs
        eaddress a1 = FHE.fromExternal(_addr1, inputProof);
        eaddress a2 = FHE.fromExternal(_addr2, inputProof);

        // Update ACL so the contract and caller can re-use and user-decrypt the values
        FHE.allowThis(a1);
        FHE.allowThis(a2);
        FHE.allow(a1, msg.sender);
        FHE.allow(a2, msg.sender);

        Record memory rec = Record({
            name: _name,
            timestamp: block.timestamp,
            addr1: a1,
            addr2: a2
        });
        _records[msg.sender].push(rec);

        emit RecordSubmitted(msg.sender, _records[msg.sender].length - 1, _name, block.timestamp);
    }

    /// @notice Returns the number of records stored by a user
    function getRecordCount(address user) external view returns (uint256) {
        return _records[user].length;
    }

    /// @notice Returns a single record by index
    /// @dev Encrypted types are returned as ciphertext handles (bytes32 in ABI)
    function getRecord(
        address user,
        uint256 index
    ) external view returns (string memory name, uint256 timestamp, eaddress addr1, eaddress addr2) {
        require(index < _records[user].length, "Index out of bounds");
        Record storage r = _records[user][index];
        return (r.name, r.timestamp, r.addr1, r.addr2);
    }

    /// @notice Convenience view to fetch all record names for a user
    function getRecordNames(address user) external view returns (string[] memory) {
        uint256 n = _records[user].length;
        string[] memory names = new string[](n);
        for (uint256 i = 0; i < n; i++) {
            names[i] = _records[user][i].name;
        }
        return names;
    }
}
