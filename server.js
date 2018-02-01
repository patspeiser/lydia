const path = require('path');
const app = require(path.join(__dirname, 'app'));
const server = require('http').Server(app);
const io = require('socket.io')(server);
//const config = require(path.join(__dirname, 'config')).config;
//const db = require(path.join(__dirname, 'db')).db;
const chalk = require('chalk');

var SYNC = process.env.SYNC || false;
var PORT = process.env.PORT || 3001;

server.listen(PORT, ()=>{
    console.log('binance up ...', PORT);
});
