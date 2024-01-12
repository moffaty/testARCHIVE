const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');

// middleware
const checkHeadersMiddleware = (req, res, next) => {
    const requiredHeaders = ['authorization', 'Content-Type'];
    console.log(req.headers);
    for (const header of requiredHeaders) {
      if (!req.headers[header]) {
        return res.status(400).json({ error: `Missing: ${header}` });
      }
    }
    next();
  };

// token
const token = "zxc";

// hash
const main_dir = '/main_dir';
const hashLenght = 10;

// db
const hostDB = 'srv-archive';
const userDB = 'agp';
const passwordDB = 'Lmx00R@FMPaA';

/**
 * Connects to a MySQL database.
 * @param {string} dbNAME The name of the database to connect to.
 * @param {Object} res The *response* from server query. Need for response error 
 * @returns {Object} The MySQL connection object.
 */
function connectToMySQL(dbNAME, res) {
    const connection = mysql.createConnection({
        host: hostDB,
        user: userDB,
        password: passwordDB,
        database: dbNAME,
        port: 3306
    });
    connection.connect((err) => {
        if (err) { 
            console.dir(err); 
            res.json({  error:'Error connection to DB' }); 
        }
    });
    return connection;
}

function getUserData(req, res) {
    if (!req.body.password && req.body.username) {
        res.json({ error:`Error: haven't login or password` });
    } 
    const username = req.body.username;
    const password = req.body.password;
    const data = [username, password];
    return data;
}

function isSQLResponseHaveError(error, res) {
    if (error) {
        console.log(error);
        res.json({ error: error.sqlMessage });
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
        res.status(500).json({ error: 'Ошибка чтения директории' });
    }
});

app.post('/register-user', async (req, res) => {
    const data = getUserData(req, res);
    const connection = connectToMySQL('personals', res);
    const query = 'INSERT INTO auth(username, password) VALUES(?, ?)';
    connection.query(query, data, (error, result) => {
        if (!isSQLResponseHaveError(error, res)) {
            res.json({ response: `Registered new user: ${data[0]}!` })
        }
    })
})

app.post('/delete-user', (req, res) => {
    const data = getUserData(req, res);
    const connection = connectToMySQL('personals', res);
    const query = 'DELETE FROM auth WHERE username = ? AND password = ?';
    connection.query(query, data, (error, result) => {
        if (!isSQLResponseHaveError(error, res)) {
            if (result.affectedRows > 0) {
                res.json({ response: `Deleted user: "${username}"!` });
            } else {
                res.json({ response: "User doesn't exist" });
            }
        }
    })
})

app.post('/login', (req, res) => {
    const data = getUserData(req, res);
    const connection = connectToMySQL('personals', res);
    const query = 'SELECT * FROM auth WHERE username = ? AND password = ?';
    connection.query(query, data, (error, result) => {
        if (!isSQLResponseHaveError(error, res)) {
            const username = data[0];
            const userToken = jwt.sign({ username }, token, { expiresIn: '0.5h' });
            res.status(200).send(`\nToken: ${userToken}\nUse token in header to get acces. Like this: "Authorization: Bearer token"`);
        }
    })
})

app.post('/secret', checkHeadersMiddleware, (req, res) => {
    res.send('hola)');
})

app.listen(3100, () => {
    console.log('Started http://localhost:3100')
})

async function test()  {
    const userP = '1234';
    const registerP = await bcrypt.hash(userP, hashLenght);
    console.log("IN BD:", registerP);
    const loginP = await bcrypt.compare(userP, registerP);
    console.log("LOGIN:",loginP);
}
test();
// console.dir(bcrypt.compare(rawPassword, user.password));