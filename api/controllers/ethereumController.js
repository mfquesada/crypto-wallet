const Web3 = require('web3');
const web3 = new Web3('ws://127.0.0.1:7545');

const tetherTokenAbi = require('./USDT-ABI.json');
const tetherTokenAddress = "0xA24D9759dA52B647B0365F69B8f1B9E7C8C477a2";
const tetherTokenContract = new web3.eth.Contract(tetherTokenAbi, tetherTokenAddress);

const nftAbi = require('./NFT-ABI.json');
const nftAddress = "0xA74bf42D04E042c256463D14c949e5e6C8117a70";
const nftContract = new web3.eth.Contract(nftAbi, nftAddress);

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

const balance = async (req, res, next) => {
    let _response = { 'statusCode': 200, 'data': {} };
    try {
        let balance = 0;
        if (req.params.symbol === 'ETH') {
            balance = web3.utils.fromWei(await web3.eth.getBalance(req.query.address), 'ether');
        } else if (req.params.symbol === 'USDT') {
            balance = await tetherTokenContract.methods.balanceOf(req.query.address).call() / 1e6;
        } else if (req.params.symbol === 'MTK') {
            balance = await nftContract.methods.balanceOf(req.query.address).call();
        }
        _response.data.balance = balance;
    } catch (e) {
        _response.statusCode = 400;
        _response.data.message = e.message;
    }
    console.log(_response);
    res.status(_response.statusCode).json(_response.data);
};

const transfer = async (req, res, next) => {
    let _response = { 'statusCode': 200, 'data': {} };
    try {

        const txData = {};

        if (req.body.symbol === 'ETH') {
            txData.from = req.body.from;
            txData.to = req.body.data.to;
            txData.value = web3.utils.toWei(req.body.data.value, 'ether');
        } else {
            if (req.body.tokenType === 'ERC20') {
                if (req.body.symbol === 'USDT') {
                    txData.from = req.body.from;
                    txData.to = tetherTokenAddress;
                    txData.data = await tetherTokenContract.methods.transfer(req.body.data.to, Number(req.body.data.value) * 1e6).encodeABI();
                }
            } else if (req.body.tokenType === 'ERC721') {
                if (req.body.symbol === 'MTK') {
                    txData.from = req.body.from;
                    txData.to = nftAddress;
                    txData.data = await nftContract.methods.transferFrom(req.body.data.from, req.body.data.to, req.body.data.tokenId).encodeABI();
                }
            }
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

const mint = async (req, res, next) => {
    let _response = { 'statusCode': 200, 'data': {} };
    try {
        const txData = {
            'from': req.body.from,
            'to': nftAddress,
            'data': await nftContract.methods.safeMint(req.body.to, req.body.uri).encodeABI()
        };

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
    balance,
    transfer,
    mint
};
