const checkSymbol = async (req, res, next) => {
    try {
        const symbols = ['ETH', 'USDT', 'MTK'];
        if (symbols.includes(req.params.symbol)) {
            next();
        } else {
            throw new Error('Symbol not found');
        }
    } catch (e) {
        let _response = { 'statusCode': 400, 'data': {} };
        _response.data.message = e.message;
        console.log(_response);
        res.status(_response.statusCode).json(_response.data);
    }
};

module.exports = {
    checkSymbol,
};
