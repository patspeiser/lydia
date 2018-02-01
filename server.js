const path = require('path');
const app = require(path.join(__dirname, 'app'));
const server = require('http').Server(app);
const db = require(path.join(__dirname, 'db')).db;
const io = require('socket.io')(server);
const chalk = require('chalk');
var SYNC = process.env.SYNC || false;
var PORT = process.env.PORT || 3001;

db.sync({force: true}).then( ()=>{
    io.on('connection', (socket)=>{
        setInterval( ()=>{
            socket.emit('getPrices');
        }, 1000)
    });
    server.listen(PORT, ()=>{
        console.log('binance up ...', PORT);
    });
});
