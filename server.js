const path = require('path');
const app = require(path.join(__dirname, 'app'));
const config = require(path.join(__dirname, 'conf')).config;
const server = require('http').Server(app);
const db = require(path.join(__dirname, 'db')).db;
const io = require('socket.io')(server);
const chalk = require('chalk');
var SYNC = process.env.SYNC || false;
var PORT = process.env.PORT || 3001;

db.sync({force: true, logging: true}).then( ()=>{
    io.on('connection', (socket)=>{
        setInterval( ()=>{
            console.log(chalk.gray('getPrices'));
            socket.emit('getPrices');
        }, 1000 * 30);
        setInterval( ()=>{
            console.log(chalk.gray('analyzeSymbols'));
            socket.emit('analyzeSymbols');
        }, 1000 * 20);
        setInterval( ()=>{
            console.log(chalk.gray('analyzePrices'));
            socket.emit('analyzePrices', {amount: 5, interval: 'minutes'});
            socket.emit('determine');
        }, 1000 * 10);
        socket.on('rec', (payload) =>{
            //longer than X amount of time - do a trade
            //socket.emit('determineTransaction', payload.rec);
        });
    });
    server.listen(PORT, ()=>{
        console.log('binance up ...', PORT);
    });
});
