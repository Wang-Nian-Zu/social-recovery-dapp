const SocialRecoveryWallet = artifacts.require("SocialRecoveryWallet.sol");

module.exports = async function(deployer) {
  const threshold = 2;
  const initialGuardians = ["0xcCb65C19c5436dae911397c1F0B0a67cacD16Ee8",
                            "0x930FE059FABF17cF3276B153db15eB044C5A8628",
                            "0x077a2879Bd3631b87463Bd9Ad51f9638798d47cA"];
  await deployer.deploy(SocialRecoveryWallet, threshold, initialGuardians);
  
  const contractInstance = await SocialRecoveryWallet.deployed();

  console.log(`Deployed the contract to ${contractInstance.address}`);
  console.log(`Set the threshold of the guardian recovery to ${threshold}`);
};