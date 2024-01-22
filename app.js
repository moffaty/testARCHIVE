const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');

// middlewares
function checkHeadersMiddleware(req, res, next) {
    const requiredHeaders = ['authorization'];
    // console.log(req.headers);
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
        console.log(jwt.verify(userToken.replace(/^Bearer\s+/, ''), token));
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
const token = "zxc";

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // для обработки URL-кодированных данных
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index2.html'));
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

            data.push({
                name: file,
                type: isDirectory ? 'directory' : 'file',
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Произошла ошибка:', error);
        res.status(500).json({ response: 'Ошибка чтения директории' });
    }
});


// BD settings

app.post('/change-connect-db', checkHeadersMiddleware, checkToken, async (req, res) => {
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
    console.log(host, user, password, port);
    await stopServer();
    await startServer();
    res.send('Data base connection changed. Server rebooted.');
})

// BD status

app.get('/get-database-status', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.status(200).json({ status: 'success', response: 'Database connection is active' });
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
            console.log(result);
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
    console.log(data);
    const connection = connectToMySQL('personals', res);
    const query = 'UPDATE auth SET username = ?, password = ?, position = ? WHERE username = ?';
    connection.query(query, data, (error, result) => {
        if (!isSQLResponseHaveError(error, res)) {
            res.json({ status: 'success', response: `Data is updated!` })
        }
    })
})

app.post('/get-info-of-registration', (req, res) => {
    
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
            const userToken = jwt.sign({ username }, token, { expiresIn: '0.5h' });
            res.status(200).send(`\nToken: ${userToken}\nUse token in header to get acces. Like this: "Authorization: Bearer token"`);
        }
    })
})

app.post('/secret', checkHeadersMiddleware, checkToken, (req, res) => {
    res.send('hola)');
})

app.post('/admin', (req, res) => {
    const username = 'admin';
    res.send(jwt.sign({ username }, token, { expiresIn: '0.5h' }));
})

app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-panel.html'));
})

app.get('/get-positions', (req, res) => {
    console.log(personalPositions);
    res.json(personalPositions);
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