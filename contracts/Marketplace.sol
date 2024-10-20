// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Importing OpenZeppelin's ERC721 interface and ReentrancyGuard
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    // Struct to hold listing information
    struct Listing {
        address seller;
        uint256 price;
        bool isListed;
    }

    // Mapping from token ID to listing information
    mapping(uint256 => Listing) private _listings;

    // Reference to the DataToken contract
    IERC721 public dataToken;

    // Platform fee percentage (e.g., 2% fee)
    uint256 public platformFeePercentage = 200; // 200 means 2%

    // Event emitted when a DataToken is listed for sale
    event TokenListed(uint256 indexed tokenId, address indexed seller, uint256 price);

    // Event emitted when a DataToken is delisted
    event TokenDelisted(uint256 indexed tokenId, address indexed seller);

    // Event emitted when a DataToken is purchased
    event TokenPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);

    // Constructor to set the DataToken contract address
    constructor(address initialOwner) Ownable(initialOwner) {
        dataToken = IERC721(dataToken);
    }

    // Function to list a DataToken for sale
    function listToken(uint256 tokenId, uint256 price) external {
        require(dataToken.ownerOf(tokenId) == msg.sender, "You do not own this token");
        require(price > 0, "Price must be greater than zero");

        // Ensure the token is not already listed
        require(!_listings[tokenId].isListed, "Token is already listed");

        // Create a new listing
        _listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isListed: true
        });

        // Emit the TokenListed event
        emit TokenListed(tokenId, msg.sender, price);
    }

    // Function to delist a DataToken
    function delistToken(uint256 tokenId) external {
        Listing storage listing = _listings[tokenId];
        require(listing.seller == msg.sender, "You are not the seller");
        require(listing.isListed, "Token is not listed");

        // Remove the listing
        listing.isListed = false;

        // Emit the TokenDelisted event
        emit TokenDelisted(tokenId, msg.sender);
    }

    // Function to purchase a listed DataToken
    function purchaseToken(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = _listings[tokenId];
        require(listing.isListed, "Token is not listed for sale");
        require(msg.value >= listing.price, "Insufficient payment");

        // Calculate platform fee
        uint256 fee = (listing.price * platformFeePercentage) / 10000; // 10000 for percentage
        uint256 sellerAmount = listing.price - fee;

        // Transfer the DataToken to the buyer
        dataToken.safeTransferFrom(listing.seller, msg.sender, tokenId);

        // Transfer the payment to the seller
        payable(listing.seller).transfer(sellerAmount);

        // Transfer the fee to the platform owner
        payable(owner()).transfer(fee);

        // Remove the listing
        listing.isListed = false;

        // Emit the TokenPurchased event
        emit TokenPurchased(tokenId, msg.sender, listing.seller, listing.price);
    }

    // Function to update the platform fee percentage (only owner)
    function setPlatformFeePercentage(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%"); // Maximum fee of 10%
        platformFeePercentage = newFee;
    }

    // Function to retrieve listing information
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return _listings[tokenId];
    }

    // Ensure the function is defined and has the correct visibility
    function isBuyer(address user, uint256 tokenId) public view returns (bool) {
        // ... function implementation ...
    }
}
