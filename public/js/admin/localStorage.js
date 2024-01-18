function loadCenter() {
    let option = localStorage.getItem('option');
    if (!option) {
        return;
    }
    eval('get' + option + 'Data()');
}


loadCenter();