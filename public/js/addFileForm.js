let liValues = [];
document.addEventListener('DOMContentLoaded', () => {
    const centerDirElements = centerDir.querySelectorAll('li');

    for (let i = 0; i < centerDirElements.length; i++) {
        const liValue = centerDirElements[i].textContent.trim();
        liValues.push(liValue);
    }
    });

    // Получаем элементы кнопки и модального окна
    const addFileOpenModalBtn = document.getElementById("addFileModalButton");

    // Добавляем обработчик события на кнопку
    addFileOpenModalBtn.addEventListener("click", () => {
        const inputs = [ // styles: "cursor: pointer; opacity:0; overflow: hidden; position: absolute; top:0;right: 5; width: 19.7vh; margin-top:1.25em;"
            { name: 'fileLabel', element: 'label', styles: 'width:100%; margin: 0', classNames: 'modalButton', required: true }, 
            { name: 'file', type: 'file', value: 'Выберите файл', styles: 'display:none;', classNames: 'modalButton' },
            { name: 'fileName', value: 'Имя документа', styles: "margin-top: 0.625em", required: true  }, 
            { name: 'documentCategoryBD', element: 'select',  options: ['Спецификация', 'Документация', 'Эскиз', 'Не указано'] },
            { name: 'decimalNumberBD', value: 'Децимальный номер', required: true  }, 
            { name: 'nameProjectBD', value: 'Название проекта' }, 
            { name: 'organisationBD', value: 'Название организации' }, 
            { name: 'editionNumberBD', value: 'Номер издания' }, 
            { name: 'authorBD', value: 'Автор' }, 
            { name: 'storageBD', value: 'Место хранения' }, 
            { name: 'dirNumberBD', value: 'Номер папки' }, 
            { name: 'publishDateBD', value: 'Дата издания', type: 'date' }, 
            { name: 'notesBD', value: 'Примечание', element: 'textarea', styles: `resize: vertical; margin: 0` }, 
        ];
        const form1 = createForm('addNewFile', 'Отправить', [], inputs);
        const file = form1.querySelector('#fileLabel');
        const fileLoader = form1.elements['file'];
        file.addEventListener('click', e => {
            fileLoader.click();
        })
        fileLoader.addEventListener('change', e => {
            const selectedFile = e.target.files[0];
            file.textContent = selectedFile.name;
        })
        file.textContent = 'Выберите файл';
        form1.autocomplete = 'off';
        const submitButton = form1.elements['submit'];
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Отмена';
        cancelButton.classList.add('modalButton');
        cancelButton.style.marginRight = 0;
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('button-wrapper');
        buttonWrapper.appendChild(submitButton);
        buttonWrapper.appendChild(cancelButton);
        form1.appendChild(buttonWrapper);
        const form = new mxModalView({id: 'addFileModal', className: 'modal', tag: 'div' });
        form.appendChild(form1);
        document.getElementById('addNewFile').addEventListener('submit', async e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
            } 
            // TODO: закрыть форму - вызывать обновление списка
        });
        form.SetStyles({ width: '40%', maxHeight: '100%', paddingBottom: 8 });
        const decimalNumberBDInput = form.querySelector('#decimalNumberBD');
        const documentCategoryBDInput = form.querySelector('#documentCategoryBD');

        // mymask.js
        documentCategoryBDInput.onchange = () => { MaskForCategories(documentCategoryBDInput, decimalNumberBDInput); };
        MaskForCategories(documentCategoryBDInput, decimalNumberBDInput);

        const fileNameAdd = form.querySelector("#fileName");

        fileNameAdd.addEventListener('keydown', (event) => {
            if (disallowedChars.includes(event.key) || disallowedChars.includes(event.code)) {
                event.preventDefault();
            }
        });

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;
        form.querySelector("#publishDateBD").setAttribute("max", today);
        function updateFileName() {
            const fileNameInput = form.querySelector("#file");
            let fileName = fileNameInput.value.split("\\").pop(); // получаем имя файла из абсолютного пути
            let nameWithoutExtension = fileName.replace(/\.[^/.]+$/, ""); // удаляем расширение из имени файла

            const fileNameAdd = form.querySelector("#fileName");

            if (form.querySelector("#fileName").value === "") {
                fileNameAdd.value = nameWithoutExtension.replace(/' '/gi, '_'); // устанавливаем имя файла без расширения в поле "Имя документа"
            }
        } 

        const uploadLabel = form.querySelector('#file');
        uploadLabel.onchange = updateFileName;
        updateFileName();
        let pathToFile = window.location.pathname;

        form.element.addEventListener("submit",async (event) => {
            if(decimalNumberBDInput.value.replace(decimalNumberBDregex,'').length < 13 && documentCategoryBDInput.value !== 'Не указано' && documentCategoryBDInput.value !== 'Эскиз'){
                event.preventDefault();
                alert('Децимальный номер введен неверно');
            }
            decimalNumberBDInput.value = decimalNumberBDInput.value.toUpperCase();
            let fileName = form.querySelector("#file").value.split("\\").pop(); // получаем имя файла из абсолютного пути

            // Собираем полное имя файла с расширением
            const createDateTimeInput = form.querySelector('#createDateTime');
            const currentDate = new Date();
            createDateTimeInput.value = currentDate.toISOString();
        
            const nameInput = form.querySelector('#fileName');
        })
        cancelButton.addEventListener("click", function(event) {
            event.preventDefault();
            form.style.display = 'none';
        });

        // Устанавливаем фокус на первый инпут формы
        form.querySelector('input[type="text"]').focus();
})