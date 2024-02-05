function getServData() {
    const usersOperations = ['database'];
    const usersOperationsRU = ['База данных'];
    adminPanel.getData(usersOperations, usersOperationsRU, 'Serv');
} 

function databaseServ() {
    const rightPanel = panels._getRightPanel();
    if (document.getElementById('databaseServ')) {
        return;
    }
    console.log(document.getElementById('databaseServ'));
    const dataDiv = document.createElement('div');
    dataDiv.id = 'databaseServ';
    adminPanel.clearElement(rightPanel);
    fetch('/get-database-status')
    .then(response => response.json())
    .then(data => {
        const changeButton = adminPanel.createButton('Изменить подключение к бд');
        dataDiv.appendChild(changeButton);
        changeButton.addEventListener('click', e => {
            fetch('/get-db-connection-info')
            .then(response => response.json())
            .then(data => {
                data = JSON.parse(data);
                console.log(data);
                const changeConnectionForm = new mxModalView({id: 'changeConnection', className: 'modal', tag: 'div'});
                const form = adminPanel.createForm('changeConnection', 'Изменить подключение', data, 'host', 'user', 'password', 'port');
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const host = form.elements['host'].value;
                    const user = form.elements['user'].value;
                    const password = form.elements['password'].value;
                    const port = form.elements['port'].value;
                    fetch('/change-connect-db', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ host, user, password, port })
                    })
                    .then(response => response.json())
                    .then(data => { 
                        adminPanel.dataResponse(data.response, form);
                    })
                })
                changeConnectionForm.appendChild(form);
            })
        })
        const notify = new mxNotify(data.status);
        const text = document.createElement('h3');
        text.textContent = data.response;
        notify.AddPopupContent(text);
        rightPanel.appendChild(changeButton);
        if (data.status === 'success') {
            const fileTable = adminPanel.createButton('Создать таблицу файлов', 'files');
            const userTable = adminPanel.createButton('Создать таблицу пользователей', 'users');
            const buttons = [fileTable, userTable];
            buttons.forEach(button => {
                dataDiv.appendChild(button);
                button.addEventListener('click', e => {
                    adminPanel.createTable(button.id);
                })
                rightPanel.appendChild(button);
            })
        }
        rightPanel.appendChild(dataDiv);
    })
}
