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
            { name: 'fileName', value: 'Имя документа', styles: "margin-top: 0.625em;", required: true  }, 
            { name: 'documentCategoryBD', element: 'select',  options: ['Спецификация', 'Документация', 'Эскиз', 'Не указано'] },
            { name: 'decimalNumberBD', value: 'Децимальный номер', required: false  }, 
            { name: 'nameProjectBD', value: 'Название проекта' }, 
            { name: 'organisationBD', value: 'Название организации' }, 
            { name: 'editionNumberBD', value: 'Номер издания' }, 
            { name: 'authorBD', value: 'Автор' }, 
            { name: 'storageBD', value: 'Место хранения' }, 
            { name: 'dirNumberBD', value: 'Номер папки' }, 
            { name: 'publishDateBD', value: 'Дата издания', type: 'date' }, 
            { name: 'notesBD', value: 'Примечание', element: 'textarea', styles: `resize: vertical; margin: 0` }, 
        ];
        const form = createForm('addNewFile', 'Отправить', [], inputs);   
        form.enctype = "multipart/form-data";
        const file = form.querySelector('#fileLabel');
        const fileLoader = form.elements['file'];
        const fileNameAdd = form.querySelector("#fileName");
        file.addEventListener('click', e => {
            fileLoader.click();
        })
        fileLoader.addEventListener('change', e => {
            const selectedFile = e.target.files[0];
            file.textContent = selectedFile.name;
            fileNameAdd.style.width = '90%';
        })
        file.textContent = 'Выберите файл';
        form.autocomplete = 'off';
        const submitButton = form.elements['submit'];
        submitButton.id = 'submitAddFile';
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Отмена';
        cancelButton.classList.add('modalButton');
        cancelButton.style.marginRight = 0;
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('button-wrapper');
        buttonWrapper.appendChild(submitButton);
        buttonWrapper.appendChild(cancelButton);
        const inputWithAddon = document.createElement('div');
        inputWithAddon.className = 'input-with-addon';
        const addonText = document.createElement('span');
        addonText.className = 'addonText';
        addonText.textContent = ' ';
        fileNameAdd.flex = 1;
        inputWithAddon.appendChild(fileNameAdd);
        inputWithAddon.appendChild(addonText);
        form.insertBefore(inputWithAddon, fileLoader);
        form.appendChild(buttonWrapper);
        const modal = new mxModalView({id: 'addFileModal', className: 'modal', tag: 'div' });
        modal.appendChild(form);
        document.getElementById('addNewFile').addEventListener('submit', async e => {
            e.preventDefault();
            if(decimalNumberBDInput.value.replace(decimalNumberBDregex,'').length < 13 && documentCategoryBDInput.value !== 'Не указано' && documentCategoryBDInput.value !== 'Эскиз'){
                return alert('Децимальный номер введен неверно');
            }
            decimalNumberBDInput.value = decimalNumberBDInput.value.toUpperCase();
            if (addonText.textContent.length > 0) {
                fileNameAdd.value += '.' + addonText.textContent;
            }
            const formData = new FormData(form);
            const filePath = getCurrentPath() + '/' + fileNameAdd.value;
            formData.append('path', filePath);
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                const notify = new mxNotify(data.status, data.response);
                modal.DoCloseModal();
                init.updatePanels();
            } 
            // TODO: закрыть форму - вызывать обновление списка
        });
        modal.SetStyles({ width: '40%', maxHeight: '100%', paddingBottom: 8 });
        const decimalNumberBDInput = modal.querySelector('#decimalNumberBD');
        const documentCategoryBDInput = modal.querySelector('#documentCategoryBD');

        // mymask.js
        documentCategoryBDInput.onchange = () => { MaskForCategories(documentCategoryBDInput, decimalNumberBDInput); };
        MaskForCategories(documentCategoryBDInput, decimalNumberBDInput);

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
        modal.querySelector("#publishDateBD").setAttribute("max", today);

        function getFileExtension(fileName) {
            const regex = /(?:\.([^.]+))?$/;
            const extension = regex.exec(fileName)[1];
            return extension ? extension.toLowerCase() : "";
        }

        function updateFileName() {
            const fileNameInput = modal.querySelector("#file");
            let fileName = fileNameInput.value.split("\\").pop(); // получаем имя файла из абсолютного пути
            const ext = getFileExtension(fileName);
            fileName = fileName.substr(0, fileName.indexOf(ext) - 1);
            const fileNameAdd = modal.querySelector("#fileName");
            addonText.textContent = ext;
            // if (modal.querySelector("#fileName").value === "") {
                fileNameAdd.value = fileName; // устанавливаем имя файла без расширения в поле "Имя документа"
            // }
        } 

        const uploadLabel = modal.querySelector('#file');
        uploadLabel.onchange = updateFileName;
        updateFileName();
        // modal.element.addEventListener("submit",async (event) => {
        //     if(decimalNumberBDInput.value.replace(decimalNumberBDregex,'').length < 13 && documentCategoryBDInput.value !== 'Не указано' && documentCategoryBDInput.value !== 'Эскиз'){
        //         event.preventDefault();
        //         return alert('Децимальный номер введен неверно');
        //     }
        //     decimalNumberBDInput.value = decimalNumberBDInput.value.toUpperCase();
        //     event.preventDefault();
        //     fetch('/upload', {
        //         method: 'POST',
        //         body: formdata
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log(data);
        //         const notify = new mxNotify(data.status, data.response);
        //         modal.DoCloseModal();
        //     })
        // })
        cancelButton.addEventListener("click", function(event) {
            event.preventDefault();
            modal.DoCloseModal();
        });

        // Устанавливаем фокус на первый инпут формы
        modal.querySelector('input[type="text"]').focus();
})