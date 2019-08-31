// import express from 'express';
// import path from 'path';
const express = require('express');
const path = require('path');
const Webhook = require('./fulfillment').Webhook;
const bodyParser = require('body-parser');

const app = express();


app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json({limit: '5mb'}));

var port = process.env.PORT || 8888;

app.listen(port, () => {
    console.log('\nApp is running at http://localhost:8888');
    console.log('Press CTRL-C to stop\n');
})

app.get('/', async (req, res) => {
    res.render('index');
});

app.post('/api/message', async (req, res) => {
    Webhook.handleRequest(req, res);
});