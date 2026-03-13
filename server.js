const express = require('express');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const { authenticator } = require('otplib');
const path = require('path');
const MASTER_PASSWORD = '';
const SECRETS_FILE = path.join(__dirname, 'secrets.json');
const app = express();
const https = require('https');
const options = {
  key: fs.readFileSync('~/certs/key.pem'),
  cert: fs.readFileSync('~/certs/cert.pem')
};


console.log('Authenticator:', authenticator);
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

function loadSecrets() {
  // Se não existir, cria um arquivo vazio criptografado
  if (!fs.existsSync(SECRETS_FILE)) {
    const emptyEncrypted = CryptoJS.AES.encrypt(JSON.stringify({}), MASTER_PASSWORD).toString();
    fs.writeFileSync(SECRETS_FILE, emptyEncrypted);
    console.log('Arquivo secrets.json criado automaticamente.');
  }

  const encrypted = fs.readFileSync(SECRETS_FILE, 'utf8');

  // Se o arquivo estiver vazio ou corrompido, retorna objeto vazio
  if (!encrypted.trim()) {
    return {};
  }

  let decrypted;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, MASTER_PASSWORD);
    decrypted = bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Erro ao descriptografar secrets.json:", err);
    return {};
  }

  // Se a descriptografia falhar ou retornar vazio
  if (!decrypted) {
    return {};
  }

  try {
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Erro ao fazer parse do JSON descriptografado:", err);
    return {};
  }
}

function saveSecrets(data) {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data), 
    MASTER_PASSWORD
  ).toString();
  fs.writeFileSync(SECRETS_FILE, encrypted);
}

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, "index.html"));
})

app.post('/add', (req,res) => {
  const { name, secret} = req.body;
  const db = loadSecrets();
  db[name] = secret;
  saveSecrets(db);

  res.send(`<h1>Cnta adicionada!</h1> <a href="/">Voltar</a><br>Ver <a href="/codes">códigos</a>`)
  res.json({ok: true})
});

app.get('/codes', (req,res) => {
  const db = loadSecrets();
  const codes = {};
  
  for (const name in db) {
    const secret = db[name];
    codes[name] = {
      code: authenticator.generate(secret),
      secret: secret
    };
  }
  res.json(codes);
});

app.get('/view', (req,res)=> {
  res.sendFile(__dirname + '/codes.html');
});

app.listen(3000, () => console.log('Servidor rodando em localhost na porta 3000: https://localhost:3000'))

https.createServer(options, app).listen(3001, () => {
  console.log('Servidor rodando em localhost na porta 3001: https://localhost:3001');
});