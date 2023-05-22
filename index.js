const express = require('express');
const http = require('http');

const HTTP_PORT = 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = require('./api/controllers/router');
app.use(router);

http.createServer(app).listen(HTTP_PORT, () => {
    console.log(`listening at http://localhost:${HTTP_PORT}`);
});
