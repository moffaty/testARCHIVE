const mysql = require('mysql2');
const fs = require('fs');
const { resolve } = require('path');
const { rejects } = require('assert');

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

        this.connection = this.connectToMySQL();
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
                    console.dir(err); 
                    if (res) {
                        res.json({ response:'Error connection to DB' }); 
                        return null;
                    }
                }
            });
            return connection;
        } 
        catch(err) {
            console.log(err);
            if (res) {
                res.json({ response:'Error connection to DB' }); 
            }
            return null;
        }
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

            if (!connection) {
                return { status: "error" };
            }

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
            FROM filesInfo fi
            LEFT JOIN JSON_TABLE(fi.assembley_units, '$.ids[*]' COLUMNS (file_id INT PATH '$')) jt
            ON 1=1
            LEFT JOIN filesInfo fd ON jt.file_id = fd.id
            WHERE fi.path = ?
            GROUP BY fi.id; `;

            connection.query(sql, [path], (err, results, fields) => {
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

                    resolve({ status: 'succes', repsonse: matchingResults });
                }
                else {
                    connection.end();
                    reject({ status: 'error' });
                }
            })
        })
    }
    
    async createUsersTable() {
        try {
            const connection = this.connectToMySQL(this.databaseUsers);
            const sql = `
            CREATE TABLE IF NOT EXISTS auth (
                username varchar(255) NOT NULL,
                password varchar(255) NOT NULL,
                position varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'user',
                PRIMARY KEY (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            `;
            connection.execute(sql);
            return { status: 'success', response: 'Created!' };
        }
        catch (err) {
            console.log(err);
            return { status: 'error', response: 'error' };
        }
    }

    async createFilesTable() {
        try {
            const connection = this.connectToMySQL(this.databaseFiles);
            const sql = `
            CREATE TABLE IF NOT EXISTS filesInfo (
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
            return { status: 'success', response: 'Created!' };
        }
        catch (err) {
            console.log(err);
            return { status: 'error', response: 'error' };
        }
    }

    uploadFile (data) {
        return new Promise((resolve, reject) => {
            let query = '';
            let values = data.data;
            const connection = this.connectToMySQL(this.databaseFiles);
            if (data.id) {
                query = `
                UPDATE filesInfo SET
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
                INSERT INTO filesInfo (
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

    removeFile(path) {
        return new Promise((resolve, reject) => {
            const sql = `
                DELETE FROM filesInfo WHERE path = ?;
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
            let sqlQuery = `SELECT * FROM filesInfo WHERE`;
        
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
            sqlQuery = `SELECT * FROM ${this.databaseFiles} WHERE 
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
                        element.uploadDateTime = clientDate.clientDate(formatDateTime(element.uploadDateTime));
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
        })
    }
}


module.exports = {
    classDB
};