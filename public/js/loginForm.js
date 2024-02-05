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
            const buttonInst = 'Ознакомиться с инструкцией';

            loginFormModal.SetContent(`
                <div id="exitForm" style="display:flex; flex-direction: column">
                    <p style="display:flex;justify-content:space-around">Привет ${userName}!</p>
                    <button id="instructionButton" onclick="openInstructionWindow()" class="modalButton">${buttonInst}</button>
                    <button id="exitFromAccount" class="modalButton">${buttonText}</button>
                </div>`);
                
            const exitFromAccount = loginFormModal.querySelector('#exitFromAccount');
            exitFromAccount.addEventListener('click', (event) => {
                fetch('/logout').then((response) => (window.location.href = '/'));
            });
        });
})