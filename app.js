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
		console.log(chalk.red('analyzedprices'));
		this.dataSets = [];
		analyzedPrices.forEach( (price) =>{ 
			this.dataSets.push( getDataSetInfo(price) );
		});
		//socket.emit('freshDataSets', {analyzedPriceList: this.dataSets});
		createRecommendation(this.dataSets);
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

function createRecommendation(rows){
	//console.log(chalk.gray('creating recommendations'));
	this.stats = {
		highestGain : 0,
		highestLoss : 0
	}
	rows.forEach( (row)=>{
		this.dataSet = row;
		if (this.dataSet.slope > 0){
			if(this.dataSet.gainOrLoss > this.stats.highestGain){
				this.stats.highestGain = this.dataSet.gainOrLoss;
				this.stats['highestGainSymbol'] = this.dataSet.symbol;
				this.stats['highestGainMostRecentPrice'] = this.dataSet.mostRecentPrice;
				this.stats['highestGainAveragePrice'] = this.dataSet.averagePrice;
			};
		};
		if (this.dataSet.slope < 0){
			if(this.dataSet.gainOrLoss > this.stats.highestLoss){
				this.stats.highestLoss = this.dataSet.gainOrLoss;
				this.stats['highestLossSymbol'] = this.dataSet.symbol;
				this.stats['highestLossMostRecentPrice'] = this.dataSet.mostRecentPrice;
				this.stats['highestLossAveragePrice'] = this.dataSet.averagePrice;
			}	
		};
	});
	console.log(this.stats);
	Models.Rec.create({
		highest_gain: this.stats.highestGain,
		highest_loss: this.stats.highestLoss,
		highest_gain_symbol: this.stats.highestGainSymbol,
		highest_gain_most_recent_price: this.stats.highestGainMostRecentPrice,
		highest_gain_average_price: this.stats.highestGainAveragePrice,
		highest_loss_symbol: this.stats.highestLossSymbol,
		highest_loss_most_recent_price: this.stats.highestLossMostRecentPrice,
		highst_loss_average_price:  this.stats.highestLostAveragePrice
	});
	//determineTransaction(this.stats);
};

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
					resolve(data);
				reject('analyzePrices rejection. should make this useful');
			});
		});
	});
};

function getDataSetInfo(dataSet){
	this.symbol = dataSet[0].symbol;
	if(dataSet.length > 0){
		this.start = Math.floor(dataSet.length / 10);
		this.end   = Math.floor(9 * dataSet.length / 10);
		this.mostRecentPrice = dataSet[dataSet.length-1].price;
		function createPoint(point, type){
			this.yTotal = 0;
			this.totalPoints = 0;
			this.product_id = dataSet[0].product_id;
			if(type === 'first'){
				for(let i=0; i<=point; i++){
					this.yTotal+=dataSet[i].price;
					this.totalPoints+=1;
				}
			}
			if(type === 'second'){
				for(let i=point; i<=dataSet.length-1; i++){
					this.yTotal+=dataSet[i].price;
					this.totalPoints+=1;
				}
			}
			this.y = this.yTotal / this.totalPoints;
			return [point, this.y];
		};
		function calculateSlope(first, second){
			this.num = second[1] - first[1];
			this.denom = second[0] - first[0];
			this.slope = this.num / this.denom;
			return this.slope;
		};
		function getAveragePrice(first, second){
			this.averagePrice = (this.first[1] + this.second[1]) / 2
			return this.averagePrice; 
		}
		function getNormalizedSlope(slope, average){
			return slope / average;
		}
		function getGainOrLoss(first, second){
			this.result = Math.abs( 1 - (this.second[1] / this.first[1]) ) * 100;
			return this.result;
		}
		this.first  = createPoint(this.start, 'first');
		this.second = createPoint(this.end, 'second');
		this.slope = calculateSlope(this.first, this.second);
		this.gainOrLoss = getGainOrLoss(this.first, this.second);
		this.averagePrice = getAveragePrice(this.first, this.second); 
		this.normalizedSlope = getNormalizedSlope(this.slope, this.averagePrice);
		this.data = {
			symbol:             this.symbol,
			first: 				this.first,
			second: 			this.second,
			slope: 				this.slope,
			averagePrice:   	this.averagePrice,   
			normalizedSlope:  	this.normalizedSlope,
			gainOrLoss:         this.gainOrLoss,
			mostRecentPrice: 	this.mostRecentPrice
		};

	};
	return this.data;
};
