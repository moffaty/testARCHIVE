const fs = require('fs');
const path = require('path');
let clear = false;
let logDir = './logs';
// Получение аргументов из запуска
const clearLogs = process.argv[2];

// Получаем аргумент, смотрим, если он clear_logs - очищаем текущие (текущий день) логи
// P.S - пока не работает
if(clearLogs){
    if(clearLogs === 'clear_logs'){
        clear = true;
    } 
}

// Создание необходимой папки для логирования
function createLogDir() {
    fs.mkdir(path.join(__dirname, 'logs'), (err) => {
        if (!err || err.code === 'EEXIST') {
            const contDate = getFormattedDate();
            const pathToContDir = path.join(__dirname, 'logs', contDate);
            if (!fs.existsSync(pathToContDir)) {
                fs.mkdir(pathToContDir, (err) => {
                    if (!err || err.code === 'EEXIST') {
                        logDir = pathToContDir;
                        fs.appendFile(path.join(pathToContDir, 'authlogs.csv'), "NAME,DATE,TIME,IP\n", (err) => {});
                    }
                });
            } else {
                if (!clear) {
                    if (!fs.existsSync(path.join(pathToContDir, 'authlogs.csv'))) {
                        fs.appendFile(path.join(pathToContDir, 'authlogs.csv'), "NAME,DATE,TIME,IP\n", (err) => {});
                    }
                    logDir = pathToContDir;
                }
            }
        }
    });
}

// функция для получения даты в формате ДДММГГ
function getFormattedDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    return month + day + year;
}

// Вызываем функцию createLogDir сразу при импорте
createLogDir();

/**
 * Append data to a log file with a timestamp and specified format.
 *
 * @param {string} filename The name of the log file (without path).
 * @param {Array|string} data The data to be appended to the log. Till one lenght array
 *
 * @example
 * // Usage example:
 * addToLog('auth.log', [ 'user123' ]);
 * addToLog('move.log', [ 'filePath' ]);
 */
function addToLog(filename, data) {
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    console.dir(filename, data);
    fs.appendFile(path.join(logDir, filename), `${accName}, ${timeString}, ${data.join(',')} \n`, (err) => {
        if (err) {
            return console.dir(`Не удалось записать в лог - ${err}`);
        }
        console.dir("Данные успешно записаны в лог!");
    });
}

module.exports = {
    addToLog,
    createLogDir
};
