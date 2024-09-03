# Merkle Tree-Based Airdrop

This repository contains the implementation of a smart contract that implements an airdrop using a Merkle tree for whitelisting eligible addresses. The project includes a Solidity smart contract (`MerkleAirdrop.sol`), a script (`merkle.js`) to generate the Merkle tree and root and test cases to make sure the airdrop process works correctly.

## Table of Contents

- [Setup and Prerequisites](#setup-and-prerequisites)
- [Running the Merkle.js Script](#running-the-merklejs-script)
- [Generating Proofs for Claiming Airdrop](#generating-proofs-for-claiming-airdrop)
- [Assumptions and Limitations](#assumptions-and-limitations)
- [Unit Testing](#unit-testing)

## Setup and Prerequisites

Before you start, ensure you have the following installed:

- Node.js
- npm (Node package manager)
- Hardhat (for smart contract development and testing)

To set up the project:

1. Clone the repository:
   ```bash
   git clone https://github.com/DonGuillotine/airdrop-merkle-tree.git
   cd airdrop-merkle-tree
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Initialize Hardhat (if not already initialized):
   ```bash
   npx hardhat init
   ```

## Running the Merkle.js Script

The `merkle.js` script generates a Merkle tree from a CSV file containing the addresses and corresponding airdrop amounts. The script outputs the Merkle root and a JSON representation of the tree.

### Steps to Run the Script:

1. Ensure your CSV file (`airdrop.csv`) is located in the `data` directory and follows this format:

   ```csv
    address,amount
    0xafcdc974c204897829538151666ab75bb5b001cf,71
    0x3ffe6dbd96fcfd60279e301364e1f83c2e62a019,88
    0x423f2d67c1d03c7e8cbbf20013586215ab88b25c,68
    0x6bfd5617b3b71d69d7a50ba730cceed0eec28ce0,34
    0xade56f21826aa8877ef1ed056ded9b35cb583b2b,83
   ```

2. Run the script from the root directory:
   ```bash
   node data/merkle.js
   ```

3. The script will output the Merkle root and save the proofs to a JSON file:
   - `proofs.json`: 

These files are saved in the `data` directory.

## Generating Proofs for Claiming Airdrop

To claim the airdrop, users need to provide a valid Merkle proof. Here's how to generate it:

1. Use the `merkletreejs` library in a Node.js script to generate proofs for specific addresses:

2. The generated proof can be used in the `claim` function of the `MerkleAirdrop` contract.

## Assumptions and Limitations

- Each address can only claim their tokens once. It is enforced by a mapping (`hasClaimed`) in the contract.
- The contract assumes that sufficient ERC20 tokens are transferred to it before the airdrop begins.
- The script assumes a reasonable number of addresses to avoid exceeding block gas limits when verifying Merkle proofs. For very large airdrops, I will break the process into multiple trees or I will use a more gas-efficient method.
- The CSV file should be well-formatted, with no extraneous whitespace or special characters in addresses and amounts.

## Unit Testing
![image](https://github.com/user-attachments/assets/9e171a2f-968b-49d1-8e6d-47ddfb842795)

All Test Cases passed successfully


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

For any questions or issues, feel free to open an issue.
