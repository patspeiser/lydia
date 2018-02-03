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
            console.log('sets', payload.length);
        });
/*
        socket.on('alerts', (alerts)=>{
            this.alerts = alerts; 
            if(this.alerts.data.length > 0){
                this.alerts.data.forEach( (alert)=>{
                    if(alert.product_id){
                        mem.all('SELECT * FROM notices WHERE product_id = ?', [alert.product_id], (err, rows)=>{
                            if(rows.length > 0){
                                mem.run('UPDATE notices SET alert = ?, time = ? where product_id = ?', [JSON.stringify(alert), Date.now(), alert.product_id], (err, row)=>{
                                    if (err) console.log(err);
                                });
                            };
                            if(rows.length === 0){
                            mem.run('INSERT INTO notices (product_id, alert, time) VALUES (?,?, ?)', [alert.product_id, JSON.stringify(alert), Date.now()], ()=>{/**
*/
    });
    server.listen(PORT, ()=>{
        console.log('binance up ...', PORT);
    });
});
