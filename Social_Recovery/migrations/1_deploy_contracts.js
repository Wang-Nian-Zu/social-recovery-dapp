const SocialRecoveryWallet = artifacts.require("SocialRecoveryWallet.sol");

module.exports = async function(deployer) {
  const threshold = 2;
  const initialGuardians = ["0x1528Bfaa915Bc3dda03d9F68Ae9b4346eAEa9319",
                            "0x3224BbBcE55f59B640087aB77E43Ed63EfDf9db8",
                            "0x89FDd9BaF1AA1a2746a3bA1edfFA5d575CBEe767"];
  await deployer.deploy(SocialRecoveryWallet, threshold, initialGuardians);
  
  const contractInstance = await SocialRecoveryWallet.deployed();

  console.log(`Deployed the contract to ${contractInstance.address}`);
  console.log(`Set the threshold of the guardian recovery to ${threshold}`);
};