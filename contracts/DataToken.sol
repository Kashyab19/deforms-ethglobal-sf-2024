// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Importing OpenZeppelin's ERC721 and Ownable contracts
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DataToken is ERC721, Ownable, AccessControl {
    // Define roles for data providers
    bytes32 public constant DATA_PROVIDER_ROLE = keccak256("DATA_PROVIDER_ROLE");

    // Struct to hold metadata for each token
    struct SurveyData {
        string title;
        string description;
        string category;
        uint256 creationDate;
        uint256 dataSize;
        string datasetHashOrURL;
    }

    // Mapping from token ID to survey data
    mapping(uint256 => SurveyData) private _surveyData;

    // Event emitted when a new token is minted
    event TokenMinted(uint256 indexed tokenId, address indexed owner, string datasetHashOrURL);

    // Event emitted when metadata is updated
    event MetadataUpdated(uint256 indexed tokenId, string datasetHashOrURL);

    // Constructor to initialize the ERC721 token and set up roles
    constructor(address initialOwner) ERC721("DataToken", "DTK") Ownable(initialOwner) {
        // Grant the contract deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Grant the contract deployer the data provider role
        _grantRole(DATA_PROVIDER_ROLE, msg.sender);
    }

    // Override the supportsInterface function
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Function to mint a new DataToken, callable only by authorized data providers
    function mint(
        address to,
        uint256 tokenId,
        string memory title,
        string memory description,
        string memory category,
        uint256 dataSize,
        string memory datasetHashOrURL
    ) external onlyRole(DATA_PROVIDER_ROLE) {
        // Mint the token
        _mint(to, tokenId);

        // Store the survey data
        _surveyData[tokenId] = SurveyData({
            title: title,
            description: description,
            category: category,
            creationDate: block.timestamp,
            dataSize: dataSize,
            datasetHashOrURL: datasetHashOrURL
        });

        // Emit the TokenMinted event
        emit TokenMinted(tokenId, to, datasetHashOrURL);
    }

    // Function to update metadata and dataset hash/URL, callable only by the token owner
    function updateMetadata(
        uint256 tokenId,
        string memory title,
        string memory description,
        string memory category,
        uint256 dataSize,
        string memory datasetHashOrURL
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the token owner");

        // Update the survey data
        _surveyData[tokenId] = SurveyData({
            title: title,
            description: description,
            category: category,
            creationDate: _surveyData[tokenId].creationDate, // Keep original creation date
            dataSize: dataSize,
            datasetHashOrURL: datasetHashOrURL
        });

        // Emit the MetadataUpdated event
        emit MetadataUpdated(tokenId, datasetHashOrURL);
    }

    // Function to retrieve survey data for a given token ID
    function getSurveyData(uint256 tokenId) external view returns (SurveyData memory) {
        return _surveyData[tokenId];
    }

    // Function to grant data provider role to an address
    function grantDataProviderRole(address account) external onlyOwner {
        grantRole(DATA_PROVIDER_ROLE, account);
    }

    // Function to revoke data provider role from an address
    function revokeDataProviderRole(address account) external onlyOwner {
        revokeRole(DATA_PROVIDER_ROLE, account);
    }
}
