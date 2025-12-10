import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const host = '0.0.0.0';
const porta = 1215;
const server = express();


let listaEquipes = [];
let listaJogadores = [];


server.use(session({
    secret: 'S3nh4S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());


function verificarUsuarioLogado(req, res, next) {
    if (req.session?.dadosLogin?.usuarioLogado) {
        next();
    } else {
        res.redirect('/login');
    }
}


server.get('/', verificarUsuarioLogado, (req, res) => {
    let ultimoAcesso = req.cookies?.ultimoAcesso;
    const date = new Date();
    res.cookie('ultimoAcesso', date.toLocaleString());

    res.setHeader('Content-Type', 'text/html;');
    res.write(`
        <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Menu Principal</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>

        <nav class="navbar navbar-expand-lg bg-body-tertiary">
          <div class="container-fluid">
            <a class="navbar-brand" href="/">LOL</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item"><a class="nav-link active" href="/">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="/cadEqp">Cadastrar Equipe</a></li>
                <li class="nav-item"><a class="nav-link" href="/cadJog">Cadastrar Jogador</a></li>
                <li class="nav-item"><a class="nav-link" href="/listarEqp">Listar Equipes</a></li>
                <li class="nav-item"><a class="nav-link" href="/listarJog">Listar Jogadores</a></li>
              </ul>
            </div>      
          </div>
        </nav>

        <div class="container mt-4">
            <p><strong>Último acesso:</strong> ${ultimoAcesso || 'Primeiro acesso'}</p>
            <h1>Bem-vindo ao Campeonato de League of Legends</h1>
        </div>

        </body>
        </html>
    `);
    res.end();
});


server.get('/login', (req, res) => {
    res.send(`
        <html>
            <head>
                <meta charset="UTF-8"/>
                <title>Login</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>

            <body class="container mt-5">
                <h2>Login</h2>
                <form method="POST" action="/login">
                    <input type="email" class="form-control mb-2" name="email" placeholder="Email">
                    <input type="password" class="form-control mb-2" name="password" placeholder="Senha">
                    <button class="btn btn-primary">Entrar</button>
                </form>
                    <p>Verificar os dados do login no arquivo dadosParaLogar.txt dentro da pasta do projeto.</p>
            </body>
        </html>
    `);
});

server.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === "admin@hotmail.com" && password === "admin123") {
        req.session.dadosLogin = {
                                    usuarioLogado: true,
                                    nomeUsuario: "Administrador"
                                };
        res.redirect('/');
    } else {
        res.send(`<h2>Login incorreto!</h2><a href="/login">Tentar novamente</a>`);
    }
});


server.get('/cadEqp', verificarUsuarioLogado, (req, res) => {
    res.send(`
        <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Cadastrar Equipe</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>

        <body class="container mt-4">
            <h2>Cadastro de Equipe</h2>
            <form method="POST" action="/cadEqp">
                <input type="text" name="nomeEqp" class="form-control mb-2" placeholder="Nome da equipe">
                <input type="text" name="capitEqp" class="form-control mb-2" placeholder="Nome do capitão">
                <input type="text" name="telEqp" class="form-control mb-2" placeholder="Telefone/WhatsApp">

                <button class="btn btn-primary">Cadastrar</button>
            </form>
        </body>
        </html>
    `);
});

server.post('/cadEqp', verificarUsuarioLogado, (req, res) => {
    const { nomeEqp, capitEqp, telEqp } = req.body;

    if (!nomeEqp || !capitEqp || !telEqp) {
        return res.send(`<h3>Preencha todos os campos!</h3><a href="/cadEqp">Voltar</a>`);
    }

    listaEquipes.push({ nomeEqp, capitEqp, telEqp });

    res.redirect('/listarEqp');
});


server.get('/listarEqp', verificarUsuarioLogado, (req, res) => {
    let html = `
        <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Equipes</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container mt-4">

        <h2>Equipes Cadastradas</h2>

        <table class="table table-striped">
            <tr><th>Equipe</th><th>Capitão</th><th>Telefone</th></tr>
    `;

    for (let e of listaEquipes) {
        html += `
            <tr>
                <td>${e.nomeEqp}</td>
                <td>${e.capitEqp}</td>
                <td>${e.telEqp}</td>
            </tr>
        `;
    }

    html += `
        </table>

        <a href="/cadEqp" class="btn btn-primary">Cadastrar nova equipe</a>
        <a href="/" class="btn btn-secondary">Menu</a>

        </body></html>
    `;

    res.send(html);
});


