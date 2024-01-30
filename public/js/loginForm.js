// Получаем элементы кнопки и модального окна
const loginOpenModalBtn = document.getElementById("loginModalButton");
loginOpenModalBtn.addEventListener('click', (event) => {
    const loginFormModal = new mxModalView({ id: 'loginFormModal', className: 'modal', tag: 'div' });
    fetch('/get-info-of-registration', {})
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const userName = data && data['username'] ? data['username'] : 'гость';
            const buttonText = userName === 'гость' ? 'Войти в аккаунт' : 'Выйти из аккаунта';

            loginFormModal.SetContent(`
                <div id="exitForm">
                    <span style="display:flex;justify-content:space-around">Привет ${userName}!</span><br>
                    <button id="exitFromAccount" class="modalButton">${buttonText}</button>
                </div>`);
                
            const exitFromAccount = loginFormModal.querySelector('#exitFromAccount');
            exitFromAccount.addEventListener('click', (event) => {
                fetch('/logout').then((response) => (window.location.href = '/'));
            });
        });
})