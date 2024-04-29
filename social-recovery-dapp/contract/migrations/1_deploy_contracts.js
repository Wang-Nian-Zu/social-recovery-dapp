const SocialRecoveryWallet = artifacts.require("SocialRecoveryWallet.sol");

module.exports = async function(deployer, network, accounts) {
  const threshold = 2;
  const initialGuardians = accounts.slice(0, 3); // 取得前三個帳戶
  //const initialGuardians = ["0xF5E1cEE5B139168309B5Ae8DA0DeBC693f855C15",
  //                          "0xA6950560e0FE69F85A320F9692b6C1CD51E3baE5",
  //                          "0xa6A091801DbfD56c9aa7C0a9676b950AC25d82eC"];
  await deployer.deploy(SocialRecoveryWallet, threshold, initialGuardians);
  
  const contractInstance = await SocialRecoveryWallet.deployed();

  console.log(`Deployed the contract to ${contractInstance.address}`);
  console.log(`Set the threshold of the guardian recovery to ${threshold}`);
};