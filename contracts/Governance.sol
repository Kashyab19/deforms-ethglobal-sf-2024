// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Importing OpenZeppelin's AccessControl and ERC721 interfaces
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Governance is AccessControl {
    // Reference to the DataToken contract
    IERC721 public dataToken;

    // Struct to hold proposal information
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endTime;
        bool executed;
    }

    // Mapping from proposal ID to Proposal
    mapping(uint256 => Proposal) public proposals;

    // Mapping from proposal ID to voters
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Counter for proposal IDs
    uint256 public proposalCount;

    // Event emitted when a new proposal is created
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description, uint256 endTime);

    // Event emitted when a vote is cast
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);

    // Event emitted when a proposal is executed
    event ProposalExecuted(uint256 indexed proposalId, bool approved);

    // Constructor to set the DataToken contract address
    constructor(address _dataToken) {
        dataToken = IERC721(_dataToken);
        // Grant the contract deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Function to create a new proposal
    function createProposal(string calldata description, uint256 votingPeriod) external {
        require(votingPeriod > 0, "Voting period must be greater than zero");

        proposalCount++;
        uint256 endTime = block.timestamp + votingPeriod;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            endTime: endTime,
            executed: false
        });

        emit ProposalCreated(proposalCount, msg.sender, description, endTime);
    }

    // Function to vote on a proposal
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.endTime, "Voting period has ended");
        require(!hasVoted[proposalId][msg.sender], "You have already voted");

        // Check if the voter owns a DataToken (voting rights)
        require(dataToken.balanceOf(msg.sender) > 0, "You must own a DataToken to vote");

        // Record the vote
        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    // Function to execute a proposal if it has passed
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Voting period has not ended");
        require(!proposal.executed, "Proposal has already been executed");

        // Determine if the proposal has passed
        bool approved = proposal.votesFor > proposal.votesAgainst;

        // Execute the proposal (implement changes based on the proposal description)
        // This is a placeholder for actual implementation
        // Implement the logic to change platform parameters based on the proposal description

        proposal.executed = true;

        emit ProposalExecuted(proposalId, approved);
    }
}
