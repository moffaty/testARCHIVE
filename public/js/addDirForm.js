// Получаем элементы кнопки и модального окна
const addDirOpenModalBtn = document.getElementById("addDirModalButton");

// Добавляем обработчик события на кнопку
addDirOpenModalBtn.addEventListener("click", function() {
    const addDirModalForm = new mxModalView({id: 'addDirModal', className: 'modal', tag: 'div'})
    addDirModalForm.SetContent(`
    <div class="modal-content">
        <form method="POST" action="/add" style="text-align: center; margin:0" autocomplete="off">
            <input type="hidden" id="pathInput" name="path" value="${dirPath}">
            <label for="dirName">Введите название новой папки:</label>
            <input type="text" id="dirNameInput" name="dirName" required>
            <button type="submit">Создать папку</button>
        </form>
    </div>`);

    const folderNameInput = addDirModalForm.getElementById("dirNameInput");

    folderNameInput.addEventListener('keydown', function(event) {
        if (disallowedChars.includes(event.key) || disallowedChars.includes(event.code)) {
        event.preventDefault();
        }
    });

    // Устанавливаем фокус на первый инпут формы
    addDirModalForm.querySelector('input[type="text"]').focus();
});