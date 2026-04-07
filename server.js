'use strict';

const express = require('express');

const app = express();
app.disable('x-powered-by');

const PORT = parseInt(process.env.PORT || '3011', 10);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const staticOpts = {
    index: ['index.html'],
    extensions: ['html'],
    etag: true,
    lastModified: true,
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
    setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
    },
};

app.use(express.static(ROOT, staticOpts));

app.use((req, res) => {
    res.status(404).type('txt').send('Não encontrado');
});

app.listen(PORT, HOST, () => {
    console.log(`Cardápio em http://${HOST}:${PORT} (${process.env.NODE_ENV || 'development'})`);
});
