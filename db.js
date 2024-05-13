const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const { rename } = require('./helpers/files.js');
const { dbLogs, getFunctionName } = require('./helpers/logs.js');

class classDB {
    constructor(dbFile) {
        const dataDB = fs.readFileSync(dbFile, 'utf8');
        // Parse the JSON data
        const jsonData = JSON.parse(dataDB);

        this.hostDB = jsonData.host;
        this.userDB = jsonData.user;
        this.passwordDB = jsonData.password;
        this.portDB = jsonData.port;

        this.databaseFiles = 'files';
        this.databaseUsers = 'users';

        this.tableFiles = 'filesInfo';
        this.tableUsers = 'auth';

        this.admin = { username: 'admin', password: 'pass' };

        this.connection = this.connectToMySQL();
    }

    testConnection() {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseFiles);
            connection.connect((err) => {
                if (err) {
                    dbLogs('error while connect to database');
                } else {
                    dbLogs('connected');
                }
            });
        });
    }

    getConnectInfo() {
        return JSON.stringify({ host: this.hostDB, user: this.userDB, password: this.passwordDB, port: this.portDB });
    }

    /**
     * Connects to a MySQL database.
     * @param {string} dbNAME The name of the database to connect to.
     * @param {Object} res The *response* from server query. Need for response error 
     * @returns {Object} The MySQL connection object.
     */
    connectToMySQL(dbNAME, res) {
        try {
            const connection = mysql.createConnection({
                host: this.hostDB,
                user: this.userDB,
                password: this.passwordDB,
                database: dbNAME,
                port: this.portDB
            });
            connection.connect((err) => {
                if (err) { 
                    dbLogs(err); 
                    if (res) {
                        res.json({ response:'Error connection to DB' }); 
                        return null;
                    }
                }
            });
            return connection;
        } 
        catch(err) {
            dbLogs(err);
            if (res) {
                res.json({ response:'Error connection to DB' }); 
            }
            return null;
        }
    }

    async createUsersTable() {
        try {
            const connection = this.connectToMySQL(this.databaseUsers);
            
            // Создаем таблицу, если она не существует
            const createTableSql = `
                CREATE TABLE IF NOT EXISTS ${this.tableUsers} (
                    username varchar(255) NOT NULL,
                    password varchar(255) NOT NULL,
                    position varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'user',
                    PRIMARY KEY (username)
                )
            `;
            await connection.execute(createTableSql);

            // Проверяем существование записей с именами admin, user, red
            const checkNames= `SELECT username FROM ${this.tableUsers} WHERE username IN ('admin', 'user', 'red')`;
            const [results] = await connection.promise().query(checkNames);
            const isExist = results.length > 0;

            if (isExist) {
                connection.end();
                dbLogs('users are exist')
                return { status: 'success', response: 'Users already exist!' };
            }

            // Вставляем данные, если пользователи еще не существуют
            const insertAdminSql = `INSERT INTO ${this.tableUsers}(username, password, position) VALUES('admin', 'pass', 'admin')`;
            await connection.execute(insertAdminSql);
            const insertUserSql = `INSERT INTO ${this.tableUsers}(username, password, position) VALUES('user', 'pass', 'user')`;
            await connection.execute(insertUserSql);
            const insertRedSql = `INSERT INTO ${this.tableUsers}(username, password, position) VALUES('red', 'pass', 'red')`;
            await connection.execute(insertRedSql);
    
            connection.end();
            dbLogs('users table is created!');
            return { status: 'success', response: 'Created!' };
        } catch (err) {
            dbLogs(err);
            return { status: 'error', response: 'error' };
        }
    }

    async createFilesTable() {
        try {
            const connection = this.connectToMySQL(this.databaseFiles);
            const sql = `
            CREATE TABLE IF NOT EXISTS ${this.tableFiles} (
                id bigint NOT NULL AUTO_INCREMENT,
                filename text,
                decimalNumber varchar(255) DEFAULT NULL,
                nameProject varchar(255) DEFAULT NULL,
                organisation varchar(255) DEFAULT NULL,
                editionNumber int DEFAULT NULL,
                author varchar(255) DEFAULT NULL,
                storage varchar(128) DEFAULT NULL,
                documentCategory varchar(128) DEFAULT NULL,
                dirNumber int DEFAULT NULL,
                publish_date timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
                notes text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                path text,
                status varchar(128) NOT NULL DEFAULT 'В разработке',
                assembley_units json DEFAULT NULL,
                uploadDateTime datetime DEFAULT NULL,
                PRIMARY KEY (id)
              );
            `;
            connection.execute(sql);
            dbLogs('files table is created!');
            return { status: 'success', response: 'Created!' };
        }
        catch (err) {
            dbLogs(err);
            return { status: 'error', response: 'error' };
        }
    }

    removeFile(path) {
        dbLogs(path);
        return new Promise((resolve, reject) => {
            const sql = `
                DELETE FROM ${this.tableFiles} WHERE path = ?;
            `;
            const connection = this.connectToMySQL(this.databaseFiles);
            connection.query(sql, [path], (error, results) => {
                if (error) {
                    return reject ({ status: 'error', response: 'Не удалось удалить файл' });
                }
                return resolve ({ status: 'success', response: 'Файл успешно удален из базы данных' });
            })
        })
    }

    createDatabase(databaseName) {
        return new Promise((resolve, reject) => {
            try {
                const sql = `
                CREATE DATABASE IF NOT EXISTS ${databaseName}
                `;
                this.connection.query(sql, (error, result) => {
                    if (error) {
                        return reject (error);
                    }
                    dbLogs(`${databaseName} is created or exists`);
                    return resolve(result);
                });
            }
            catch (err) {
                return reject('error');
            }

        })
    }

    createTable(tableName) {
        return new Promise((resolve, reject) => {
            if (tableName === 'users') {
                return resolve (this.createUsersTable());
            } else if (tableName === 'files') {
                return resolve (this.createFilesTable());
            } else {
                return reject ({ status: 'error', response: 'Invalid table name' });
            }
        })
    }

    isDatabaseExists(databaseName) {
        return new Promise((resolve, reject) => {
            const sql = `SHOW DATABASES LIKE ?`;
            this.connection.query(sql, [databaseName], (error, results) => {
                if (results) {
                    return reject(true);
                }
                else {
                    return resolve(false);
                }
            })
        })
    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                this.createDatabase(this.databaseFiles);
                this.createDatabase(this.databaseUsers);
                this.createUsersTable();
                this.createFilesTable();
                return resolve ({ status: 'success' });
            }
            catch (error) {
                return reject ({ status: 'error' });
            }

        })
    }

    pathToUnix(path) {
        return path.replaceAll('\\', '/')
    }

    clientDate(dateString){
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear().toString();
        const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
        return formattedDate;
    }
    
    async getPropertiesByPath(path) {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseFiles);

            if (!connection) { return { status: "error" }; }

            const sql = 
            `SELECT 
                fi.id, 
                fi.filename,
                fi.decimalNumber, 
                fi.nameProject, 
                fi.organisation, 
                fi.uploadDateTime,
                fi.editionNumber,
                fi.author,
                fi.storage,
                fi.documentCategory,
                fi.dirNumber,
                fi.publish_date,
                fi.notes,
                fi.path,
                fi.status,
                IFNULL(GROUP_CONCAT(fd.path), '') AS assembley_paths,
                IFNULL(GROUP_CONCAT(fd.filename), 'Нет сборочных единиц') AS assembley_filenames
            FROM ${this.tableFiles} fi
            LEFT JOIN JSON_TABLE(fi.assembley_units, '$.ids[*]' COLUMNS (file_id INT PATH '$')) jt
            ON 1=1
            LEFT JOIN ${this.tableFiles} fd ON jt.file_id = fd.id
            WHERE fi.path = ?
            GROUP BY fi.id; `;

            connection.query(sql, [this.pathToUnix(path)], (err, results, fields) => {
                if (err) {
                    connection.end();
                    return reject ({ status: 'error' });
                }

                if (results.length !== 0) {
                    const matchingResults = results.map(({ id, filename, decimalNumber, nameProject, organisation, uploadDateTime, editionNumber, author, storage, documentCategory, dirNumber, publish_date, notes, path, status, assembley_filenames, assembley_paths }) => ({
                        id, 
                        filename,
                        decimalNumber,
                        nameProject,
                        organisation,
                        uploadDateTime,
                        editionNumber,
                        author,
                        storage,
                        documentCategory,
                        dirNumber,
                        publish_date,
                        notes,
                        path,
                        status,
                        assembley_filenames,
                        assembley_paths 
                    })); 
                    matchingResults.forEach(element => {
                        if(element.hasOwnProperty("publish_date")){
                            element.publish_date = this.clientDate(element.publish_date);
                        }
                    }); 
                    
                    connection.end();

                    resolve({ status: 'success', response: matchingResults });
                }
                else {
                    connection.end();
                    reject({ status: 'error' });
                }
            })
        })
    }

    login(username, password) {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseUsers);
            console.log(`SELECT * FROM auth WHERE username="${username}" AND password="${password}";`);
            connection.query(`SELECT * FROM auth WHERE username="${username}" AND password="${password}";`,
                (err, results, fields) => {
                    try {
                        console.log(results);
                        const authData = results ? results[0] : '';
                        if (authData && authData.username === username && authData.password === password){
                            resolve(true);
                        } 
                        else {
                            resolve(false);
                        }
                    } 
                    catch(err){
                        reject(err.message);
                    }
                }
            );
            connection.end((err) => {
                if (err) { reject(err.message); }
            });
        })
    }

    editUser(data) {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseUsers);
            const query = 'UPDATE auth SET username = ?, password = ?, position = ? WHERE username = ?';
            connection.query(query, data, (error, result) => {
                if (error) {
                    reject({ status: 'error' });
                } 
                resolve({ status: 'success', response: `Data is updated!` })
            })
        })
    }

    getUserInfo(username) {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseUsers);
            const query = 'SELECT * FROM auth WHERE username = ?';
            connection.query(query, username, (error, result) => {
                if (error) {
                    console.log(error);
                    reject({ status: 'error' });
                } 
                resolve({ status: 'success', response: result })
            })
        })
    }

    deleteUser(username) {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseUsers);
            const query = 'DELETE FROM auth WHERE username = ?';
            connection.query(query, username, (error, result) => {
                if (error) {
                    reject({ status: 'error', response: error.message });
                }
                if (result.affectedRows > 0) {
                    resolve({ status: 'success', response: `Deleted user: "${username[0]}"!` });
                } else {
                    reject({ status: 'error', response: "User doesn't exist" });
                }
            })
        })
    }

    createUser(data) {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseUsers);
            const query = 'INSERT INTO auth(username, password, position) VALUES(?, ?, ?)';
            connection.query(query, data, (error, result) => {
                if (error) {
                    if (error.code == 'ER_DUP_ENTRY') {
                        reject({ status:'error', response: 'Пользователь с таким именем уже существует' });
                    }
                    reject({ status:'error', response: error.message });
                }
                resolve({ status: 'success', response: `Registered new user: ${data[0]}!` })
            })
        })
    }

    uploadFile (data) {
        return new Promise((resolve, reject) => {
            let query = '';
            let values = data.data;
            const connection = this.connectToMySQL(this.databaseFiles);
            if (data.id) {
                query = `
                UPDATE ${this.tableFiles} SET
                    fileName = ?,
                    decimalNumber = ?,
                    nameProject = ?,
                    organisation = ?,
                    editionNumber = ?,
                    author = ?,
                    storage = ?,
                    documentCategory = ?,
                    dirNumber = ?,
                    publish_date = ?,
                    notes = ?,
                    path = ?,
                    uploadDateTime = ?
                WHERE id = ?;
                `;
            }
            else {
                query = `
                INSERT INTO ${this.tableFiles} (
                    fileName, decimalNumber, nameProject, organisation, editionNumber, author, storage,
                    documentCategory, dirNumber, publish_date, notes, path, uploadDateTime
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;
            }
            connection.query(query, values,
                (error, results) => {
                    if(error) {
                        return reject ({ status: 'error', response: 'Не удалось добавить файл!' });
                    } 
                    return resolve ({ status: 'success', response: 'Файл добавлен!' });
                });
            connection.end((err) => { if (err) { return reject ({ status: 'error' }); }});
        })
    }

    updateFile(data) {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseFiles);
            const datetimeString = data.uploadDateTime;
            const datetime = new Date(datetimeString);
            const formattedDatetime = datetime.toISOString().slice(0, 19).replace('T', ' ');
            const extension = path.extname(data.fileNameBD);
            const oldPath = path.join(__dirname, data.fileSitePath, data.fileNameBD);
            const newPath = path.join(__dirname, data.fileSitePath, data.fileName + extension);
            const newSitePath = data.fileSitePath + '/' + data.fileName + extension;
            if (!fs.existsSync(newPath)) {
                rename(fs, oldPath, newPath);
            }
            else {
                reject({ status: 'error', response: 'Нельзя хранить два одинаковых файла в одной директории' });
            }
            const query = `
            UPDATE filesInfo SET 
                filename = '${data.fileName + extension}', 
                decimalNumber = '${data.decimalNumber}', 
                nameProject = '${data.nameProject}', 
                organisation = '${data.organisation}', 
                uploadDateTime = '${formattedDatetime}', 
                editionNumber = '${data.editionNumber}', 
                author = '${data.author}', 
                storage = '${data.storage}', 
                documentCategory = '${data.documentCategory}', 
                dirNumber = '${data.dirNumber}', 
                publish_date = '${data.publishDate}', 
                notes = '${data.notes}', 
                status = '${data.status}', 
                path = '${newSitePath}'
            WHERE path = '${this.pathToUnix(path.join(data.fileSitePath, data.fileNameBD))}';
            `;
            console.log(query);
            connection.query(query, (err, result) => {
                if (err) {
                    reject({status: 'error', response: err.message});
                }
                resolve({status: 'success', response: result });
            })
            connection.end();
        })
    }

    search(req) {
        return new Promise((resolve, reject) => {
            const query = req.query.query || '';
            const options = req.query.options || '';
            let categories = req.query.categories || '';
            let optionOfCategory = req.query.direction || 'ASC';
            optionOfCategory = optionOfCategory === '0' ? 'ASC' : 'DESC';
            const optionsList = options.split('&');
            const categoriesOfSearch = {'Заголовок':'filename', 'Децимальный номер':'decimalNumber','Статус':'status','Название проекта':'nameProject','Организация':'organisation','Дата создания':'uploadDateTime'} 
            categories = categoriesOfSearch[categories];
            const connection = this.connectToMySQL('files');
        
            // Выбор свойств файла
            let sqlQuery = `SELECT * FROM ${this.tableFiles} WHERE`;
        
            // Проверяем, указаны ли опции поиска
            if (options) {
            for (let i = 0; i < optionsList.length - 1; i++) {
                // Добавляем условия поиска для каждой опции
                sqlQuery += ` ` + optionsList[i] + ` LIKE ` + `'%${query}%'`;
                if (i != optionsList.length - 2) {
                sqlQuery += ' OR';
                }
            }
            } else {
            // Если опции поиска не указаны, используем предопределенные поля для поиска
            sqlQuery = `SELECT * FROM ${this.tableFiles} WHERE 
                filename LIKE '%${query}%' OR 
                decimalNumber LIKE '%${query}%' OR 
                nameProject LIKE '%${query}%' OR 
                organisation LIKE '%${query}%' OR 
                uploadDateTime LIKE '%${query}%' OR 
                editionNumber LIKE '%${query}%' OR 
                author LIKE '%${query}%' OR 
                storage LIKE '%${query}%' OR 
                documentCategory LIKE '%${query}%' OR 
                dirNumber LIKE '%${query}%' OR 
                publish_date LIKE '%${query}%' OR 
                notes LIKE '%${query}%'`;
            }
            sqlQuery += `ORDER BY ${categories} ${optionOfCategory};`
        
            // Выполняем SQL-запрос к базе данных
            connection.query(sqlQuery, (err, results, fields) => {
                if (err) { return reject(`Ошибка выполнения запроса: ${err}`); }
            
                // Преобразуем результаты запроса в удобный формат перед отправкой на клиент
                const matchingResults = results.map(({ filename, decimalNumber, status, path, nameProject, organisation, uploadDateTime }) => ({ filename, decimalNumber, status, path, nameProject, organisation, uploadDateTime }));
            
                // Если createDate присутствует в результатах, преобразуем его в удобный формат даты
                matchingResults.forEach(element => {
                    if (element.uploadDateTime !== null){
                        element.uploadDateTime = this.clientDate((element.uploadDateTime));
                    }
                });
            
                // Отправляем результаты клиенту в формате JSON
                return resolve(matchingResults);
            });
        
            // Закрываем соединение с сервером MySQL
            connection.end((err) => {if (err) { return reject(`Ошибка закрытия подключение к БД: ${err.message}`); } });
        })
    }

    getStatus(path) {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseFiles);
            const sql = `SELECT status FROM ${this.tableFiles} WHERE path = ?`;
            connection.query(sql, [path], (err, result) => {
                if (err) return reject(err);
                return resolve(result[0]);
            })
            connection.end();
        })
    }

    updatePath(dirPath, newPath) {
        return new Promise((resolve, reject) => {
            const connection = this.connectToMySQL(this.databaseFiles);
            const sitePath = '/' + this.pathToUnix(path.relative(__dirname, dirPath));
            const newSitePath = '/' + this.pathToUnix(path.relative(__dirname, newPath));
    
            const query = `
                UPDATE filesInfo 
                SET path = REPLACE(path, ?, ?) 
                WHERE path LIKE ?;
            `;
            const values = [sitePath, newSitePath, sitePath + '%'];
            connection.query(query, values, (error, results) => {
                if (error) {
                    console.error("Error updating paths:", error);
                    reject(error);
                    return;
                }
                dbLogs("Paths updated successfully.");
                resolve(results);
            });
    
            connection.end();
        });
    }
    

}


module.exports = {
    classDB
};