// ANSI escape codes для цветов текста
const colorReset = '\x1b[0m';
const colorGray = '\x1b[90m';
const colorBlue = '\x1b[34m';
const colorGreen = '\x1b[32m';
const colorYellow = '\x1b[33m';
const colorWhite = '\x1b[37m';
const colors = {
    reset: colorReset, 
    gray: colorGray, 
    blue: colorBlue, 
    green: colorGreen, 
    yellow: colorYellow,
    white: colorWhite
}
/*
\e[40m	Black
\e[41m	Red
\e[42m	Green
\e[43m	Yellow
\e[44m	Blue
\e[45m	Purple
\e[46m	Cyan
\e[47m	White
*/
const bgBlack = '\x1b[40m';
const bgRed = '\x1b[41m';
const bgGreen = '\x1b[42m';
const bgYellow = '\x1b[43m';
const bgBlue = '\x1b[44m';
const bgPurple = '\x1b[45m';
const bgCyan = '\x1b[46m';
const bgWhite = '\x1b[47m';

const backgrounsColors = {
    black: bgBlack, 
    red: bgRed,
    blue: bgBlue, 
    green: bgGreen, 
    yellow: bgYellow,
    blue: bgBlue,
    cyan: bgCyan,
    white: bgWhite
}

module.exports = {
    colors, 
    backgrounsColors,
};
