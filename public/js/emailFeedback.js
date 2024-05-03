// Получаем элементы кнопки и модального окна
const emailFeedbackbutton = document.getElementById("emailFeedbackbutton");
// Добавляем обработчик события на кнопку
emailFeedbackbutton.addEventListener("click", () => {
const emailFeedbackForm = new mxModalView({ id:'emailFeedback',className:'modal',tag:'div' });
emailFeedbackForm.SetContent(`
    <div>
        <form id="contact-form" action="/send" method="post">
        <label>Сообщите об ошибке:</label>
        <input type="text" name="name" placeholder="Ваше имя"><br><br>
        <textarea name="message" placeholder="Ваше сообщение" style="width: 100%;"></textarea><br><br>
        <button type="submit" style="margin: 0 auto; display: block">Отправить</button>
        </form>
    </div>
    </div>  `);
    // Устанавливаем фокус на первый инпут формы
    emailFeedbackForm.querySelector('input[type="text"]').focus();
});