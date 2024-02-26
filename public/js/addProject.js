// Получаем элементы кнопки и модального окна
const addProjectModalButton = document.getElementById("addProjectModalButton");
// Добавляем обработчик события на кнопку
addProjectModalButton.addEventListener("click",  projectFunction);

function projectFunction() {
    const form = createForm('createProject', 'Создать проект', [], { name:'projectName', required: true, value: 'Название нового проекта' })
    const addDirModalForm = new mxModalView({id: 'addProjectModal', className: 'modal', tag: 'div'})
    addDirModalForm.appendChild(form);
    form.style.display = 'flex';
    form.style.justifyContent = 'center';
    form.style.flexWrap = 'wrap';
    const folderNameInput = form.elements['projectName'];

    folderNameInput.addEventListener('keydown', function(event) {
        if (disallowedChars.includes(event.key) || disallowedChars.includes(event.code)) {
            event.preventDefault();
        }
    });

    form.addEventListener('submit', e => {
        const projectName = folderNameInput.value;
        e.preventDefault();
        fetch('/add-project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectName, path: init.getCurrentPath() })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const notify = new mxNotify(data.status);
            const text = document.createElement('h3');
            text.textContent = 'Проект создана!';
            notify.AddPopupContent(text);
            addDirModalForm.DoCloseModal();
            // TODO: update center list- DONE
            init.updatePanels();
        })
    })

    // Устанавливаем фокус на первый инпут формы
    addDirModalForm.querySelector('input[type="text"]').focus();
} 