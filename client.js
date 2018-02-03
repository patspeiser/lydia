const path = require('path');
const app = require('express')();
const socket = require('socket.io-client')('http://localhost:3001');
const B = require('node-binance-api');
const Models = require(path.join(__dirname, 'db')).Models;

socket.on('getPrices', ()=>{
});