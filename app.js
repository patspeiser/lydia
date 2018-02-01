const path = require('path');
const app = require('express')();
const B = require('node-binance-api');
const Models = require(path.join(__dirname, 'db')).Models;
module.exports = app;

B.websockets.trades([], (trade) => {
	//console.log('#', trade);
});

//
app.get('/', (req, res, next)=>{
	res.send('200');
});