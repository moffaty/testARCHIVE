const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { Session } = require('inspector');

// middlewares
function checkHeadersMiddleware(req, res, next) {
    const requiredHeaders = ['authorization'];
    for (const header of requiredHeaders) {
      if (!req.headers[header]) {
        return res.status(400).json({ response: `Access denied` });
      }
    }
    next();
};

async function checkToken(req, res, next) {
    try {
        const userToken = req.headers['authorization'];
        console.log(jwt.verify(userToken.replace(/^Bearer\s+/, ''), secret));
    } catch (err) {
        return res.status(400).json({ response: `Access denied` });
    }
    next();
}

// list of personals positions in bd 
const personalPositions = ['admin', 'editor', 'user'];

// PORT
const PORT = 3100;

// SERVER (look into startServer)
// need to stop server
let server;

// token
const secret = "zxc";

// hash
const main_dir = '/main_dir';
const hashLenght = 10;

// db
const dataDB = fs.readFileSync('db.json', 'utf8');
// Parse the JSON data
const jsonData = JSON.parse(dataDB);

// Set values for your parameters
const hostDB = jsonData.host;
const userDB = jsonData.user;
const passwordDB = jsonData.password;
const portDB = jsonData.port;

console.log('HostDB:', hostDB);
console.log('UserDB:', userDB);
console.log('PasswordDB:', passwordDB);

/**
 * Connects to a MySQL database.
 * @param {string} dbNAME The name of the database to connect to.
 * @param {Object} res The *response* from server query. Need for response error 
 * @returns {Object} The MySQL connection object.
 */
function connectToMySQL(dbNAME, res) {
    try {
        const connection = mysql.createConnection({
            host: hostDB,
            user: userDB,
            password: passwordDB,
            database: dbNAME,
            port: portDB
        });
        connection.connect((err) => {
            if (err) { 
                console.dir(err); 
                if (res) {
                    res.json({  response:'Error connection to DB' }); 
                    return null;
                }
            }
        });
        return connection;
    } catch(err) {
        if (res) {
            res.json({  response:'Error connection to DB' }); 
        }
        return null;
    }
}

function defineFileType(filePath) {
    const splitted = filePath.split('.');
    return splitted[splitted.length - 1];
}

async function startServer() {
    server = app.listen(PORT, () => {
        console.log(`Started http://localhost:${PORT}`)
    })
}

async function stopServer() {
    if (server) {
        server.close();
    }
    console.log('Server stopped');
}

function getUserData(req, res) {
    if (!req.body.password && req.body.username) {
        res.json({ response:`response: haven't login or password` });
    } 
    const username = req.body.username;
    const password = req.body.password;
    const data = [username, password];
    return data;
}

function isSQLResponseHaveError(error, res) {
    if (error) {
        res.json({ status: 'error', response: `Error` });
        return true;
    }
    return false;
}

app.use(session({
    username: '',
    secret: secret,
    resave: false,
    saveUninitialized: true
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // для обработки URL-кодированных данных
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin-pane1', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-panel.html'));
})

// app.get('*', (req, res) => {
//     if (req.session.username === undefined) {
//         res.sendFile(path.join(__dirname, 'views/login.html'));
//     }
// })

app.get('/', (req, res) => {
    req.session.username = 'red';
    if (req.session.username) {
        res.sendFile(path.join(__dirname, 'index2.html'));
    } else {
        res.sendFile(path.join(__dirname, 'views/login.html'));
    }
})

app.get('/get-main-dir', (req, res) => {
    res.json({ path: main_dir });
})

app.post('/get-dir-info', async (req, res) => {
    if (req.body.path === '') {
        req.body.path = '/main_dir';
    }
    const dirPath = path.join(__dirname, req.body.path);
    try {
        const files = fs.readdirSync(dirPath);
        const data = [];

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            const isDirectory = stats.isDirectory();

            const obj = {};
            const type = isDirectory ? 'directory' : 'file';
            obj['name'] = file;
            obj['type'] = type;
            if (type === 'file') {
                obj['filetype'] = defineFileType(file);
            }
            data.push(obj);
        }

        res.json(data);
    } catch (error) {
        console.error('Произошла ошибка:', error);
        res.status(500).json({ response: 'Ошибка чтения директории' });
    }
});

// login
app.post('/login',(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const connection = connectToMySQL('personals');
    connection.query(`SELECT * FROM auth WHERE username="${username}" AND password="${password}"`,
        (err, results, fields) => {
            try {
                const authData = results[0];
                // const authData = { username: "123", password: "123"};
                if (authData.username === username && authData.password === password){
                    // Если пользователь аутентифицирован, генерируем токен
                    const token = jwt.sign({ username }, secret, { expiresIn: '0.5h' });
                    // Сохраняем токен в куках браузера
                    
                    res.cookie('token', secret, { httpOnly: true, maxAge: 3600000, secure: true, sameSite: 'none'});
                    // addToLog("authlogs.csv", [  ]);
                    res.setHeader('Set-Cookie', [
                        `token=${token}; HttpOnly; Max-Age=3600; Path=/`,
                        `name=${username}; HttpOnly; Max-Age=3600; Path=/`
                    ]);
                    req.session.username = {
                        username: username
                    };
                    res.json({ status: 'succes' });
                } else {
                    // Ошибка: неверные данные для авторизации
                    res.json({ status: 'error' });
                }
            } catch(err){
                res.json({ status: 'error' });
            }});
            
    connection.end((err) => {
      if (err) { return console.dir(`Ошибка закрытия подключение к БД: ${err.message}`); }
    });
})

