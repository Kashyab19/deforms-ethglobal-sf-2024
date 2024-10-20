// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Importing OpenZeppelin's AccessControl
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract AccessControlManager is AccessControl {
    // Reference to the DataToken contract
    IERC721 public dataToken;

    // Struct to hold access information
    struct AccessInfo {
        uint256 tokenId; // Ensure this line exists
        address grantee;
        uint256 expirationTime;
    }

    // Mapping from token ID to access information
    mapping(uint256 => AccessInfo) private _accessRights;

    // Event emitted when access is granted
    event AccessGranted(uint256 indexed tokenId, address indexed grantee, uint256 expirationTime);

    // Event emitted when access is revoked
    event AccessRevoked(uint256 indexed tokenId, address indexed grantee);

    // Constructor to set the DataToken contract address
    constructor(address _dataToken) {
        dataToken = IERC721(_dataToken);
    }

    // Function to grant access to a DataToken for a specified duration
    function grantAccess(uint256 tokenId, address grantee, uint256 duration) external {
        require(dataToken.ownerOf(tokenId) == msg.sender, "You do not own this token");
        require(grantee != address(0), "Invalid grantee address");
        require(duration > 0, "Duration must be greater than zero");

        // Set the expiration time for access
        uint256 expirationTime = block.timestamp + duration;

        // Grant access
        _accessRights[tokenId] = AccessInfo({
            tokenId: tokenId,
            grantee: grantee,
            expirationTime: expirationTime
        });

        // Emit the AccessGranted event
        emit AccessGranted(tokenId, grantee, expirationTime);
    }

    // Function to revoke access to a DataToken
    function revokeAccess(uint256 tokenId) external {
        require(dataToken.ownerOf(tokenId) == msg.sender, "You do not own this token");
        require(_accessRights[tokenId].grantee != address(0), "No access granted");

        // Emit the AccessRevoked event
        emit AccessRevoked(tokenId, _accessRights[tokenId].grantee);

        // Remove access
        delete _accessRights[tokenId];
    }

    // Function to check if an address has access to a DataToken
    function hasAccess(uint256 tokenId, address user) external view returns (bool) {
        AccessInfo memory accessInfo = _accessRights[tokenId];
        return (accessInfo.grantee == user && accessInfo.expirationTime > block.timestamp);
    }

}
