// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Importing OpenZeppelin's AccessControl
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./Marketplace.sol"; // Ensure you import the Marketplace contract

contract RatingFeedbackSystem is AccessControl {
    // Reference to the Marketplace contract
    Marketplace public marketplace;

    // Struct to hold rating and feedback information
    struct Rating {
        uint8 stars; // Rating from 1 to 5
        string feedback; // Text feedback
        address buyer; // Address of the buyer who submitted the rating
    }

    // Mapping from token ID to an array of ratings
    mapping(uint256 => Rating[]) private _ratings;

    // Event emitted when a new rating is submitted
    event RatingSubmitted(uint256 indexed tokenId, address indexed buyer, uint8 stars, string feedback);

    // Constructor to set the Marketplace contract address
    constructor(address _marketplace) {
        marketplace = Marketplace(_marketplace);
        // Grant the contract deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Function to submit a rating and feedback for a DataToken
    function submitRating(uint256 tokenId, uint8 stars, string calldata feedback) external {
        require(stars >= 1 && stars <= 5, "Rating must be between 1 and 5");
        require(isBuyer(msg.sender, tokenId), "Only buyers can submit ratings");

        // Store the rating
        _ratings[tokenId].push(Rating({
            stars: stars,
            feedback: feedback,
            buyer: msg.sender
        }));

        // Emit the RatingSubmitted event
        emit RatingSubmitted(tokenId, msg.sender, stars, feedback);
    }

    // Function to check if an address is a buyer of a specific DataToken
    function isBuyer(address user, uint256 tokenId) internal view returns (bool) {
        // Call the Marketplace contract to check if the user is the buyer
        return marketplace.isBuyer(user, tokenId);
    }

    // Function to retrieve ratings for a specific DataToken
    function getRatings(uint256 tokenId) external view returns (Rating[] memory) {
        return _ratings[tokenId];
    }
}
