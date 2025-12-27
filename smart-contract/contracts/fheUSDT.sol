// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {FHE, externalEuint64, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";

/**
 * @title fheUSDT
 * @notice A confidential USDT-like token built on ERC7984 standard
 * @dev Testnet token - anyone can mint for testing purposes
 */
contract fheUSDT is ZamaEthereumConfig, ERC7984, Ownable2Step {
    constructor(
        address owner
    ) ERC7984("Confidential USDT", "fheUSDT", "https://fhunda.vercel.app/token") Ownable(owner) {}

    /**
     * @dev Mint tokens with visible amount (anyone can mint on testnet)
     * @param to Recipient address
     * @param amount Clear amount to mint
     */
    function mint(address to, uint64 amount) external {
        euint64 encryptedAmount = FHE.asEuint64(amount);
        _mint(to, encryptedAmount);
    }

    /**
     * @dev Confidential mint with encrypted amount (anyone can mint on testnet)
     * @param to Recipient address
     * @param encryptedAmount Encrypted amount to mint
     * @param inputProof Proof for the encrypted amount
     */
    function confidentialMint(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (euint64 transferred) {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        return _mint(to, amount);
    }
}
