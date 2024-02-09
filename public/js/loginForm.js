// Получаем элементы кнопки и модального окна
const loginOpenModalBtn = document.getElementById("loginModalButton");
loginOpenModalBtn.addEventListener('click', (event) => {
    const loginFormModal = new mxModalView({ id: 'loginFormModal', className: 'modal', tag: 'div' });
    fetch('/get-info-of-registration', {})
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const userName = data && data['username'] ? data['username'] : 'гость';
            const userPosition = data && data['position'] ? data['position'] : 'гость';
            const buttonAccs = userName === 'гость' ? 'Войти в аккаунт' : 'Выйти из аккаунта';
            const buttonSubs = 'Показать подписки';
            const buttonInst = 'Ознакомиться с инструкцией';

            loginFormModal.SetContent(`
                <div id="exitForm" style="display:flex; flex-direction: column">
                    <p style="display:flex;justify-content:space-around">Здравствуйте, ${userName}! Ваша позиция: ${userPosition}</p>
                    <button id="instructionButton" onclick="openInstructionWindow()" class="modalButton">${buttonInst}</button>
                    <button id="showSubscriptions" class="modalButton">${buttonSubs}</button>
                    <button id="exitFromAccount" class="modalButton">${buttonAccs}</button>
                </div>`);
                
            const exitFromAccount = loginFormModal.querySelector('#exitFromAccount');
            exitFromAccount.addEventListener('click', (event) => {
                fetch('/logout').then((response) => (window.location.href = '/'));
            });
        });
})