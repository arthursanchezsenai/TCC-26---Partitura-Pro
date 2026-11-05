require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Inicialização do banco de dados
require('./database/db');

// Rotas
const authRoutes = require('./routes/auth');
const partiturasRoutes = require('./routes/partituras');
const comentariosRoutes = require('./routes/comentarios');

const app = express();

const PORT = process.env.PORT || 3000;

// Configurações gerais
app.disable('x-powered-by');

app.use(cors({
    origin: process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
        : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Servir o Frontend
app.use(express.static(path.join(__dirname, '../../')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// Verificação de saúde
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        servico: 'partitura-backend',
        mensagem: 'Servidor funcionando corretamente.'
    });
});

// Rotas da aplicação
app.use('/api/auth', authRoutes);
app.use('/api/partituras', partiturasRoutes);
app.use('/api/comentarios', comentariosRoutes);

// Rota não encontrada
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada.',
        rota: req.originalUrl
    });
});

// Tratamento centralizado de erros
app.use((error, req, res, next) => {
    console.error('Erro no servidor:', error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(error.status || 500).json({
        erro: error.status && error.status < 500
            ? error.message
            : 'Erro interno do servidor.'
    });
});

// Inicialização
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;
