// Importa o pacote express que acabamos de instalar
const express = require('express');

// Cria o aplicativo (nosso servidor)
const app = express();

// O Render vai injetar a porta dele aqui, ou usar a 3000 se estiver no seu PC
const PORT = process.env.PORT || 3000;

// Diz para o Node.js que a pasta 'public' contém nossos arquivos de frontend (HTML, imagens, etc)
app.use(express.static('public'));

// Inicia o servidor e avisa no terminal que deu tudo certo
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso! Acesse: http://localhost:${PORT}`);
});