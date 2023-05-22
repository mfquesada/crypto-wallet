const express = require('express');
const { createAccount, getBalance, withdraw } = require('./ethereumController');
const { checkSymbol } = require('./ethereumControllerMiddlewares');

const router = express.Router();

router.post('/api/v1/account', createAccount);
router.get('/api/v1/account/balance/:symbol', checkSymbol, getBalance);
router.post('/api/v1/account/withdraw', withdraw);

module.exports = router;
