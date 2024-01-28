function getLogsData() {
    const usersOperations = ['create', 'delete', 'edit'];
    const usersOperationsRU = ['Создать', 'Удалить', 'Изменить'];
    adminPanel.getData(usersOperations, usersOperationsRU, 'Logs');
} 