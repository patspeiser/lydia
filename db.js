const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const urlString = "postgres://postgres:postgres@localhost/lydia";
const db = new Sequelize(process.env.DATABASE_URL || urlString, {logging: false});

const Product = db.define('product', ()=>{
	//
});
//{e:eventType, E:eventTime, s:symbol, p:price, q:quantity, m:maker, a:tradeId}
const Trade   = db.define('trade', {
	e: {type: db.Sequelize.STRING}, //event type
	E: {type: db.Sequelize.INTEGER}, //event time
	s: {type: db.Sequelize.STRING},  //symbol BNBBTC
	a: {type: db.Sequelize.INTEGER},  //trade id 
	p: {type: db.Sequelize.FLOAT},   //price 
	q: {type: db.Sequelize.FLOAT},   //quantity
	f: {type: db.Sequelize.INTEGER},
	l: {type: db.Sequelize.INTEGER},
	T: {type: db.Sequelize.INTEGER},
	m: {type: db.Sequelize.BOOLEAN},  
	M: {type: db.Sequelize.BOOLEAN}, 
});

const Rec = db.define('rec', {
	highest_gain: 					{type: db.Sequelize.FLOAT},
	highest_loss: 					{type: db.Sequelize.FLOAT},
	highest_gain_symbol: 			{type: db.Sequelize.STRING},
	highest_gain_most_recent_price: {type: db.Sequelize.FLOAT},
	highest_gain_average_price: 	{type: db.Sequelize.FLOAT},
	highest_loss_symbol:  	 		{type: db.Sequelize.STRING}, 
	highest_loss_most_recent_price: {type: db.Sequelize.FLOAT},
	highest_loss_average_price: 	{type: db.Sequelize.FLOAT},
})

const Symbol = db.define('symbol', {
	symbol: {type: Sequelize.STRING}
});

const Price = db.define('price', {
	symbol: {type: Sequelize.STRING},
	price:  {type: Sequelize.FLOAT}
});

module.exports = {
	db: db,
	Op: Op,
	Models: {
		Trade: Trade,
		Symbol: Symbol,
		Price: Price,
		Rec: Rec
	}
};