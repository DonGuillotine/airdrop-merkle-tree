const hre = require("hardhat");

async function main() {
  const TestToken = await hre.ethers.getContractFactory("TestToken");

  const testToken = await TestToken.deploy("Test Token", "TST");

  await testToken.waitForDeployment();

  const testTokenAddress = await testToken.getAddress();

  console.log("TestToken deployed to:", testTokenAddress);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await testToken.deploymentTransaction().wait(5);
    
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: testTokenAddress,
      constructorArguments: ["Test Token", "TST"],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });