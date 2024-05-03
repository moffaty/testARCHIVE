const fs = require('fs');
const path = require('path');
let clear = false;
let logDir = path.resolve(__dirname, '../logs');
const loginLogFile = 'authlogs.csv';
// Получение аргументов из запуска
const clearLogs = process.argv[2];
const { colors, backgroundColors } = require('./color');

// Получаем аргумент, смотрим, если он clear_logs - очищаем текущие (текущий день) логи
// P.S - пока не работает
if(clearLogs){
    if(clearLogs === 'clear_logs'){
        clear = true;
    } 
}

// Создание необходимой папки для логирования
function createLogDir() {
    fs.mkdir(logDir, (err) => {
        if (!err || err.code === 'EEXIST') {
            const contDate = getFormattedDate();
            const pathToContDir = path.join(logDir, contDate);
            if (!fs.existsSync(pathToContDir)) {
                fs.mkdir(pathToContDir, (err) => {
                    if (!err || err.code === 'EEXIST') {
                        logDir = pathToContDir;
                        fs.appendFile(path.join(pathToContDir, loginLogFile), "NAME,DATE,TIME,IP\n", (err) => {});
                    }
                });
            } else {
                if (!clear) {
                    if (!fs.existsSync(path.join(pathToContDir, loginLogFile))) {
                        fs.appendFile(path.join(pathToContDir, loginLogFile), "NAME,DATE,TIME,IP\n", (err) => {});
                    }
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
    const contDate = getFormattedDate();
    const log = `${timeString}, ${data.join(',')} \n`;
    fs.appendFile(path.join(logDir, contDate, filename), log, (err) => {
        if (err) {
            return logLogs(`Не удалось записать в лог - ${err}`);
        }
        logLogs("Данные успешно записаны в лог!");
    });
}

function loginLog(username, ip) {
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const contDate = getFormattedDate();
    const log = `${username}, ${contDate}, ${timeString}, ${ip} \n`;
    fs.appendFile(path.join(logDir, contDate, loginLogFile), log, (err) => {
        if (err) {
            return logLogs(`Не удалось записать в лог - ${err}`);
        }
        logLogs("data of auth logged");
    });
}

function log(where, message) {
    const trace = new Error().stack.split('\n')[3];
    const func = trace.substring(trace.indexOf('at') + 2, trace.indexOf('('));
    const line = path.basename(trace.substring(trace.indexOf('(')).replace(')', ''));
    const time = new Date();
    const log = { time, where, function: func.trim(), line: line, message };

    // Форматирование и вывод сообщения
    const formattedLog = JSON.stringify(log);
    const colorfulLog = `${colors['gray']}[${log.time.toISOString()}]${colors['reset']} ${colors['blue']}${log.where}${colors['reset']} ${colors['yellow']}${log.line}${colors['reset']} ${colors['green']}function:${log.function}${colors['reset']}=>${colors['white']}${log.message}${colors['reset']}`;
    console.log(colorfulLog);
}

function getFunctionName() {
    const trace = new Error().stack.split('\n')[2];
    const func = trace.substring(trace.indexOf('at') + 2, trace.indexOf('('));
    return func;
}

function serverLogs(...message) {
    log('APP', message.join(' '));
}

function dbLogs(...message) {
    log('DB', message.join(' '));
}

function logLogs(...message) {
    log('LOG', message.join(' '));
}

module.exports = {
    addToLog,
    createLogDir,
    serverLogs,
    loginLog,
    dbLogs,
    getFunctionName
};
