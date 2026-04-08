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
    /* Padrão sem cache longo; imagens/fontes podem ter 7d em produção (setHeaders). */
    maxAge: 0,
    setHeaders(res, filePath) {
        const lower = filePath.toLowerCase();
        if (lower.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
            return;
        }
        if (/\.(js|mjs|css)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
            return;
        }
        if (process.env.NODE_ENV === 'production' && /\.(webp|png|jpg|jpeg|gif|svg|ico|woff2?)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=7d, immutable');
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
