const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.post('/get-dir-info', async (req, res) => {
    const dirPath = path.join(__dirname, req.body.path);
    
    try {
        const files = fs.readdirSync(dirPath);
        const data = [];

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            const isDirectory = stats.isDirectory();

            data.push({
                name: file,
                type: isDirectory ? 'directory' : 'file',
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Произошла ошибка:', error);
        res.status(500).json({ error: 'Ошибка чтения директории' });
    }
});

app.listen(3100, () => {
    console.log('Started http://localhost:3100')
})