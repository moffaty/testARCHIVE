// Получаем элементы кнопки и модального окна
const addDirOpenModalBtn = document.getElementById("addDirModalButton");

// Добавляем обработчик события на кнопку
addDirOpenModalBtn.addEventListener("click", function() {
    const form = createForm('createDir', 'Создать папку', [], { name:'dirName', required: true, value: 'Название новой директории' })
    const addDirModalForm = new mxModalView({id: 'addDirModal', className: 'modal', tag: 'div'})
    addDirModalForm.appendChild(form);

    const folderNameInput = form.elements['dirName'];

    folderNameInput.addEventListener('keydown', function(event) {
        if (disallowedChars.includes(event.key) || disallowedChars.includes(event.code)) {
            event.preventDefault();
        }
    });

    form.addEventListener('submit', e => {
        const dirName = folderNameInput.value;
        e.preventDefault();
        fetch('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dirName, path: '/main_dir' })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const notify = new mxNotify(data.status);
            const text = document.createElement('h3');
            text.textContent = 'Директория создана!';
            notify.AddPopupContent(text);
            addDirModalForm.DoCloseModal();
            // TODO: update center list
        })
    })

    // Устанавливаем фокус на первый инпут формы
    addDirModalForm.querySelector('input[type="text"]').focus();
});