const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const multer = require('multer');
const bodyParser = require('body-parser');
const files = require('./helpers/files.js');
const url = require('url');
const { addToLog, serverLogs, loginLog } = require('./helpers/logs.js');
const isWin = process.platform === "win32";
// bd
const db = require('./db.js');

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
        serverLogs(jwt.verify(userToken.replace(/^Bearer\s+/, ''), secret));
    } catch (err) {
        return res.status(400).json({ response: `Access denied` });
    }
    next();
}

function isPartOfString(substring, fullString) {
    // Проверяем, начинается ли строка fullString с substring
    return fullString.startsWith(substring);
}

async function uploadFile(req, res, next) {
    try {
        const fileData = files.upload(req.body);
        const result = await database.uploadFile(fileData);
        const oldPath = path.join(__dirname, req.file.path);
        const newPath = path.join(path.dirname(oldPath), req.body.fileName);
        const rename = await files.rename(fs, oldPath, newPath);
        const move = await files.move(fs, newPath, path.join(__dirname, req.body.path));
        req.result = result;
        next();
    }
    catch (error) {
        res.json(error);
    }
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
const dbFile = 'db1.json';
const database = new db.classDB(dbFile);

serverLogs(database.getConnectInfo());

function defineFileType(filePath) {
    const splitted = filePath.split('.');
    return splitted[splitted.length - 1];
}

async function startServer() {
    server = app.listen(PORT, () => {
        serverLogs(`Started http://localhost:${PORT}`)
    })
}

async function stopServer() {
    if (server) {
        server.close();
    }
    serverLogs('Server stopped');
}

function getUserData(req, res) {
    if (!(req.body.password) || !(req.body.username)) {
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
    position: '',
    secret: secret,
    resave: false,
    saveUninitialized: true
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin-pane1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'admin-panel.html'));
})

// app.get('*', (req, res) => {
//     if (req.session.username === undefined) {
//         res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
//     }
// })

app.get('/', (req, res) => {
    if (req.session.username) {
        res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
    } 
    else {
        res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
    }
})

app.get('/main_dir/*', (req, res) => {
    // Получаем адрес из параметра запроса
    const address = req.params[0];

    // Формируем путь к файлу на основе полученного адреса
    const filePath = path.join(__dirname, 'main_dir', address);

    // Отправляем файл
    res.sendFile(filePath);
});

app.get('/get-main-dir', (req, res) => {
    res.json({ path: main_dir });
})