// logout

app.get('/logout', (req, res) => {
    req.session.username = '';
    const clearCookie = (...names) => { // Используем rest параметр для получения всех аргументов в виде массива
      const cookies = names.map(name => `${name}=; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`);
      res.setHeader('Set-Cookie', cookies);
    }
  
    clearCookie('name', 'token'); // Можно передавать любое количество аргументов
  
    res.redirect('/');
});

// BD settings

app.get('/get-db-connection-info', (req, res) => {
    const filePath = path.join(__dirname, 'db.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        try {
            const dbinfo = JSON.parse(data);
            res.json(dbinfo);
        } catch (parseError) {
            console.error(parseError);
            res.status(500).json({ error: 'Error parsing JSON' });
        }
    });
});

app.post('/change-connect-db', async (req, res) => {
    const host = req.body.host || hostDB;
    const user = req.body.user || userDB;
    const password = req.body.password || passwordDB;
    const port = req.body.port || portDB;
    const data = {
        host: host,
        user: user,
        password: password,
        port: port
    };
    const jsonData = JSON.stringify(data, null, 2);``
    fs.writeFileSync('db.json', jsonData);
    await stopServer();
    await startServer();
    res.json({status: 'succes', response: 'Data base connection changed. Server rebooted.'});
})

// BD status

app.get('/get-database-status', async (req, res) => {
    try {
        const connection = mysql.createConnection({
            host: hostDB,
            user: userDB,
            password: passwordDB,
            port: portDB
        });
        connection.connect((err) => {
            res.status(200).json({ status: 'success', response: 'Database connection is active' });
        })
    } catch (error) {
        console.error('Database connection error:', error.message);
        res.status(500).json({ status: 'error', response: 'Failed to connect to the database' });
    }
})

// BD user-queries

app.post('/get-user-info', (req, res) => {
    const data = [req.body.username];
    const connection = connectToMySQL('personals', res);
    const query = 'SELECT * FROM auth WHERE username = ?';
    connection.query(query, data, (error, result) => {
        if (!isSQLResponseHaveError(error, res)) {
            res.json({ status: 'success', response: result })
        }
    })
})

app.post('/register-user', async (req, res) => {
    const data = getUserData(req, res);
    data.push(req.body.position);
    const connection = connectToMySQL('personals', res);
    const query = 'INSERT INTO auth(username, password, position) VALUES(?, ?, ?)';
    connection.query(query, data, (error, result) => {
        if (!isSQLResponseHaveError(error, res)) {
            res.json({ status: 'success', response: `Registered new user: ${data[0]}!` })
        }
    })
})

app.post('/delete-user', (req, res) => {
    const data = [req.body.username];
    const connection = connectToMySQL('personals', res);
    const query = 'DELETE FROM auth WHERE username = ?';
    connection.query(query, data, (error, result) => {
        if (!isSQLResponseHaveError(error, res)) {
            if (result.affectedRows > 0) {
                res.json({ status: 'success', response: `Deleted user: "${data[0]}"!` });
            } else {
                res.json({ status: 'error', response: "User doesn't exist" });
            }
        }
    })
})

app.post('/edit-user', (req, res) => {
    const data = getUserData(req, res);
    data.push(req.body.position);
    data.push(req.body.old_username); // where condition
    const connection = connectToMySQL('personals', res);
    const query = 'UPDATE auth SET username = ?, password = ?, position = ? WHERE username = ?';
    connection.query(query, data, (error, result) => {
        if (!isSQLResponseHaveError(error, res)) {
            res.json({ status: 'success', response: `Data is updated!` })
        }
    })
})

app.get('/get-info-of-registration', (req, res) => {
    res.json( req.session.username );
})

app.post('/login', (req, res) => {
    const data = getUserData(req, res);
    const connection = connectToMySQL('personals', res);
    const query = 'SELECT * FROM auth WHERE username = ? AND password = ?';
    if (!connection) {
        return;
    }
    connection.query(query, data, (error, result) => {
        if (!isSQLResponseHaveError(error, res)) {
            const username = data[0];
            const userToken = jwt.sign({ username }, secret, { expiresIn: '0.5h' });
            res.status(200).send(`\nToken: ${userToken}\nUse token in header to get acces. Like this: "Authorization: Bearer token"`);
        }
    })
})

app.post('/admin', (req, res) => {
    const username = 'admin';
    res.send(jwt.sign({ username }, secret, { expiresIn: '0.5h' }));
})

// app.get('/admin-panel', (req, res) => {
//     res.sendFile(path.join(__dirname, 'admin-panel.html'));
// })

app.get('/get-positions', (req, res) => {
    res.json(personalPositions);
})


// files
async function renameDir(oldPath, newName) {
    const newPath = path.join(path.dirname(oldPath), newName);
    try {
        await fs.access(newPath, fs.constants.F_OK);
        return 'error'; 
    } catch (error) {
        await fs.renameSync(oldPath, newPath, (err) => { console.log(err) });
        return 'success'; 
    }
}

app.post('/renameDir', async (req,res) => {
   const oldName = req.body.oldName;
   const newName = req.body.newName;
   const result = await renameDir(path.join(__dirname, oldName), newName);
   console.log(result);
   res.json({ status: result });
})

startServer();

async function test()  {
    const userP = '1234';
    const registerP = await bcrypt.hash(userP, hashLenght);
    console.log("IN BD:", registerP);
    const loginP = await bcrypt.compare(userP, registerP);
    console.log("LOGIN:",loginP);
}
test();
// console.dir(bcrypt.compare(rawPassword, user.password));