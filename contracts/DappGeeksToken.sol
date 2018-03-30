pragma solidity ^0.4.18;

contract DappGeeksToken {
    string public name = "DappGeeks Token";//token名称
    string public symbol = "DGT";//token 符号
    string public describe = "DappGeeks Token 合同 V1.0";
    uint256 public totalSupply;//发行总量
    //uint8 public constant decimals = 18;  //token的最小单位，即，小数点后几位数,一般为18。 这里就不分那么小了
    //uint256 private constant TOKEN_UNIT = 10 ** uint256(decimals);
    //uint256 private constant INITIAL_SUPPLY = (10 ** 9) * TOKEN_UNIT;

    address public publisher;//发行者地址
    address public saleContract;//销售代币的合约地址


    //转账事件
    event Transfer(
        address indexed _from,//indexed用来设置是否被索引。设置为索引后，可以允许通过这个参数来查找日志，甚至可以按特定的值过滤。
        address indexed _to,
        uint256 _value
    );

    //账户所有者允许转账到某个账号的配额
    event Approval(
        address indexed _owner,
        address indexed _spander,
        uint _value
    );

    //销售合同初始化完毕
    event InitSaleContract();


    //只许token发布者调用
    modifier onlyPublisher() {
        require(msg.sender == publisher);
        _;
    }

    //只许销售合约调用
    modifier onlySaleContract() {
        require(saleContract != 0);
        require(msg.sender == saleContract);
        _;
    }

    //记录账户持有token的数量
    mapping(address => uint256) public balanceOf;
    //账户所有者允许转移到另一个账号token数量的配额，allowance[转移的源账户][转移的目标账户]
    mapping(address => mapping(address => uint256)) public allowance;

    //合约构造函数
    function DappGeeksToken(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        publisher = msg.sender;
        totalSupply = _initialSupply;
    }

    //初始化销售合约地址
    function initSaleContract(address _saleContract) public onlyPublisher {
        require(_saleContract != 0);
        saleContract = _saleContract;
        InitSaleContract();
    }

    //转账函数(账户之间直接转账)
    function transfer(address _to,uint _value) public returns (bool success){
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        Transfer(msg.sender, _to, _value);

        return true;
    }

    //直接设置转账
    function transferFrom(address _from, address _to, uint256 _value) public onlyPublisher returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][_to]);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][_to] -= _value;

        Transfer(_from, _to, _value);

        return true;
    }

    //设置转账配额
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    //获取配额
    function allowance(address _from, address _to) public constant returns (uint256) {
        return allowance[_from][_to];
    }

    //获取发行总量
    function totalSupply() public view returns (uint256) {
        return totalSupply;
    }

    //获取某个账号持有token的数量
    function balanceOf(address _owner) public view onlyPublisher returns (uint256 balance) {
        return balanceOf[_owner];
    }

    //获取当前账号的token数量
    function mybalance() public view returns (uint256 balance) {
        return balanceOf[msg.sender];
    }


    //获取可供销售的token数量
    function balanceOfForSale() public view returns (uint256 balance) {
        return balanceOf[publisher];
    }

    //获取销售合同的地址
    function saleContract() public view returns (address) {
        return saleContract;
    }

    //销售合约向用户发放代币
    function sell(address _to,uint256 _value) onlySaleContract external returns(bool) {
        require(_value <= balanceOf[publisher]);
        balanceOf[publisher] -= _value;
        balanceOf[_to] += _value;
        return true;
    }

    //消耗token
    function consume(uint32 _consumerUid, uint32 _value) onlySaleContract external returns (bool success) {
        require(balanceOf[_consumerUid] >= _value);
        balanceOf[_consumerUid] -= _value;
        balanceOf[this] += _value;
        return true;
    }





}

