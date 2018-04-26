var Remittance = artifacts.require("./Remittance.sol");

module.exports = (deployer, network, accounts) => {
  // console.log(`Network: ${network}`)
  // console.log(`Accounts: ${accounts}`)
  deployer.deploy(Remittance, 'hello1', 'hello2', accounts[1], 10, {value: web3.toWei(4, 'ether')});
};
