const express = require('express');
const cors = require('cors');
const sqlite = require('sqlite3');
const path = require('path');

const app = express();
app.use(cors());

var db = new sqlite.Database('Database.sqlite');

// Libera a pasta public para o navegador acessar imagens, CSS, JS, etc.
app.use(express.static(path.join(__dirname, 'public')));

function CriarDatabase() {
  var query =
    'CREATE TABLE LOGIN (ID INTEGER PRIMARY KEY AUTOINCREMENT, USUARIO VARCHAR, NOME VARCHAR, SENHA VARCHAR)';

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log('Tabela criada com sucesso!');
  });
}

function CriarDatabase_post() {
  var query = `
    CREATE TABLE IF NOT EXISTS POSTAGENS (ID INTEGER PRIMARY KEY AUTOINCREMENT, USUARIO VARCHAR, MENSAGEM TEXT, DATA DATETIME)
  `;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log('Tabela de postagens criada!');
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/cadastro/:usuario/:nome/:senha', (req, res) => {
  var x = req.params.usuario;
  var y = req.params.nome;
  var z = req.params.senha;

  var query = 'INSERT INTO LOGIN (USUARIO, NOME, SENHA) VALUES (?, ?, ?)';

  db.run(query, [x, y, z], (err) => {
    if (err) console.log(err);
    else res.send('1');
  });
});

// Aqui está validando o login
app.get('/api/:usuario/:senha', (req, res) => {
  var usuario = req.params.usuario;
  var senha = req.params.senha;

  console.log('Usuario = ' + usuario);
  console.log('Senha = ' + senha);

  var query = 'SELECT * FROM LOGIN';

  db.all(query, (err, rows) => {
    for (var x = 0; x < rows.length; x++) {
      if (usuario == rows[x].USUARIO && senha == rows[x].SENHA) {
        return res.json({
          CHECK: true,
          NOME: rows[x].NOME,
        });
      }
    }

    return res.json({ CHECK: false, NOME: null });
  });
});

// Faz a porcaria da postagem
app.post('/postagens/:usuario/:mensagem/:data', (req, res) => {
  var usuario = req.params.usuario;
  var mensagem = req.params.mensagem;
  var data = req.params.data;

  console.log(usuario);
  console.log(mensagem);
  console.log(data);

  if (!usuario || !mensagem || !mensagem.trim()) {
    return res.status(400).json({
      erro: 'Preencha a mensagem.',
    });
  }

  var query =
    'INSERT INTO POSTAGENS (USUARIO, MENSAGEM, DATA) VALUES (?, ?, ?)';

  db.run(query, [usuario, mensagem.trim(), data], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        erro: 'Erro ao salvar postagem.',
      });
    }
    res.json({
      sucesso: true,
    });
  });
});

app.get('/postagens', (req, res) => {
  var query = 'SELECT * FROM POSTAGENS ORDER BY ID DESC';

  db.all(query, (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ erro: 'Erro ao buscar postagens.' });
    }

    res.json(rows);
  });
});

app.listen(3000, console.log('http://localhost:3000'));
