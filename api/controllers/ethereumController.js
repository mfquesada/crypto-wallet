const Web3 = require('web3');
const web3 = new Web3('ws://127.0.0.1:7545');

const tetherTokenAbi = require('./USDT-ABI.json');
const tetherTokenAddress = "0x8d0489B6e7F18ecE170C30117BAD78cb19f9aa61";
const tetherTokenContract = new web3.eth.Contract(tetherTokenAbi, tetherTokenAddress);

const createAccount = async (req, res, next) => {
    let _response = { 'statusCode': 200, 'data': {} };
    try {
        let account = await web3.eth.accounts.create();
        _response.data.account = account;
    } catch (e) {
        _response.statusCode = 400;
        _response.data.message = e.message;
    }
    console.log(_response);
    res.status(_response.statusCode).json(_response.data);
};

const getBalance = async (req, res, next) => {
    let _response = { 'statusCode': 200, 'data': {} };
    try {
        let balance = 0;
        if (req.params.symbol === 'ETH') {
            balance = web3.utils.fromWei(await web3.eth.getBalance(req.query.address), 'ether');
        } else if (req.params.symbol === 'USDT') {
            balance = await tetherTokenContract.methods.balanceOf(req.query.address).call() / 1e6;
        }
        _response.data.balance = balance;
    } catch (e) {
        _response.statusCode = 400;
        _response.data.message = e.message;
    }
    console.log(_response);
    res.status(_response.statusCode).json(_response.data);
};

const withdraw = async (req, res, next) => {
    let _response = { 'statusCode': 200, 'data': {} };
    try {
        const txData = {
            'from': req.body.from
        };

        if (req.body.symbol === 'ETH') {
            txData.to = req.body.to;
            txData.value = web3.utils.toWei(req.body.value, 'ether');
        } else if (req.body.symbol === 'USDT') {
            txData.to = tetherTokenAddress;
            txData.data = await tetherTokenContract.methods.transfer(req.body.to, Number(req.body.value) * 1e6).encodeABI();
        }

        let _gasPrice = await web3.eth.getGasPrice();

        txData.chainId = await web3.eth.getChainId();
        txData.nonce = await web3.eth.getTransactionCount(req.body.from);
        txData.gasPrice = _gasPrice;
        txData.gasLimit = await web3.eth.estimateGas(txData);

        let txCost = web3.utils.fromWei((txData.gasLimit * Number(_gasPrice)).toString(), 'ether');

        const signedTransaction = await web3.eth.accounts.signTransaction(txData, req.body.privateKey);
        const transactionResponse = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

        _response.data.txData = txData;
        _response.data.txCost = txCost;
        _response.data.signedTransaction = signedTransaction;
        _response.data.transactionResponse = transactionResponse;
        _response.data.transactionCost = web3.utils.fromWei((transactionResponse.gasUsed * transactionResponse.effectiveGasPrice).toString(), 'ether');
    } catch (e) {
        _response.statusCode = 400;
        _response.data.message = e.message;
    }
    console.log(_response);
    res.status(_response.statusCode).json(_response.data);
};

module.exports = {
    createAccount,
    getBalance,
    withdraw,
};
