App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('DappGeeksToken.json', function(data) {
      //获取合约实例
      App.contracts.DappGeeksToken = TruffleContract(data);
      App.contracts.DappGeeksToken.setProvider(App.web3Provider);
      App.contracts.DappGeeksToken.deployed().then(function(dappGeeksToken) {
        console.log("dappGeeksToken Address:", dappGeeksToken.address);
        App.contracts.DappGeeksToken = dappGeeksToken;
      });
      
    }).done(function() {
      $.getJSON("DappGeeksTokenSale.json", function(data) {
          App.contracts.DappGeeksTokenSale = TruffleContract(data);
          App.contracts.DappGeeksTokenSale.setProvider(App.web3Provider);
          App.contracts.DappGeeksTokenSale.deployed().then(function(dappGeeksTokenSale) {

            console.log("dappGeeksTokenSale Address:", dappGeeksTokenSale.address);
            App.contracts.DappGeeksTokenSale = dappGeeksTokenSale;

            App.initSaleContract();

            //获取合约发行者的地址
            dappGeeksTokenSale.publisher.call().then(addr => {
                  console.log(addr)
                  if(addr == web3.eth.accounts[0]){
                      App.isPublisher = true;
                  }else{
                    App.isPublisher = false;
                  }
              })

              App.getBalances();
              App.listenForEvents();
              App.render();

        });
       
       
      });
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    // $(document).on('click', '#transferButton', App.handleTransfer);
  },

  initWebSite : function(){
    //为token设置销售合约地址
    if(App.contracts.DappGeeksToken != undefined && App.contracts.DappGeeksTokenSale != undefined){
      App.contracts.DappGeeksToken.initSaleContract(App.contracts.DappGeeksTokenSale.address);
    }
     

  },

  //判断token合约中是否已经初始化销售合约
  initSaleContract : function(){
    
    var a = App.contracts.DappGeeksToken.saleContract.call().then(addr =>{
      console.log(addr)
      if(typeof addr == "string"){
        saleContractAddress = parseInt(addr,16);
        if(saleContractAddress == 0){
          $("#initDiv").show();
        }else{
          $("#initDiv").hide();
          $("#indexDiv").hide();
          $(".nav>li").show();
          $("#tokenSaleDivLi>a").trigger("click");
        }
      }
    })
    // console.log(a)
  },

  



  getBalances: function() {
    console.log('Getting balances...');

    var tutorialTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DappGeeksToken.mybalance().then(balance => {
        $('#TTBalance').text(balance);
      })


    });
  },


  // Listen for events emitted from the contract
  listenForEvents: function() {

    App.contracts.DappGeeksToken.InitSaleContract({},{
      // fromBlock: 0,
      toBlock: 'latest'
    }).watch(function(error, event) {
      console.log("event triggered", event);
      if (!error) {
          prompt("合约初始化成功");
          $("#initDiv").hide();
          $("#indexDiv").hide();
          $(".nav>li").show();
          $("#tokenSaleDivLi>a").trigger("click");
      }
    });

    



    App.contracts.DappGeeksTokenSale.Sell({}, {
      // fromBlock: 0,
      toBlock: 'latest'
    }).watch(function(error, event) {
      console.log("event triggered", event);
      if(!error && event.args._buyer == App.account){
        prompt("购买成功Token,数量："+ event.args._amount.toNumber());
        App.render();
        App.getBalances();
      }
      
    });
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#tokenContractAddress').html("Token合约地址: " + App.contracts.DappGeeksToken.address);
        $('#accountAddress').html("你的以太坊钱包地址: " + account);
      }
    })



    App.contracts.DappGeeksTokenSale.saleInfo().then((result) => {
      console.log(result)
      App.tokenPrice = result[0];
      App.tokensSold = result[1].toNumber();
      App.totalForSale = result[2].toNumber();
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());

      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.totalForSale);

      var progressPercent = (Math.ceil(App.tokensSold) / App.totalForSale) * 100;
      $('#progress').css('width', progressPercent + '%');

      App.loading = false;
        loader.hide();
        content.show();

    })
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    
    var numberOfTokens = $('#numberOfTokens').val();

    App.contracts.DappGeeksTokenSale.buyTokens(numberOfTokens,{
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
      // $('#content').show();
      // $('#loader').hide();
    });






  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