app.post('/get-dir-info', async (req, res) => {
    if (req.body.path === '') {
        req.body.path = '/main_dir';
    }
    if (typeof(req.body.path) !== 'string') {
        return;
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
            obj['path'] = path.relative(path.join(__dirname, main_dir), filePath).replaceAll(/\\/g, '/');
            Object.assign(obj, await database.getStatus(main_dir + '/' + obj['path']));
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
app.post('/login', async (req,res)=>{
    try {
        const username = req.body.username;
        const password = req.body.password;
        loginLog(username, req.socket.remoteAddress);
        if (username === database.admin.username && password === database.admin.password) {
            res.json({ status: 'success', redirect: '/admin-pane1' });
        }
        else {
            const loginResult = await database.login(username, password);
            if (loginResult === true) {
                // Если пользователь аутентифицирован, генерируем токен
                const token = jwt.sign({ username }, secret, { expiresIn: '0.5h' });
                // Сохраняем токен в куках браузера
                res.cookie('token', secret, { httpOnly: true, maxAge: 3600000, secure: true, sameSite: 'none'});
                // addToLog("authlogs.csv", [  ]);
                res.setHeader('Set-Cookie', [
                    `token=${token}; HttpOnly; Max-Age=3600; Path=/`,
                    `name=${username}; HttpOnly; Max-Age=3600; Path=/`
                ]);
                req.session.username = username;
                req.session.position = 'red';
                res.json({ status: 'success', redirect: '/' });
            }
            else {
                res.json({ status: 'error' });
            }
        }
    }
    catch (err) {
        serverLogs(err);
    }
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
    res.json(database.getConnectInfo());
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
    fs.writeFileSync(dbFile, jsonData);
    await stopServer();
    await startServer();
    res.json({status: 'success', response: 'Data base connection changed. Server rebooted.'});
})

// BD status

app.get('/get-database-status', async (req, res) => {
    database.connection.connect(err => {
        if (err) {
            res.status(500).json({ status: 'error', response: 'Failed to connect to the database' });
            return;
        }
        res.status(200).json({ status: 'success', response: 'Database connection is active' });
    })
})

// BD user-queries

app.post('/get-user-info', async (req, res) => {
    try {
        const data = [req.body.username];
        res.json(await database.getUserInfo(data));
    }
    catch (error) {
        res.json(err);
    }
})

app.post('/register-user', async (req, res) => {
    try {
        const data = getUserData(req, res);
        data.push(req.body.position);
        res.json(await database.createUser(data));
    }
    catch (error) {
        res.json(error)
    }
})

app.post('/delete-user', async (req, res) => {
    try {
        const data = [req.body.username];
        res.json(await database.deleteUser(data));
    }
    catch (error) {
        res.json(error);
    }
})

app.post('/edit-user', async (req, res) => {
    try {
        const data = getUserData(req, res);
        data.push(req.body.position);
        data.push(req.body.old_username); // where condition
        res.json(await database.editUser(data));
    }
    catch (err) {
        res.json(err);
    }
})

app.get('/get-info-of-registration', (req, res) => {
    const username = req.session.username;
    const position = req.session.position;
    res.json({ username, position });
})


app.post('/admin', (req, res) => {
    const username = 'admin';
    res.send(jwt.sign({ username }, secret, { expiresIn: '0.5h' }));
})

app.get('/init', async (req, res) => {
    try {
        const result = await database.init();
        res.json(result);
    }
    catch (error) {
        res.send(error);
    }
})

app.get('/create-table-:tableName', async (req, res) => {
    const tableName = req.params.tableName;
    try {
        let result;

        if (tableName === 'users') {
            result = await database.createUsersTable();
        } else if (tableName === 'files') {
            result = await database.createFilesTable();
        } else if (tableName === 'init') {
            result = await database.init();
        } else {
            return res.status(400).json({ success: false, response: 'Invalid table name' });
        }

        res.json({
            status: 'success',
            response: `${tableName} table created successfully`,
            result
        });
    } catch (error) {
        serverLogs(`Error creating ${tableName} table:`, error);
        res.status(500).json({ success: false, response: `Error creating ${tableName} table` });
    }
})

app.get('/get-positions', (req, res) => {
    res.json(personalPositions);
})

app.post('/renameDir', async (req,res) => {
   try {
    const oldPath = path.join(__dirname, req.body.oldName);
    const newPath = path.join(path.dirname(oldPath), req.body.newName);
    const result = await files.rename(fs, oldPath, newPath);
    await database.updatePath(oldPath, newPath); // update all paths in this directory
    console.log(result);
    res.json(result);
   }
   catch (err) {
    res.json(err);
   }
})

app.post('/get-properties', async (req, res) => {
    const filePath = (path.join(req.body.path, req.body.fileName));
    try {
        const result = await database.getPropertiesByPath(filePath);
        res.json(result); 
    } 
    catch (error) { 
        res.json(error);
    }
    // res.json(database.getPropertiesByPath(req.body.path));
})

// настройка multer для сохранения загруженных файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // указываем путь к директории, куда будут сохраняться файлы
      const pathNew = url.parse(req.headers.referer).path.slice(1);
      cb(null, 'main_dir/' + pathNew)
    },
    filename: (req, file, cb) => {
      // генерируем имя для файла - берем из формы и добавляем расширение из оригинального имени файла
      const fileName = file.originalname;
      cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), uploadFile, async (req, res) => {
    try {
        res.json(req.result);
    } 
    catch (error) {
        res.json(error);
    }
});

app.post('/add', async (req, res) => {
    const dirName = req.body.dirName;
    const dirPath = req.body.path;
    serverLogs(dirPath);
    if (!dirName) {
        res.status(400).json({ status: 'error', response:'Bad Request: Dir name is missing' });
        return;
    }

    const newDirPath = path.join(__dirname, dirPath, dirName);
    try {
        const result = await files.mkdir(fs, newDirPath);
        res.json({ result });
    }
    catch (error) {
        res.json({ status:'error', response: error });
    }

});

app.post('/delete-file', async (req, res) => {
    try {
        const filePath = __dirname + '/' + req.body.fileSitePath + '/' + req.body.fileName;
        const fileSitePath = req.body.fileSitePath  + '/' +  req.body.fileName;
        const delFileDB = await database.removeFile(fileSitePath);
        const delFile = await files.remove(fs, filePath);
        delFile['responseDB'] = delFileDB.response;
        serverLogs(delFile);
        res.send(delFile);
        // phys delete file
        // database delete file
    }
    catch (error) {
        serverLogs(error);
        res.json({status:'error'});
    }
})

app.post('/update-properties', async (req, res) => {
    try {
        res.json(await database.updateFile(req.body.updatedData));
    }
    catch(err) {
        res.json(err);
    }
})

app.post('/delete-dir', async (req, res) => {
    try {
        const dirPath = path.join(__dirname, req.body.fileSitePath, req.body.fileName);
        const result = await files.removeDir(fs, dirPath);
        serverLogs(result);
        res.json(result);
    }
    catch (error) {
        res.json(error);
    }
})

app.get('/search', async (req, res) => {
    try {
        const data = await database.search(req);
        res.json(data);
    }
    catch (error) {
        res.json(error);
    }
});

// main
startServer();

async function test()  {
    const userP = '1234';
    const registerP = await bcrypt.hash(userP, hashLenght);
    serverLogs("IN BD:", registerP);
    const loginP = await bcrypt.compare(userP, registerP);
    serverLogs("LOGIN:",loginP);
    await database.testConnection();
}
test();
// console.dir(bcrypt.compare(rawPassword, user.password));