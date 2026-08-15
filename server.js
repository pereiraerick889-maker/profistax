require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session'); // NOVA FERRAMENTA DE SESSÃO

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ==========================================
// CONFIGURAÇÃO DA SESSÃO (O "Crachá")
// ==========================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_padrao',
    resave: false,
    saveUninitialized: false
}));

// FUNÇÃO DE SEGURANÇA (O "Segurança da Porta")
function verificarLogin(req, res, next) {
    if (req.session.logado) {
        next(); // Tem crachá? Pode passar!
    } else {
        res.status(401).json({ erro: "Acesso negado!" }); // Sem crachá? Bloqueado!
    }
}

// ==========================================
// CONEXÃO COM O MONGODB NA NUVEM
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Banco de dados MONGODB conectado! 🚀"))
  .catch((err) => console.error("Erro ao conectar no banco:", err));

const postSchema = new mongoose.Schema({
    titulo: String,
    conteudo: String,
    data_criacao: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// ==========================================
// ROTAS DE LOGIN E ADMIN
// ==========================================

// Rota que verifica a senha digitada no login.html
app.post('/api/login', (req, res) => {
    if (req.body.senha === process.env.ADMIN_PASSWORD) {
        req.session.logado = true; // Entrega o crachá
        res.json({ sucesso: true });
    } else {
        res.status(401).json({ erro: "Senha incorreta" });
    }
});

// Rota que entrega a tela de admin SOMENTE para quem tem o crachá
app.get('/admin', (req, res) => {
    if (req.session.logado) {
        res.sendFile(path.join(__dirname, 'private', 'admin.html'));
    } else {
        res.redirect('/login.html'); // Se não tiver logado, manda pra tela de login
    }
});

// ==========================================
// ROTAS DA API DE POSTS
// ==========================================

// 1. CRIAR (Protegido pelo segurança 'verificarLogin')
app.post('/api/posts', verificarLogin, async (req, res) => {
    try {
        const novoPost = await Post.create({ titulo: req.body.titulo, conteudo: req.body.conteudo });
        res.json({ mensagem: "Post criado com sucesso!", id: novoPost._id });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 2. LER (Aberto para o público, para aparecer no site)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ data_criacao: -1 });
        const postsFormatados = posts.map(p => ({ id: p._id, titulo: p.titulo, conteudo: p.conteudo }));
        res.json(postsFormatados);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 3. DELETAR (Protegido pelo segurança 'verificarLogin')
app.delete('/api/posts/:id', verificarLogin, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ mensagem: "Post deletado com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});