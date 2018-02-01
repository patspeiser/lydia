const path = require('path');
const app = require(path.join(__dirname, 'app'));
const server = require('http').Server(app);
const db = require(path.join(__dirname, 'db')).db;
const io = require('socket.io')(server);
const chalk = require('chalk');
var SYNC = process.env.SYNC || false;
var PORT = process.env.PORT || 3001;

db.sync({force: false}).then( ()=>{
    io.on('connection', (socket)=>{
        setInterval( ()=>{
            console.log(chalk.gray('getPrices'));
            socket.emit('getPrices');
        }, 5000);
        setInterval( ()=>{
            console.log(chalk.gray('analyzePrices'));
            socket.emit('analyzePrices');
        }, 10000);
        socket.on('freshDataSets', (payload) =>{
            //console.log(payload);
        });
    });
    server.listen(PORT, ()=>{
        console.log('binance up ...', PORT);
    });
});
