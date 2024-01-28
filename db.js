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
    
    getPropertiesByPath(path) {
        const connection = connectToMySQL('files');
        if (!connection) {
            return { status: "error" };
        }
        connection.query(`
                SELECT 
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
                GROUP BY fi.id; `, [path],
                (err, results, fields) => {
                    if(results){
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
                        return {status: 'success', response: matchingResults};
                    }
                }
            );
        connection.end((err) => { if (err) { return console.dir(`Ошибка закрытия подключение к БД: ${err.message}`); } });
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
}


module.exports = {
    classDB
};