server.get('/cadJog', verificarUsuarioLogado, (req, res) => {
    res.send(`
        <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Cadastrar Jogador</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>

        <body class="container mt-4">
            <h2>Cadastro de Jogador</h2>
            <form method="POST" action="/cadJog">

                <input type="text" name="nomeJog" class="form-control mb-2" placeholder="Nome do jogador">
                <input type="text" name="nickJog" class="form-control mb-2" placeholder="Nickname">

                <label>Função:</label>
                <div>
                    <input type="radio" name="funcao" value="Top"> Top
                    <input type="radio" name="funcao" value="Jungle"> Jungle
                    <input type="radio" name="funcao" value="Mid"> Mid
                    <input type="radio" name="funcao" value="Atirador"> Atirador
                    <input type="radio" name="funcao" value="Suporte"> Suporte
                </div>

                <label class="mt-2">Elo:</label>
                <select class="form-control mb-2" name="elo">
                    <option>Ferro</option><option>Bronze</option><option>Prata</option>
                    <option>Ouro</option><option>Platina</option><option>Diamante</option>
                    <option>Mestre</option><option>Grão-Mestre</option><option>Desafiante</option>
                </select>

                <label>Gênero:</label>
                <select class="form-control mb-2" name="genero">
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                </select>

                <label>Equipe:</label>
                <select class="form-control mb-3" name="equipe">
                ${listaEquipes.map(e => `<option value="${e.nomeEqp}">${e.nomeEqp}</option>`).join('')}  //Este trecho eu tive dificuldade, portanto realizei algumas pesquisas para implementar de forma correta!     
                </select>

                <button class="btn btn-primary">Cadastrar Jogador</button>
            </form>
        </body>
        </html>
    `);
});

server.post('/cadJog', verificarUsuarioLogado, (req, res) => {
    const {nomeJog, nickJog, funcao, equipe, elo, genero} = req.body;

    if (!nomeJog || !nickJog || !funcao || !equipe || !elo || !genero) {
        return res.send(`<h3>Preencha todos os campos!</h3><a href="/cadJog">Voltar</a>`);
    }

    listaJogadores.push({
        nomeJog, nickJog, funcao, equipe, elo, genero});

    res.redirect('/listarJog');
});


server.get('/listarJog', verificarUsuarioLogado, (req, res) => {
let conteudo = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous"/>
<title>Jogadores</title>
</head>
<body>
<div class="container">
<h1 class="text-center border m-3 p-3 bg-light">Jogadores Cadastrados</h1>
`;

let contP = 0;

for (let i = 0; i < listaEquipes.length; i++) {
    conteudo += `
    <h3 class="mt-4 mb-3">${listaEquipes[i].nomeEqp}</h3>
    <table class="table table-striped table-hover">
    <thead>
    <tr>
        <th>Nome</th>
        <th>Nickname</th>
        <th>Função</th>
        <th>Elo</th>
        <th>Gênero</th>
    </tr>
    </thead>
    <tbody>
    `;

    let temJogador = false;

    for (let j = 0; j < listaJogadores.length; j++) {
        if (listaJogadores[j].equipe === listaEquipes[i].nomeEqp) {
            temJogador = true;
            contP++;
            conteudo += `
            <tr>
                <td>${listaJogadores[j].nomeJog}</td>
                <td>${listaJogadores[j].nickJog}</td>
                <td>${listaJogadores[j].funcao}</td>
                <td>${listaJogadores[j].elo}</td>
                <td>${listaJogadores[j].genero}</td>
            </tr>
            `;
        }
    }

    if (!temJogador) {
        conteudo += `
        <tr>
            <td colspan="5"><strong>Nenhum jogador cadastrado.</strong></td>
        </tr>
        `;
    }

    conteudo += `
    </tbody>
    </table>
    `;
}

conteudo += `
<tr>
<td colspan="5"><strong>Total de jogadores cadastrados: ${contP}</strong></td>
</tr>

<a class="btn btn-secondary m-3" href="/">Voltar</a>

</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>
</html>
`;

res.send(conteudo);
});

server.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

server.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});

