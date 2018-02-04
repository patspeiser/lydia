const path = require('path');
const app = require('express')();
const B = require('node-binance-api');
const Models = require(path.join(__dirname, 'db')).Models;
const Op = require(path.join(__dirname, 'db')).Op;
const socket = require('socket.io-client')('http://localhost:3001');
const moment = require('moment-timezone');
const chalk = require('chalk');
const conf = require(path.join(__dirname, 'conf')).conf;
const loki = require('lokijs');
const L = new loki('lydia.json');
const recs = L.addCollection('recs');
B.options(conf);
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
			};
		});
	});
});

socket.on('analyzePrices', (payload)=>{
	analyzePrices(payload);
});
socket.on('analyzeSymbols', (payload)=>{
	getSymbols().then( symbols =>{
		//console.log(symbols);
	});
});
socket.on('determine', ()=>{
	whenDidILastTrade().then( (lastTradeTime)=>{
		determineTransaction(lastTradeTime);
	}, (rejection)=>{
		console.log('no last trade time', rejection);
		//console.log(rejection);
	});
	//when did I last trade?
		//if time since is greater than minimum hold time
			//if i don't own btc usd or eth 
				//if its passed definite sell back time
					//market sell back
				// else 
					//market sell back if certain criteria met
			//else if i do own btc usd or eth
				//market buy if cretai criteria met

});

function shwa(){

}
function whenDidILastTrade(){
	return new Promise( (resolve, reject) => {
		Models.Transaction.findAll({
			order: [['id', 'DESC']],
			limit: 1
		}).then((rows)=>{
			if(rows && rows.time){
				resolve(rows[0].time);
			} else {
				resolve({});
			}
		}, (err)=>{
			reject(err);
		});
	});
};

function determineTransaction(time){
	this.recs = recs.find();
	this.recData = formatifier(this.recs, 'highestGainSymbol');
	this.totalPoints = 0;
	Object.keys(this.recData).forEach( record =>{
		this.totalPoints += this.recData[record].length; 
	});
	Object.keys(this.recData).forEach( record => {
		console.log(record, Math.floor( (this.recData[record].length / this.totalPoints) * 100 ) );
	});
};

function transact(){
	if(rec.symbol){
		console.log(rec);
		this.baseCurrency = getBaseCurrency(rec.symbol);
		this.quoteCurrency = getQuoteCurrency(rec.symbol);
		getAccounts().then(accounts =>{
			this.myBase = accounts[this.baseCurrency].available;
			this.myQuote = accounts[this.quoteCurrency].available;
			if(this.myBase > this.myQuote){
				this.action = 'buy';
				if(this.myBase > .01){
					console.log('BUYING base', this.myBase, 'quote', this.myQuote);
					this.amount = this.myBase / rec.mostRecentPrice;
					//B.marketBuy(rec.symbol, this.amount);
				}
			};
			if(this.myBase < this.myQuote){
				this.action = 'sell';
				if(this.myQuote > .01){
					this.amount = this.myQuote;
					console.log('SELLING base', this.myBase, 'quote', this.myQuote);
					//B.marketSell(rec.symbol, this.amount);
				}
			}
		});
	};
}

function getAccounts(){
	return new Promise( (resolve, reject)=>{
		B.balance( (error, balances) =>{
			if (error){ return reject(error);};
			return resolve(balances);
		});
	});
};

function getBaseCurrency(symbol){
	//lol fuck
	if(symbol){
		return symbol.slice(-3);
	}
}

function getQuoteCurrency(symbol){
	//doublefux!
	if(symbol){
		this.base = getBaseCurrency(symbol);
		this.quoteCurrency = symbol.substring(0, symbol.indexOf(this.base));
		return this.quoteCurrency;
	};
}
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

function createRecommendation(rows){
	console.log(chalk.gray('creating recommendations'));
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
	});
	if(this.stats.highestGainSymbol){
		recs.insert(this.stats);
	};
};

function analyzePrices(conf){
	this.now = new Date();
	this.when = moment(this.now).subtract(conf.amount, conf.interval).format();
	Models.Price.findAll({ where: {createdAt: {[Op.gt]: this.when}}}).then(rs=>{
		this.prices = formatifier(rs, 'symbol');
		this.dataSets = [];
		Object.keys(this.prices).forEach(price=>{
			this.dataSets.push(getDataSetInfo(this.prices[price]));
		});
		analyzeBuy(this.dataSets);
		createRecommendation(this.dataSets);	
	});
};

function analyzeBuy(dataSets){
	this.dataSets = dataSets;
	this.best = {};
	this.dataSets.forEach( (set, index) =>{
		if(set){
			if(set.slope > 0){
				if(!this.best.gainOrLoss){
					this.best = set;
				} else {
					if (this.best.gainOrLoss < set.gainOrLoss){
						this.best = set;
					};
				}
			}
		};
	});
	return this.best;
}

function formatifier(arrOfObjs, sortByKey){
	this.formatted = {};
	arrOfObjs.forEach(obj=>{
		if(this.formatted[obj[sortByKey]]){
			this.formatted[obj[sortByKey]].push(obj);
		} else {
			this.formatted[obj[sortByKey]] = [obj];
		};
	});
	return this.formatted;
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
