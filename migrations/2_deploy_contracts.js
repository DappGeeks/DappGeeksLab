var DappGeeksToken = artifacts.require("./DappGeeksToken.sol");
var DappGeeksTokenSale = artifacts.require("./DappGeeksTokenSale.sol");

module.exports = function(deployer) {
  // 部署token合约发行数量：1000000
  deployer.deploy(DappGeeksToken, 1000000).then(function() {
    // 每个token价格 0.001 Ether
    var tokenPrice = 1000000000000000; // in wei
    return deployer.deploy(DappGeeksTokenSale, DappGeeksToken.address, tokenPrice);
  });
};
