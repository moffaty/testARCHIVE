const db = require('./db');

function upload (upload, data) {
    const checkIsEmpty = (value) => {
        return value === '' ? 0 : value;
    }

    const checkIsEmptyDate = (date) => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // добавляем ведущий ноль для однозначных месяцев
        const day = currentDate.getDate().toString().padStart(2, '0'); // добавляем ведущий ноль для однозначных дней
        const formattedDate = `${year}-${month}-${day}`;
        return date === '' ? formattedDate : date;
    }

    let query = '';
    let values = [];
    const id = data.id;
    const fileName = data.fullName;
    const decimalNumberBD = data.decimalNumberBD;
    const nameProjectBD = data.nameProjectBD;
    const organisationBD = data.organisationBD;
    const editionNumberBD = checkIsEmpty(data.editionNumberBD);
    const authorBD = data.authorBD;
    const storageBD = data.storageBD;
    const documentCategoryBD = data.documentCategoryBD;
    const dirNumberBD = checkIsEmpty(data.dirNumberBD);
    const publishDateBD = checkIsEmptyDate(data.publishDateBD);
    const notesBD = data.notesBD;
    const path = data.path;

    const connection = connectToMySQL('files');

    const now = new Date();
    const moscowOffset = 3 * 60;

    const moscowTime = new Date(now.getTime() + moscowOffset * 60 * 1000);

    const formatNumber = num => (num < 10 ? `0${num}` : num);

    const uploadDateTime = `${moscowTime.getUTCFullYear()}-${formatNumber(moscowTime.getUTCMonth() + 1)}-${formatNumber(moscowTime.getUTCDate())} ${formatNumber(moscowTime.getUTCHours())}:${formatNumber(moscowTime.getUTCMinutes())}:${formatNumber(moscowTime.getUTCSeconds())}`;

    if (id) {
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
        values = [
            fileName,
            decimalNumberBD,
            nameProjectBD,
            organisationBD,
            editionNumberBD,
            authorBD,
            storageBD,
            documentCategoryBD,
            dirNumberBD,
            publishDateBD,
            notesBD,
            path,
            uploadDateTime,
            id,
        ];
    }
    else {
        query = `
        INSERT INTO filesInfo (
            fileName, decimalNumber, nameProject, organisation, editionNumber, author, storage,
            documentCategory, dirNumber, publish_date, notes, path, uploadDateTime
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        values = [
            fileName,
            decimalNumberBD,
            nameProjectBD,
            organisationBD,
            editionNumberBD,
            authorBD,
            storageBD,
            documentCategoryBD,
            dirNumberBD,
            publishDateBD,
            notesBD,
            path,
            uploadDateTime,
        ];
    }

    connection.query(query, values,
        (error) => {
            if(error) {
                console.log('Ошибка при выполнении запроса: ', error.message);
            } 
            else {
                console.log('Данные успешно добавлены в таблицу filesInfo');
            }
        });
    connection.end((err) => { if (err) { return console.dir(`Ошибка закрытия подключение к БД: ${err.message}`); }});
}

module.exports = {
    upload
};