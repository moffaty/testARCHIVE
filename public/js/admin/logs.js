function getLogsData() {
    const usersOperations = ['create', 'delete', 'edit'];
    const usersOperationsRU = ['Создать', 'Удалить', 'Изменить'];
    getData(usersOperations, usersOperationsRU, 'Logs');
} 