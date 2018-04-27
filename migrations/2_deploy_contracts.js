var Remittance = artifacts.require("./Remittance.sol");

module.exports = (deployer, network, accounts) => {
  // console.log(`Network: ${network}`)
  // console.log(`Accounts: ${accounts}`)
  const puzzle = web3.sha3('hello1', 'hello2')
  deployer.deploy(Remittance, puzzle, accounts[1], 10, {value: web3.toWei(4, 'ether')});
};
