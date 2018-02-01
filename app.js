const path = require('path');
const app = require('express')();
const B = require('node-binance-api');
const Models = require(path.join(__dirname, 'db')).Models;
const Op = require(path.join(__dirname, 'db')).Op;
const socket = require('socket.io-client')('http://localhost:3001');
const moment = require('moment-timezone');
const chalk = require('chalk');
module.exports = app;

socket.on('getPrices', (payload)=>{
	B.prices( (err, tickers)=>{
		Object.keys(tickers).forEach( (ticker)=>{
			if(ticker){
				Models.Symbol.findOrCreate({where: {symbol: ticker}}).catch( ()=>{/**/});
				Models.Price.create({
					symbol: ticker,
					price:  tickers[ticker]
				});
			}
		});
	});
});

socket.on('analyzePrices', ()=>{
	analyzePrices().then( (analyzedPrices)=>{
		console.log(chalk.red('analyzedprices'), analyzedPrices);
	});
});


app.get('/', (req, res, next)=>{
	res.send('200');
});

function getSymbols(){
	return new Promise( (resolve, reject)=>{
		Models.Symbol.findAll({attributes: ['symbol']}).then( (symbols)=>{
			this.symbols = [];
			symbols.forEach( symbol =>{
				this.symbols.push(symbol.symbol);
			});
			resolve(this.symbols);
			reject('no symbols');
		});
	});
};
/*
getSymbols().then( (symbols)=>{
	symbols.forEach( symbol => {
		console.log(symbol);
	})
});
*/

function analyzePrices(){
	this.now = new Date();
	this.when = moment(this.now).subtract('10', 'minutes').format();
	return new Promise( (resolve, reject)=> {
		getSymbols().then( symbols =>{
			this.promises = [];
			symbols.forEach( symbol => {
				this.promises.push(Models.Price.findAll({
					where: {
						symbol: symbol,
						createdAt: {
							[Op.gt]: this.when
						}
					},
					order: [['id', 'DESC']],
					limit: 500
				}));
			});
			return Promise.all(this.promises).then( (data)=>{
				if(data)
					return data;
			});
		});
	});
};