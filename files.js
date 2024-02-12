function upload (data) {
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
    const id = data.id;
    const fileName = data.fileName;
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
    const path = checkIsEmptyDate(data.path);
    
    const now = new Date();
    const moscowOffset = 3 * 60;

    const moscowTime = new Date(now.getTime() + moscowOffset * 60 * 1000);

    const formatNumber = num => (num < 10 ? `0${num}` : num);

    const uploadDateTime = `${moscowTime.getUTCFullYear()}-${formatNumber(moscowTime.getUTCMonth() + 1)}-${formatNumber(moscowTime.getUTCDate())} ${formatNumber(moscowTime.getUTCHours())}:${formatNumber(moscowTime.getUTCMinutes())}:${formatNumber(moscowTime.getUTCSeconds())}`;

    const result = { id: id, data:[
        fileName, decimalNumberBD, 
        nameProjectBD, organisationBD, 
        editionNumberBD, authorBD, 
        storageBD, documentCategoryBD, 
        dirNumberBD, publishDateBD, 
        notesBD, path, uploadDateTime
    ]};

    return result;
}

function remove (fs, filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                return reject ({ status: 'error', response: 'Файл не найден' });
            }
            return resolve ({ status: 'success', response: 'Файл удален из директории' });
        })
    })
}

function mkdir (fs, dirPath) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dirPath, (err) => {
            if (err) {
                return reject ({ status: 'error', response: 'Error creating directory' });
            } else {
                return resolve ({ status: 'success', response: 'Directory created!' });
            }
        });
    })
}

async function rename(fs, oldPath, newPath) {
    try {
        await fs.access(newPath, fs.constants.F_OK);
        return { status: 'error' }; 
    } catch (error) {
        await fs.rename(oldPath, newPath, (err) => { console.log(err) });
        return { status: 'success' }; 
    }
}

async function removeDir(fs, path, options = {}) {
    return new Promise((resolve, reject) => {
        fs.rmdir(path, options, (error) => {
            if (error) {
                if (error.code === 'ENOTEMPTY') {
                    return reject({status: 'error', response: 'Директория не пуста. Удалите содержание перед удалением!'});
                }
                else {
                    return reject({status: 'error', response: 'Директория не найдена!'});
                }
            }
            return resolve({status: 'success', response: 'Директория удалена!'});
        })
    })
}

module.exports = {
    upload,
    remove,
    mkdir,
    rename,
    removeDir
};