function getServData() {
    const usersOperations = ['database'];
    const usersOperationsRU = ['База данных'];
    getData(usersOperations, usersOperationsRU, 'Serv');
} 

function databaseServ() {
    const rightPanel = panels._getRightPanel();
    fetch('/get-database-status')
    .then(response => response.json())
    .then(data => {
        const changeButton = document.createElement('button');
        changeButton.classList.add('adminButtons'); 
        changeButton.classList.add('modalButton'); 
        changeButton.textContent = 'Изменить подключение к бд';
        changeButton.addEventListener('click', e => {
            fetch('/get-db-connection-info')
            .then(response => response.json())
            .then(data => {
                const changeConnectionForm = new mxModalView({id: 'changeConnection', className: 'modal', tag: 'div'});
                const form = createForm('changeConnection', 'Изменить подключение', data, 'host', 'user', 'password', 'port');
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
                        dataResponse(data.response, form);
                    })
                })
                changeConnectionForm.appendChild(form);
            })
        })
        rightPanel.appendChild(changeButton);
        dataResponse(data.response, rightPanel);
    })
}
