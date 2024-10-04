const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x881d6832184210600FF2F6575946a2b9EDbB57D3";
  const initialMerkleRoot = "0x1987aadc3d7a1d925ebc574e295a966730bb01b1bbc0f03877b70a8bb06cb478";

  const MerkleAirdrop = await hre.ethers.getContractFactory("MerkleAirdrop");

  console.log("Deploying MerkleAirdrop...");
  const merkleAirdrop = await MerkleAirdrop.deploy(tokenAddress, initialMerkleRoot);

  await merkleAirdrop.waitForDeployment();

  const merkleAirdropAddress = await merkleAirdrop.getAddress();

  console.log("MerkleAirdrop deployed to:", merkleAirdropAddress);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await merkleAirdrop.deploymentTransaction().wait(5);
    
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: merkleAirdropAddress,
      constructorArguments: [tokenAddress, initialMerkleRoot],
    });
  }
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });