require('dotenv').config(); // Lê o arquivo .env com a sua senha secreta
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ==========================================
// CONEXÃO COM O MONGODB NA NUVEM
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Banco de dados MONGODB na nuvem conectado! 🚀"))
  .catch((err) => console.error("Erro ao conectar no banco:", err));

// ==========================================
// ESTRUTURA DO POST (O "Molde")
// ==========================================
const postSchema = new mongoose.Schema({
    titulo: String,
    conteudo: String,
    data_criacao: { type: Date, default: Date.now }
});

// Cria a coleção no banco baseada no molde acima
const Post = mongoose.model('Post', postSchema);

// ==========================================
// ROTAS DA API
// ==========================================

// 1. CRIAR
app.post('/api/posts', async (req, res) => {
    try {
        const novoPost = await Post.create({
            titulo: req.body.titulo,
            conteudo: req.body.conteudo
        });
        res.json({ mensagem: "Post criado com sucesso!", id: novoPost._id });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 2. LER
app.get('/api/posts', async (req, res) => {
    try {
        // Busca todos e ordena do mais novo pro mais velho
        const posts = await Post.find().sort({ data_criacao: -1 });
        
        // Ajustamos para o frontend entender (o Mongo usa "_id" com sublinhado)
        const postsFormatados = posts.map(p => ({
            id: p._id,
            titulo: p.titulo,
            conteudo: p.conteudo
        }));
        
        res.json(postsFormatados);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 3. DELETAR
app.delete('/api/posts/:id', async (req, res) => {
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