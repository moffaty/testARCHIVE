const mysql = require('mysql2');
const fs = require('fs');

class classDB {
    constructor(dbFile) {
        const dataDB = fs.readFileSync(dbFile, 'utf8');
        // Parse the JSON data
        const jsonData = JSON.parse(dataDB);

        this.hostDB = jsonData.host;
        this.userDB = jsonData.user;
        this.passwordDB = jsonData.password;
        this.portDB = jsonData.port;

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
            const connection = this.connectToMySQL('files');

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
                            element.publish_date = clientDate(element.publish_date);
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
    
    createUsersTable() {
        try {
            const connection = this.connectToMySQL('personals');
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

    createFilesTable() {
        try {
            const connection = this.connectToMySQL('files');
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
            console.log(values);
            const connection = this.connectToMySQL('files');
        
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
                        return reject ({ status: 'error', response: error });
                    } 
                    else {
                        return reject ({ status: 'success', response: results });
                    }
                });
            connection.end((err) => { if (err) { return reject ({ status: 'error' }); }});
        })
        
    }
}


module.exports = {
    classDB
};