pragma solidity ^0.4.18;

import "./DappGeeksToken.sol";

contract DappGeeksTokenSale {
    address public publisher;//发行者地址
    DappGeeksToken public tokenContract;//token合约地址
    string public describe = "DappGeeks Token 销售合同 V1.0";
    uint256   public tokenPrice; // in wei
    uint256   public tokensSold;//已售

    //销售成功事件
    event Sell(
        address _buyer,
        uint256 _amount
    );

    //构造函数
    function DappGeeksTokenSale(DappGeeksToken _tokenContract,uint256 _tokenPrice) public{
        publisher = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    //乘法运算
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    //购买token函数
    function buyTokens(uint256 _numberOfTokens) public payable{
        //发行者不能购买token
        require(msg.sender != publisher);
        //验证 msg.value 等于购买token数量*每个token的价格
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        //验证token已转入卖家的账户
        require(tokenContract.sell(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;
        //以太坊转入发行者的账户
        publisher.transfer(msg.value);
        Sell(msg.sender, _numberOfTokens);
    }

    function saleInfo() view public returns(uint256 _tokenPrice,uint256 _tokensSold,uint256 totalForSale) {
        totalForSale = tokenContract.balanceOfForSale();
        return (tokenPrice,tokensSold,totalForSale);
    }

}