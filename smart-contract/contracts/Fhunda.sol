// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, euint32, ebool, externalEuint64, externalEuint32, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";

/**
 * @title Fhunda (Privacy-Preserving Crowdfunding Platform)
 * @notice Enhanced campaign management with full FHE privacy guarantees
 * @dev All individual contributions remain encrypted, only aggregate data is accessible
 */
contract Fhunda is ZamaEthereumConfig, Ownable, ReentrancyGuard {
    /*────────────────── STATE ──────────────────*/

    enum CampaignStatus {
        Active,
        Successful,
        Failed,
        Withdrawn
    }

    struct Campaign {
        address creator;
        uint256 deadline;
        bool withdrawn;
        CampaignStatus status;
        euint64 encryptedTarget;
        euint64 encryptedTotal;
        uint256 creationDate;
        string metadata; // IPFS hash or similar for campaign details
    }

    Campaign[] private campaigns;
    ERC7984 public token;

    // Enhanced contribution tracking: contributor => campaignIndex => encrypted amount
    mapping(address => mapping(uint256 => euint64)) private encryptedContributions;
    
    // Campaign creator tracking: creator => campaign indices
    mapping(address => uint256[]) private creatorCampaigns;
    
    // Platform statistics (encrypted for privacy)
    euint64 private encryptedPlatformTotal;
    uint256 private totalSuccessfulCampaigns;
    uint256 private totalCampaignCount;

    /*────────────────── EVENTS ──────────────────*/

    event CampaignCreated(uint256 indexed campaignId, address indexed creator, uint256 deadline);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, bytes32 encryptedAmount);
    event CampaignCompleted(uint256 indexed campaignId, bool indexed successful);
    event WithdrawalMade(uint256 indexed campaignId, address indexed creator, bytes32 encryptedAmount);
    event CampaignStatusUpdated(uint256 indexed campaignId, CampaignStatus status);

    /*────────────────── CONSTRUCTOR ──────────────────*/

    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token address");
        token = ERC7984(tokenAddress);
        
        // Initialize platform statistics
        euint64 zero = FHE.asEuint64(0);
        encryptedPlatformTotal = zero;
        FHE.allowThis(encryptedPlatformTotal);
        
        totalSuccessfulCampaigns = 0;
        totalCampaignCount = 0;
    }

    /*────────────────── CREATE CAMPAIGN ──────────────────*/

    function createCampaign(
        externalEuint64 encryptedTarget, 
        bytes calldata proof, 
        uint256 durationInDays,
        string calldata metadata
    ) external returns (uint256 campaignId) {
        require(durationInDays > 0, "Invalid duration");
        require(bytes(metadata).length > 0, "Metadata required");

        euint64 target = FHE.fromExternal(encryptedTarget, proof);
        euint64 zero = FHE.asEuint64(0);

        campaignId = campaigns.length;
        
        Campaign memory c = Campaign({
            creator: msg.sender,
            deadline: block.timestamp + durationInDays * 1 days,
            withdrawn: false,
            status: CampaignStatus.Active,
            encryptedTarget: target,
            encryptedTotal: zero,
            creationDate: block.timestamp,
            metadata: metadata
        });

        FHE.allowThis(target);
        FHE.allowThis(zero);

        campaigns.push(c);
        creatorCampaigns[msg.sender].push(campaignId);
        
        totalCampaignCount++;

        emit CampaignCreated(campaignId, msg.sender, c.deadline);
    }

    /*────────────────── CONTRIBUTE (ENCRYPTED) ──────────────────*/

    function contribute(
        externalEuint32 encryptedCampaignId,
        externalEuint64 encryptedAmount,
        bytes calldata proofCampaignId,
        bytes calldata proofAmount
    ) external nonReentrant {
        require(token.isOperator(msg.sender, address(this)), "Token contract is not approved operator");

        euint32 targetId = FHE.fromExternal(encryptedCampaignId, proofCampaignId);
        euint64 amount = FHE.fromExternal(encryptedAmount, proofAmount);

        FHE.allowThis(targetId);
        FHE.allowThis(amount);

        // Transfer encrypted amount from contributor to this contract
        FHE.allowTransient(amount, address(token));
        euint64 amountTransferred = token.confidentialTransferFrom(msg.sender, address(this), amount);
        FHE.allowThis(amountTransferred);

        uint256 length = campaigns.length;

        for (uint256 i = 0; i < length; i++) {
            Campaign storage c = campaigns[i];

            // Skip inactive campaigns (assuming Active = 0)
            ebool isActive = FHE.eq(FHE.asEuint32(uint32(uint256(c.status))), FHE.asEuint32(0));
            // Skip expired campaigns
            ebool notExpired = FHE.lt(FHE.asEuint32(uint32(block.timestamp)), FHE.asEuint32(uint32(c.deadline)));
            ebool isValid = FHE.and(isActive, notExpired);

            // encrypted comparison
            ebool isMatch = FHE.and(FHE.eq(targetId, FHE.asEuint32(uint32(i))), isValid);

            // masked update: total = match ? total + amount : total
            euint64 updatedTotal = FHE.select(isMatch, FHE.add(c.encryptedTotal, amountTransferred), c.encryptedTotal);

            c.encryptedTotal = updatedTotal;
            FHE.allowThis(updatedTotal);

            // Update platform total if contribution is valid
            encryptedPlatformTotal = FHE.select(isMatch, FHE.add(encryptedPlatformTotal, amountTransferred), encryptedPlatformTotal);
            FHE.allowThis(encryptedPlatformTotal);

            // masked per-user contribution tracking
            encryptedContributions[msg.sender][i] = FHE.select(
                isMatch,
                amountTransferred,
                encryptedContributions[msg.sender][i]
            );

            FHE.allowThis(encryptedContributions[msg.sender][i]);
            FHE.allow(encryptedContributions[msg.sender][i], msg.sender);

            // NOTE: Success condition evaluation moved off-chain
            // Campaign status updates should be handled by frontend after off-chain validation
            // This maintains privacy while ensuring proper state management
        }

        // NOTE: Campaign validation should be done off-chain before calling this function
        // This maintains privacy while ensuring proper error handling

        // Emit event - campaign ID will be handled off-chain
        emit ContributionMade(0, msg.sender, 0x0);
    }

    /*────────────────── WITHDRAW (CREATOR ONLY) ──────────────────*/

    function withdraw(uint256 campaignIndex) external nonReentrant {
        require(campaignIndex < campaigns.length, "Invalid campaign");

        Campaign storage c = campaigns[campaignIndex];

        require(msg.sender == c.creator, "Not creator");
        require(!c.withdrawn, "Already withdrawn");
        require(block.timestamp > c.deadline, "Campaign active");
        require(c.status == CampaignStatus.Successful, "Campaign not successful");

        c.withdrawn = true;
        c.status = CampaignStatus.Withdrawn;

        // Get the encrypted total
        euint64 totalToTransfer = c.encryptedTotal;
        FHE.allowTransient(totalToTransfer, address(token));

        // Transfer all accumulated tokens to creator
        token.confidentialTransfer(c.creator, totalToTransfer);

        emit WithdrawalMade(campaignIndex, msg.sender, 0x0);
        emit CampaignStatusUpdated(campaignIndex, CampaignStatus.Withdrawn);
    }

    /*────────────────── CAMPAIGN MANAGEMENT FUNCTIONS ──────────────────*/

    function getAllCampaigns() external view returns (uint256[] memory) {
        uint256[] memory campaignIds = new uint256[](campaigns.length);
        for (uint256 i = 0; i < campaigns.length; i++) {
            campaignIds[i] = i;
        }
        return campaignIds;
    }

    function getAllActiveCampaigns() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](campaigns.length);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].status == CampaignStatus.Active && block.timestamp <= campaigns[i].deadline) {
                activeIds[activeCount] = i;
                activeCount++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeIds[i];
        }
        
        return result;
    }

    function getCampaignsByWallet(address wallet) external view returns (uint256[] memory) {
        return creatorCampaigns[wallet];
    }

    function getCampaignById(uint256 campaignId) external view returns (
        address creator,
        uint256 deadline,
        CampaignStatus status,
        bool withdrawn,
        uint256 creationDate,
        string memory metadata
    ) {
        require(campaignId < campaigns.length, "Invalid campaign");
        
        Campaign storage c = campaigns[campaignId];
        return (
            c.creator,
            c.deadline,
            c.status,
            c.withdrawn,
            c.creationDate,
            c.metadata
        );
    }

    function isCampaignSuccessful(uint256 campaignId) external view returns (bool) {
        require(campaignId < campaigns.length, "Invalid campaign");
        return campaigns[campaignId].status == CampaignStatus.Successful;
    }

    /*────────────────── PLATFORM STATISTICS ──────────────────*/

    function getTotalPlatformRaised() external returns (euint64) {
        FHE.allow(encryptedPlatformTotal, msg.sender);
        return encryptedPlatformTotal;
    }

    function getTotalSuccessfulCampaigns() external view returns (uint256) {
        return totalSuccessfulCampaigns;
    }

    function getTotalCampaignCount() external view returns (uint256) {
        return totalCampaignCount;
    }

    /*────────────────── ENCRYPTED DATA ACCESS ──────────────────*/

    function getEncryptedCampaignTotal(uint256 index) external returns (euint64) {
        require(index < campaigns.length, "Invalid campaign");
        FHE.allow(campaigns[index].encryptedTotal, msg.sender);
        return campaigns[index].encryptedTotal;
    }

    function getEncryptedCampaignTarget(uint256 index) external returns (euint64) {
        require(index < campaigns.length, "Invalid campaign");
        FHE.allow(campaigns[index].encryptedTarget, msg.sender);
        return campaigns[index].encryptedTarget;
    }

    function getEncryptedContribution(address contributor, uint256 index) external returns (euint64) {
        require(index < campaigns.length, "Invalid campaign");
        FHE.allow(encryptedContributions[contributor][index], msg.sender);
        return encryptedContributions[contributor][index];
    }

    function campaignCount() external view returns (uint256) {
        return campaigns.length;
    }

    /*────────────────── ADMIN FUNCTIONS ──────────────────*/

    function updateCampaignStatus(uint256 campaignId, CampaignStatus newStatus) external onlyOwner {
        require(campaignId < campaigns.length, "Invalid campaign");
        campaigns[campaignId].status = newStatus;
        emit CampaignStatusUpdated(campaignId, newStatus);
    }

    /*────────────────── UTILITY FUNCTIONS ──────────────────*/

    function getCampaignDeadline(uint256 campaignId) external view returns (uint256) {
        require(campaignId < campaigns.length, "Invalid campaign");
        return campaigns[campaignId].deadline;
    }

    function getCampaignCreator(uint256 campaignId) external view returns (address) {
        require(campaignId < campaigns.length, "Invalid campaign");
        return campaigns[campaignId].creator;
    }

    function getCampaignMetadata(uint256 campaignId) external view returns (string memory) {
        require(campaignId < campaigns.length, "Invalid campaign");
        return campaigns[campaignId].metadata;
    }

    function isCampaignActive(uint256 campaignId) external view returns (bool) {
        require(campaignId < campaigns.length, "Invalid campaign");
        return campaigns[campaignId].status == CampaignStatus.Active && 
               block.timestamp <= campaigns[campaignId].deadline;
    }

    function hasCampaignEnded(uint256 campaignId) external view returns (bool) {
        require(campaignId < campaigns.length, "Invalid campaign");
        return block.timestamp > campaigns[campaignId].deadline;
    }
}