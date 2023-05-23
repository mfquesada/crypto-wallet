const express = require('express');
const { createAccount, balance, transfer, mint } = require('./ethereumController');
const { checkSymbol } = require('./ethereumControllerMiddlewares');

const router = express.Router();

router.post('/api/v1/account', createAccount);
router.get('/api/v1/account/balance/:symbol', checkSymbol, balance);
router.post('/api/v1/account/transfer', transfer);
router.post('/api/v1/account/mint', mint);

module.exports = router;
