const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { randomBytes } = require('crypto');

describe("MerkleAirdrop", function () {
    let MerkleAirdrop, merkleAirdrop, TestToken, token, owner, addr1, addr2;
    let merkleTree, merkleRoot;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
    
        console.log("Deploying TestToken...");
        TestToken = await ethers.getContractFactory("TestToken");
        token = await TestToken.deploy("Test Token", "TST");
        await token.waitForDeployment();
        console.log("TestToken deployed at:", await token.getAddress());
    
        console.log("Minting tokens...");
        await token.mint(owner.address, ethers.parseEther("1000000"));
    
        console.log("Creating Merkle tree...");
        const leaves = [
          { address: addr1.address, amount: ethers.parseEther("100") },
          { address: addr2.address, amount: ethers.parseEther("200") },
        ].map((x) =>
          ethers.solidityPackedKeccak256(
            ['address', 'uint256'],
            [x.address, x.amount]
          )
        );
    
        merkleTree = new MerkleTree(leaves, keccak256, { sort: true });
        merkleRoot = merkleTree.getHexRoot();
    
        console.log("Deploying MerkleAirdrop...");
        MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
        merkleAirdrop = await MerkleAirdrop.deploy(await token.getAddress(), merkleRoot);
        await merkleAirdrop.waitForDeployment();
        console.log("MerkleAirdrop deployed at:", await merkleAirdrop.getAddress());
    
        console.log("Transferring tokens to MerkleAirdrop...");
        await token.transfer(await merkleAirdrop.getAddress(), ethers.parseEther("1000"));
    
        console.log("Setup complete");
    });

    it("Should allow valid claims", async function () {
        const leaf = ethers.solidityPackedKeccak256(
            ['address', 'uint256'],
            [addr1.address, ethers.parseEther("100")]
        );
        const proof = merkleTree.getHexProof(leaf);

        await expect(merkleAirdrop.connect(addr1).claim(ethers.parseEther("100"), proof))
          .to.emit(merkleAirdrop, "AirdropClaimed")
          .withArgs(addr1.address, ethers.parseEther("100"));

        expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should not allow double claims", async function () {
        const leaf = ethers.solidityPackedKeccak256(
            ['address', 'uint256'],
            [addr1.address, ethers.parseEther("100")]
        );
        const proof = merkleTree.getHexProof(leaf);

        await merkleAirdrop.connect(addr1).claim(ethers.parseEther("100"), proof);

        await expect(
          merkleAirdrop.connect(addr1).claim(ethers.parseEther("100"), proof)
        ).to.be.revertedWith("Address has already claimed");
    });

    it("Should not allow claims with invalid proofs", async function () {
        const leaf = ethers.solidityPackedKeccak256(
            ['address', 'uint256'],
            [addr1.address, ethers.parseEther("100")]
        );
        const proof = merkleTree.getHexProof(leaf);

        await expect(
          merkleAirdrop.connect(addr2).claim(ethers.parseEther("100"), proof)
        ).to.be.revertedWith("Invalid merkle proof");
    });

    it("Should allow owner to update Merkle root", async function () {
        const newMerkleRoot = randomBytes(32);

        await expect(merkleAirdrop.updateMerkleRoot(newMerkleRoot))
          .to.emit(merkleAirdrop, "MerkleRootUpdated")
          .withArgs(newMerkleRoot);

        expect(await merkleAirdrop.merkleRoot()).to.equal(ethers.hexlify(newMerkleRoot));
    });

    it("Should allow owner to withdraw remaining tokens", async function () {
        await merkleAirdrop.withdrawRemainingTokens(owner.address);
        expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
    });
});