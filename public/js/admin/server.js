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
        dataResponse(data.response, rightPanel);
        if (data.status !== 'error') {
            return;
        }
        const changeButton = document.createElement('button');
        changeButton.classList.add('adminButtons'); 
        changeButton.classList.add('modalButton'); 
        changeButton.textContent = 'Изменить подключение к бд';
        rightPanel.appendChild(changeButton);
    })
}