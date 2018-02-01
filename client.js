const path = require('path');
const app = require('express')();
const socket = require('socket.io-client')('http://localhost:3001');

socket.on('yo', ()=>{
	console.log('yo', Date.now());
});