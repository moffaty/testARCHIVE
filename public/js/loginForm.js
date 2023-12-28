// Получаем элементы кнопки и модального окна
const loginOpenModalBtn = document.getElementById("loginModalButton");
loginOpenModalBtn.addEventListener('click', (event) => {
    const loginFormModal = new mxModalView({ id: 'loginFormModal', className: 'modal', tag: 'div' });
    fetch('/get-info-of-registration', {})
        .then((response) => response.json())
        .then((data) => {
            const userName = data && data['name'] ? data['name'] : 'гость';
            const buttonText = userName === 'гость' ? 'Войти в аккаунт' : 'Выйти из аккаунта';

            loginFormModal.SetContent(`
                <div id="exitForm" class="modal-content">
                    <span style="display:flex;justify-content:space-around">Привет ${userName}!</span><br>
                    <button id="exitFromAccount" class="modalButton">${buttonText}</button>
                </div>`);
                
            const exitFromAccount = loginFormModal.querySelector('#exitFromAccount');
            exitFromAccount.addEventListener('click', (event) => {
                fetch('/loggout').then((response) => (window.location.href = '/auth'));
            });
        });
})