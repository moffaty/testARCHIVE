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
        const form = new mxModalView({id: 'addFileModal', className: 'modal', tag: 'div' });
        form.SetContent(`
        <form id="addNewContent" action="/upload" method="post" enctype="multipart/form-data">
            <input type="hidden" id="path" name="path">
            <input type="hidden" id="id" name="id">
            <label for="fileName" style="margin-top: 0.625em">Имя документа:</label>
            <input type="text" id="fileName" name="fileName" required>
            <input type="hidden" id="fullName" name="fullName" value="1">
            <label for="file" id="labelFile" style="overflow: hidden; position: absolute; top:1;right: 20; margin-top:0.375em;">Выбрать файл</label>
            <input type="file" id="file" name="file" required placeholder="Выберите файл" style="cursor: pointer; opacity:0; overflow: hidden; position: absolute; top:0;right: 5; width: 19.7vh; margin-top:1.25em;">
            <label for="documentCategoryBD">Категория документа:</label>
            <select id="documentCategoryBD" name="documentCategoryBD">
                <option value="Спецификация">Спецификация</option>
                <option value="Документация">Документация</option>
                <option value="Эскиз">Эскиз</option>
                <option value="Не указано">Не указано</option>
            </select>
            <label for="decimalNumberBD">Децимальный номер:</label>
            <input type="text" id="decimalNumberBD" name="decimalNumberBD" style="text-transform: uppercase;">
            <label for="nameProjectBD">Название проекта:</label>
            <input type="text" id="nameProjectBD" name="nameProjectBD">
            <label for="organisationBD">Название организации:</label>
            <input type="text" id="organisationBD" name="organisationBD">
            <input type="hidden" id="createDateTime" name="createDateTime">
            <label for="editionNumberBD">Номер издания:</label>
            <input type="text" id="editionNumberBD" name="editionNumberBD">
            <label for="authorBD">Автор:</label>
            <input type="text" id="authorBD" name="authorBD">
            <label for="storageBD">Место хранения:</label>
            <input type="text" id="storageBD" name="storageBD">
            <label for="dirNumberBD">Номер папки:</label>
            <input type="text" id="dirNumberBD" name="dirNumberBD">
            <label for="publishDateBD">Дата издания:</label>
            <input class="w3-input" type="date" id="publishDateBD" name="publishDateBD" min="1900-01-01">
            <label for="notesBD">Примечание:</label>
            <textarea id="notesBD" name="notesBD"></textarea>
            <div class="button-wrapper">
            <button type="submit" style="right:100%">Отправить</button>
            <button class="modalButton" id="cancel-addfile">Отмена</button>
            </div>
        </form>
    `);
    form.SetStyles({ width: '40%' });
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
        const fullFileName = form.querySelector("#fullName");
        let ext = '';
        if (fileName.split('')[1]) {
            ext = '.' + fileName.split('.').pop();
        } 
        const createDateTimeInput = form.querySelector('#createDateTime');
        const currentDate = new Date();
        createDateTimeInput.value = currentDate.toISOString();
    
        const nameInput = form.querySelector('#fileName');
        if(liValues.includes(nameInput.value + ext)){
            event.preventDefault();        
            const userResponse = await confirm("Такое имя уже занято. Хотите записать этот файл как новую версию старого?");
            
            if (userResponse) {
                try {
                    const response1 = await fetch('/set-old-info', {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json"
                        },
                        body: JSON.stringify({ path: (pathToFile + nameInput.value + ext) })
                    });
                    if (!response1.ok) {
                        throw new Error('Не удалось получить ID файла');
                    }

                    const data1 = await response1.json();
                    if (data1) {
                        const id = data1[0].id;
                        console.log(id);
            
                        document.getElementById('id').value = id;
                        document.getElementById('path').value = pathToFile + nameInput.value + ext;
                        fullFileName.value = nameInput.value + ext;
                        event.target.submit();
                    }
                } catch (error) {
                    console.error('Произошла ошибка:', error);
                }
            }
        } else {
            document.getElementById('path').value = pathToFile + nameInput.value + ext;
            fullFileName.value = nameInput.value + ext;
        }
    })
    const cancelButton = form.querySelector("#cancel-addfile");

    cancelButton.addEventListener("click", function(event) {
        event.preventDefault();
        form.style.display = 'none';
    });

    // Устанавливаем фокус на первый инпут формы
    form.querySelector('input[type="text"]').focus();
})