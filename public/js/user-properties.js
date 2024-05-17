function getCurrentPath() {
    return localStorage.getItem('currentPath') ? localStorage.getItem('currentPath') : init.main_dir;
}
function prop() {
    let fetchDel;


function createInputRow(label, inputId, value, type = 'text') {
    return `
        <tr>
            <td>${label}:</td>
            <td><input type="${type}" id="${inputId}" value="${value}"${type === 'date' ? ' class="w3-input"' : ''} required autocomplete="off" disabled></td>
        </tr>
    `;
}

function createTextAreaRow(label, textareaId, value) {
    return `
        <tr>
            <td>${label}:</td>
            <td><textarea id="${textareaId}" class="propTextarea" disabled>${value}</textarea></td>
        </tr>
    `;
}

function createHiddenInput(inputId, value) {
    return `<input type="hidden" id="${inputId}" value="${value}" disabled>`;
}

function createLabel(text) {
    const label = document.createElement('label');
    label.textContent = text;
    label.style.textAlign = 'center';
    return label;
}

function createInput(value, id, type, required, title) {
    const input = document.createElement('input');
    input.value = value;
    input.id = id;
    input.type = type;
    input.required = required;
    input.title = title;
    return input;
}

function createButton(className, id, textContent) {
    const button = document.createElement('button');
    button.className = className;
    button.id = id;
    button.textContent = textContent;
    return button;
}

function renameFunction(filePath, fileName, fileSitePath, renameFileButton) {
    const renameFileModal = new mxModalView({id:'renameFileModal',className:'modal'});
    const label = createLabel('Введите новое имя для папки:');
    const input = createInput(fileName, 'new-file-name', 'text', true, 'Запрещено использовать: слеши (/ и \\)');
    const buttonconfirm = createButton('modalButton', 'confirm-rename', 'Переименовать');
    const buttoncancel = createButton('modalButton', 'cancel-rename', 'Отмена');
    const buttonwrapper = Object.assign(document.createElement('div'), {
        className: 'button-wrapper'
    });
    buttonwrapper.appendChild(buttonconfirm);
    buttonwrapper.appendChild(buttoncancel);
    renameFileModal.appendChilds(label, input, buttonwrapper);
    input.addEventListener('keydown', function(event) {
        if (disallowedChars.includes(event.key) || disallowedChars.includes(event.code)) {
            event.preventDefault();
            alert('Введен запрещенный символ')
        }
    });

    const confirm = () => {
        const newFileName = input.value;
        fetch(renameFileButton.getAttribute('fetch'), {
            method: 'POST',
            body: JSON.stringify({ oldName: fileSitePath + '/' + fileName, newName: newFileName }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.status);
            const test = new mxNotify(data.status);
            const text = document.createElement('h3');
            if (data.status === 'success') {
                text.textContent = 'Директория переименована!';
            }
            else {
                text.textContent = 'Нельзя переименовывать вложенные директории';
            }
            test.AddPopupContent(text);
            console.log(data);
            renameFileModal.DoCloseModal();
            init.updateCenterPanel();
            init.updateFolderName();
            init.updateLeftPanel();
        });
    }
    // Переименование
    renameFileModal.SetListenerOnClick(confirm,'confirm-rename');
    renameFileModal.SetListenerOnClick( () => { renameFileModal.remove(); }  ,'cancel-rename');
    renameFileModal.SetListenerOnEnter(confirm);
}

const centerDir = document.querySelector('.centerDir');
const allFiles = centerDir.querySelectorAll('li');
console.log(allFiles);
allFiles.forEach(button => {
    button.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        console.log(button)

        const menu = new mxContextMenu({id:'menu',className:'menu','tag':'div'});
        if (button.classList.contains('file')){
            const buttonlist = ['properties'];
            const buttontext = ['Свойства'];
            const elements = menu.SetItems(buttonlist, buttontext);
        } else {
            const buttonlist = ['renameFile', 'delFile'];
            const buttontext = ['Переименовать', 'Удалить']
            const elements = menu.SetItems(buttonlist, buttontext);
            elements['delFile'].setAttribute('fetch', '/delDir');
            elements['renameFile'].setAttribute('fetch', '/renameDir');
        }
        menu.SetListenerOnContextMenu ( () => {}, 'menu-context-item');
        const { x, y } = event;
        console.log(menu.element)
        menu.SetStyles({
            zIndex: "9999",
            position: "absolute",
            left: `${x}px`,
            top: `${y}px`
        });

        let filePath = button.dataset.filerenamepath;
        let fileName = button.textContent;
        let fileType = button.className;
        let fileSitePath = getCurrentPath();

        const renameFileButton = menu.querySelector('.renameFile');
        if (renameFileButton) {
            renameFileButton.addEventListener('click', () => {
                renameFunction(filePath, fileName, fileSitePath, renameFileButton);
            });
        }
        // const concatFileButton = menu.querySelector('.concat');
        // if (concatFileButton) {
        //     concatFileButton.addEventListener('click', () => {

        //         let filesList = new Set; 
        //         for(i in liValues){
        //             if(liValues[i].endsWith('.pdf') && liValues[i] !== fileName){
        //                 filesList.add(liValues[i]);
        //             };
        //         };
        //         const fileSelect = (list) => {
        //             const concatFileSitePath = (path) => {
        //                 path = path.split('/');
        //                 path.pop();
        //                 path = path.join('/');
        //                 return path;
        //             }
        //             let result = ``;
        //             list.forEach(el => {
        //                 result += `<option value="${concatFileSitePath(fileSitePath) + '/' + el}">${el}</option>`;
        //             })
        //             return result;
        //         };
        //         const concatFileModal = new mxModalView({id:'concatFileModal', className:'modal', tag:'div'});
        //         concatFileModal.SetContent(`
        //                                 <div>
        //                                     <p>Добавление страниц другого документа к ${fileName}</p>
        //                                     <form>
        //                                         <div class="countOfMainPages"></div>
        //                                         <select id="fileSelect" style="width: 10vw">${fileSelect(filesList)}</select>
        //                                         <div id="countOfPagesAdd"></div>
        //                                         <label for="numberOfPageStart" style="display:inline">С какой страницы вставить:</label>
        //                                         <input type="number" id="numberOfPageStart" min=1 value=1><br>
        //                                         <label>Сколько страниц второго документа:</label>
        //                                         С: <input type="number" id="numberOfPageInsertStart" min=1 max=0> До: <input type="number" id="numberOfPageInsertEnd" min=1 max=0>
        //                                     </form>
        //                                     <div class="button-wrapper">
        //                                     <button class="modalButton" id="confirm-concat">Вставить</button>
        //                                     <button class="modalButton" id="cancel-concat">Отмена</button>
        //                                     </div>
        //                                 </div>
        //                                 <div style="border-left: 0.125em solid rgb(147, 160, 147, 0.550); margin-left: 0.625em"></div>
        //                                 <div style="margin-left: 1.25em">
        //                                     <p>Удаление страниц из документа</p>
        //                                     <div class="countOfMainPages"></div>
        //                                     <label>Сколько удалить страниц файла:</label><br>
        //                                     С (включительно): <input type="number" id="numberOfPageDelStart" min=1 max=0><br>
        //                                     До (включительно): <input type="number" id="numberOfPageDelEnd" min=1 max=0><br>
        //                                     <button class="modalButton" id="confirm-delpages">Удалить</button>
        //                                 </div>
        //                                 `);
        //         const mainPage = concatFileModal.querySelector('#numberOfPageStart');

        //         const startDelPage = concatFileModal.querySelector('#numberOfPageDelStart');
        //         const endDelPage = concatFileModal.querySelector('#numberOfPageDelEnd');

        //         const getCountOfPagesMain = (path) => {
        //             fetch('/get-pages',{
        //                 method: "POST",
        //                 body: JSON.stringify({ path }),
        //                 headers: {
        //                     'Content-Type': 'application/json'
        //                 }
        //             })
        //             .then(response => response.json())
        //             .then(data => {
        //                 concatFileModal.querySelectorAll('.countOfMainPages').forEach(el => { el.innerHTML = `Количество страниц в первом документе: ${data || 0}`; });
        //                 mainPage.max = data || 0;
        //                 startDelPage.max = data || 0; startDelPage.value = data === '' ? 0 : 1; 
        //                 endDelPage.max = data || 0; endDelPage.value = data || 0;
        //                 // Проверяем значение при вводе или изменении значения поля
        //                 const mainPageChange = () => {
        //                     const maxValue = parseInt(mainPage.max, 10);
        //                     const minValue = parseInt(mainPage.min, 10);
        //                     const currentValue = parseInt(mainPage.value, 10);

        //                     if (currentValue < minValue) {
        //                         mainPage.value = minValue; // Устанавливаем значение равным минимальному
        //                     }
        //                     if (currentValue > maxValue) {
        //                         mainPage.value = maxValue; // Устанавливаем значение равным максимальному
        //                     }
        //                 }
        //                 const startDelPageChange = () => {
        //                     const maxValue = parseInt(startDelPage.max, 10);
        //                     const minValue = parseInt(startDelPage.min, 10);
        //                     const currentValue = parseInt(startDelPage.value, 10);

        //                     if (currentValue < minValue) {
        //                         startDelPage.value = minValue; // Устанавливаем значение равным минимальному
        //                     }
        //                     if (currentValue > maxValue) {
        //                         startDelPage.value = maxValue; // Устанавливаем значение равным максимальному
        //                     }
        //                     if (currentValue > endDelPage.value) {
        //                         if (currentValue > maxValue) {
        //                             endDelPage.value = maxValue;
        //                         } else {
        //                             endDelPage.value = currentValue;
        //                         }
        //                     }
        //                 }
        //                 const endDelPageChange = () => {
        //                     const maxValue = parseInt(endDelPage.max, 10);
        //                     const minValue = parseInt(startDelPage.value, 10);
        //                     const currentValue = parseInt(endDelPage.value, 10);

        //                     if (currentValue > maxValue) {
        //                         endDelPage.value = maxValue; // Устанавливаем значение равным максимальному
        //                     }
        //                     if (currentValue < minValue){
        //                         endDelPage.value = minValue; // Устанавливаем значение равным минимальному
        //                     }
        //                 }
        //                 concatFileModal.SetListenerOnChange(mainPageChange,'numberOfPageStart');
        //                 concatFileModal.SetListenerOnChange(startDelPageChange,'numberOfPageDelStart');
        //                 concatFileModal.SetListenerOnChange(endDelPageChange,'numberOfPageDelEnd');
        //             })
        //         }
        //         getCountOfPagesMain(fileSitePath);

        //         const startInsertPage = concatFileModal.querySelector('#numberOfPageInsertStart');
        //         const endInsertPage = concatFileModal.querySelector('#numberOfPageInsertEnd');

        //         const getCountOfPages = (path) => {
        //             fetch('/get-pages',{
        //                 method: "POST",
        //                 body: JSON.stringify({ path }),
        //                 headers: {
        //                     'Content-Type': 'application/json'
        //                 }
        //             })
        //             .then(response => response.json())
        //             .then(data => {
        //                 concatFileModal.querySelector('#countOfPagesAdd').innerHTML = `Количество страниц во втором документе: ${data || 0}`;
        //                 startInsertPage.max = data || 0; startInsertPage.value = data === '' ? 0 : 1; 
        //                 endInsertPage.max = data || 0; endInsertPage.value = data || 0;

        //                 // Проверяем значение при вводе или изменении значения поля
        //                 startInsertPage.addEventListener('change', () => {
        //                     const maxValue = parseInt(startInsertPage.max, 10);
        //                     const minValue = parseInt(startInsertPage.min, 10);
        //                     const currentValue = parseInt(startInsertPage.value, 10);

        //                     if (currentValue < minValue) {
        //                         startInsertPage.value = minValue; // Устанавливаем значение равным минимальному
        //                     }
        //                     if (currentValue > maxValue) {
        //                         startInsertPage.value = maxValue; // Устанавливаем значение равным максимальному
        //                     }
        //                     if (currentValue > endInsertPage.value) {
        //                         if (currentValue > maxValue) {
        //                             endInsertPage.value = maxValue;
        //                         } else {
        //                             endInsertPage.value = currentValue;
        //                         }
        //                     }
        //                 });
        //                 endInsertPage.addEventListener('change', () => {
        //                     const maxValue = parseInt(endInsertPage.max, 10);
        //                     const minValue = parseInt(startInsertPage.value, 10);
        //                     const currentValue = parseInt(endInsertPage.value, 10);

        //                     if (currentValue > maxValue) {
        //                         endInsertPage.value = maxValue; // Устанавливаем значение равным максимальному
        //                     }
        //                     if (currentValue < minValue){
        //                         endInsertPage.value = minValue; // Устанавливаем значение равным минимальному
        //                     }
        //                 })
        //             })
        //         }

        //         // Переменные для элементов
        //         const fileSelectElement = concatFileModal.querySelector('#fileSelect');
        //         const confirmBtn = concatFileModal.getElementById('confirm-delete');
        //         const cancelBtn = concatFileModal.getElementById('cancel-delete');

        //         // Обработчик события для выбора элемента в списке
        //         fileSelectElement.onchange = () => {
        //             const selectedValue = fileSelectElement.value;
        //             console.log(selectedValue);
        //             getCountOfPages(selectedValue); // Вызов функции с передачей выбранного значения
        //         };
        //         getCountOfPages(fileSelectElement.value);

        //         const DoCloseModal = () => {
        //             concatFileModal.DoCloseModal();
        //         };
        //         concatFileModal.SetListenerOnClick(DoCloseModal,'#cancel-concat');
        //         concatFileModal.querySelector('#confirm-concat').addEventListener('click', (event) => {
        //             const childSitePath = fileSelectElement.value;
        //             const end = {"start":startInsertPage.value,"end":endInsertPage.value};
        //             const query = `/concat-pdf?parentpath=${fileSitePath}&childpath=${childSitePath}&pagestart=${mainPage.value}&pagesend=${JSON.stringify(end)}`;
        //             console.log(query);
        //             fetch(query,{
        //                 method: "GET",
        //             })
        //             .then(response => response.json())
        //             .then(data => {
        //                 console.log(data); 
        //                 location.reload();
        //             })
        //         })
        //         concatFileModal.querySelector('#confirm-delpages').addEventListener('click', (event) => {
        //             const end = {"start":startDelPage.value,"end":endDelPage.value};
        //             const query = `/del-pages-from-pdf?parentpath=${fileSitePath}&pagesend=${JSON.stringify(end)}`;
        //             fetch(query,{
        //                 method: "GET",
        //             })
        //             .then(response => response.json())
        //             .then(data => {
        //                 console.log(data); 
        //                 location.reload();
        //             })
        //         })
        //         })
        //     }

            const moveToTrashButtons = menu.querySelectorAll('.moveToTrash, .delFile');
            moveToTrashButtons.forEach(button => {
                button.addEventListener('click', () => {
                    function truncateFileName(fileName, maxLength) {
                        if (fileName.length > maxLength) {
                          return fileName.substring(0, maxLength) + '...';
                        }
                        return fileName;
                    }
                    
                    const mvToTrashModal = new mxModalView({id:'moveToTrashModal', className:'modal'});
                    const label = createLabel(`Вы уверены, что хотите удалить`);
                    const labelName = createLabel(`${truncateFileName(fileName, 30)}`);
                    const buttonconfirm = createButton('modalButton', 'confirm-delete', 'Да');
                    const buttoncancel = createButton('modalButton', 'cancel-delete', 'Нет');
                    const buttonwrapper = Object.assign(document.createElement('div'), {
                        className: 'button-wrapper'
                    });
                    labelName.style.display = 'block';
                    buttonwrapper.appendChild(buttonconfirm);
                    buttonwrapper.appendChild(buttoncancel);
                    mvToTrashModal.appendChilds(label, labelName, buttonwrapper);

                    const confirmDel = async () => {
                        bodyDel = JSON.stringify({ fileName, fileSitePath });
                        methodDel = 'POST';
                        console.log(bodyDel);
                        if (fileType !== 'directory') {
                            addresDel = '/delete-file';
                            result = await mvToTrashModal.fetchData(addresDel, false, {
                                reload: false,
                                method: methodDel, 
                                body: bodyDel
                            });
                            const notify = new mxNotify(result.status, result.response);
                            init.updatePanels();
                        }
                        else {
                            addresDel = '/delete-dir';
                            result = await mvToTrashModal.fetchData(addresDel, false, {
                                reload: false,
                                method: methodDel, 
                                body: bodyDel
                            });
                            const notify = new mxNotify(result.status, result.response);
                            init.updatePanels();
                        }
                        
                    };

                    mvToTrashModal.SetListenerOnClick(confirmDel, 'confirm-delete');
                    mvToTrashModal.SetListenerOnClick( () => { mvToTrashModal.remove(); } , 'cancel-delete');
                }); 
            });

        const propertiesButton = menu.querySelector('.properties');
        if (propertiesButton) {
            propertiesButton.addEventListener('click', (e) => {
            
            // Получаем значение переменной path
            let path = fileSitePath;

            // Отправляем запрос на сервер
            fetch('/get-properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path, fileName })
            })
                .then(response => response.json()) // Преобразуем ответ в JSON
                .then(data => {
                    if (data.status === 'error') {
                        const test = new mxNotify('error');
                        const text = document.createElement('h3');
                        text.textContent = 'Файл не найден!';
                        test.AddPopupContent(text);
                        return;
                    }
                    // Получаем значения переменных из ответа
                    function ZeroIsEmpty(data){
                        return data === undefined ? '' : data; 
                    }
                    try{
                        if(data.status == 'success'){
                            console.log(data);
                            data = data.response[0];
                            let id = data.id;
                            let fileNameBD = data.filename;
                            let decimalNumberBD = ZeroIsEmpty(data.decimalNumber) === '0' ? '' : ZeroIsEmpty(data.decimalNumber);
                            let nameProjectBD = ZeroIsEmpty(data.nameProject);
                            let organisationBD = ZeroIsEmpty(data.organisation);
                            let uploadDateTimeBD = ZeroIsEmpty(data.uploadDateTime);
                            let editionNumberBD = ZeroIsEmpty(data.editionNumber);
                            let authorBD = ZeroIsEmpty(data.author);
                            let storageBD = ZeroIsEmpty(data.storage);
                            let documentCategoryBD = ZeroIsEmpty(data.documentCategory);
                            let dirNumberBD = ZeroIsEmpty(data.dirNumber);
                            let publishDateBD = ZeroIsEmpty(data.publish_date);
                            let notesBD = ZeroIsEmpty(data.notes);
                            let listOfAssembleyNames = ZeroIsEmpty(data.assembley_filenames);
                            let listOfAssembleyPaths = ZeroIsEmpty(data.assembley_paths);
                            let statusBD = data.status;
                            
                            const generateCategorySelect = (currentCategory) => {
                                const categories = ['Не указано', 'Спецификация', 'Документация', 'Эскиз'];
                                let optionsHtml = '';   
                                for (let category of categories) {
                                    if (category !== currentCategory) {
                                    optionsHtml += `<option value="${category}">${category}</option>`;
                                    }
                                }
                                return `<select id="propdocumentCategoryBD" disabled>
                                            <option value="${currentCategory}">${currentCategory}</option>
                                            ${optionsHtml}
                                        </select>`;
                            }

                            const generateStatusSelect = (currentStatus) => {
                                const statuses = ['Не проверено','Проверено','В разработке'];
                                let optionsHtml = '';   
                                for (let status of statuses) {
                                    if (status !== currentStatus) {
                                    optionsHtml += `<option value="${status}">${status}</option>`;
                                    }
                                }
                                return `<select id="propstatusBD" disabled>
                                            <option value="${currentStatus}">${currentStatus}</option>
                                            ${optionsHtml}
                                        </select>`;
                            }

                            const checkNewList = () => {
                                if(propertiesModal.querySelector("#assembleyUnits").querySelector("#delUnit")){
                                    console.log('yes');
                                }
                                fetch('/get-assembley-units', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ path })
                                })
                                .then(response => response.json()) // Преобразуем ответ в JSON
                                .then(newdata => { 
                                    console.log('refreshed');
                                    newdata = newdata[0];
                                    newlist = ZeroIsEmpty(newdata.assembley_filenames);
                                    listOfAssembleyPaths = ZeroIsEmpty(newdata.assembley_paths);
                                    document.querySelector('#listOfAssembleys').innerHTML = viewOfAssembleyUnits(newlist);
                                })
                                .catch(err => {})
                            }

                            const viewOfOldVersion = (id) => {
                                if (!id) {
                                  return "Предыдущих версий не найдено";
                                }
                              
                                fetch('/get-old-info', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ id })
                                })
                                .then(response => response.json())
                                .then(oldInfo => {
                                  let result = '';
                                  console.log(oldInfo);
                                  
                                  for (const i in oldInfo) {
                                    const copyNumber = parseInt(i) + 1;
                                    const formattedDate = new Date(oldInfo[i].uploadDateTime).toLocaleDateString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      });
                                    result += `<li><a href="${path}">${oldInfo[i].filename}</a> (Версия ${copyNumber}) ${formattedDate}</li>`;
                                  }
                                  
                                  propertiesModal.querySelector('#OldVersions').innerHTML = result;
                                  return result;
                                });
                            }

                            const viewOfAssembleyUnits = (list) => {
                                const withoutFile = (path) => {
                                    path = path.split('/');
                                    path.pop(0);
                                    return path.join('/');
                                }
                                result = '';
                                listOfAssembleyPaths = listOfAssembleyPaths.split(',');
                                list = list.split(',');
                                for(i in list){
                                    if(list[i] === 'Нет сборочных единиц'){
                                        result += `<li>${list[i]}</li>`;
                                    } else 
                                    {
                                        result += `<li><a class="assembleys" style="padding-right: 5px" data-relocation='${withoutFile(listOfAssembleyPaths[i])}' href='${listOfAssembleyPaths[i]}'>${list[i]}</a><button data-db="${listOfAssembleyPaths[i]}" class="modalButton delAssembley" style="background-color:#fc6262;padding:0;margin:0;width:40px;height:30px;">DEL</button></li>\n`
                                    }
                                }
                                return result;
                            }
                            // Таблица свойств файла
                            // ${createInputRow('Имя документа', 'propfileNameBD', fileNameBD)}
                            const propertiesModal = new mxModalView({id:'propertiesModal',className:'modal',tag:'div'});
                            propertiesModal.SetContent(`
                            <div class="modal-content" id="propertiesModalContent" style="max-height:95%; padding-top: 10;">
                                    <table>
                                        <tr><td>Имя документа</td>
                                        <td><div class="input-with-addon"><input disabled type="text" name="propfileNameBD" id="propfileNameBD" placeholder="Имя документа" style="margin-top: 0.625em;">
                                        <tr><td>Статус</td><td>${generateStatusSelect(statusBD)}</td></tr>
                                        <tr><td>Категория документа</td><td>${generateCategorySelect(documentCategoryBD)}</td></tr>
                                        ${createInputRow('Децимальный номер', 'propdecimalNumberBD', decimalNumberBD)}
                                        ${createInputRow('Название проекта', 'propnameProjectBD', nameProjectBD)}
                                        ${createInputRow('Название организации', 'proporganisationBD', organisationBD)}
                                        ${createHiddenInput('propuploadDateTimeBD', uploadDateTimeBD)}
                                        ${createInputRow('Номер издания', 'propeditionNumberBD', editionNumberBD)}
                                        ${createInputRow('Автор', 'propauthorBD', authorBD)}
                                        ${createInputRow('Место хранения', 'propstorageBD', storageBD)}
                                        ${createInputRow('Номер папки', 'propdirNumberBD', dirNumberBD)}
                                        ${createInputRow('Дата издания', 'proppublishDateBD', toDate(publishDateBD), 'date')}
                                        ${createTextAreaRow('Примечание', 'propnotesBD', notesBD)}
                                    </table>
                            </div>
                            `);
                            /* 
                            <div id="assembleyUnits" class="modal-content">
                                <h4>Сборочные единицы <img src="/images/info.png" width=20px height=20px title="Изделия что входят в исходное"></h4>
                                <div style="height: 32vh; overflow:auto">
                                    <ul class="w3-ul" id="listOfAssembleys">
                                        ${viewOfAssembleyUnits(listOfAssembleyNames)}
                                    </ul>
                                </div>
                                <button id="addUnit" class="modalButton">Добавить в сборочные единицы</button><br>
                            </div>
                             <div style="height: 37vh; left: 85%;" id="listOfOldVersions" class="modal-content">
                                <h4> Предыдущие версии файла <img src="/images/info.png" width=20px height=20px title="Что ранее использовались вместо его"></h4>
                                <ul class="w3-ul" id="OldVersions">
                                    <td>${viewOfOldVersion(id)}</td>
                                </ul>
                            </div>
                            */
                            document.querySelector('.modal-content').className = '';
                            document.querySelector('.input-with-addon input').value = fileNameBD;
                            let mask, isAddFormOpen = false;    
                            propertiesModal.querySelector("#listOfAssembleys").addEventListener('click', event => {
                                if (event.target.matches('.assembleys')) {
                                    event.preventDefault();
                                    const href = event.target.href;
                                    const filename = href.split('/').pop();
                                    localStorage.setItem('selected', decodeURIComponent(filename));
                                    window.location.href = event.target.getAttribute('data-relocation');
                                }
                                if (event.target.matches('.delAssembley')){
                                    const mainPath = fileSitePath;
                                    const selectedUnit = event.target.getAttribute('data-db');
                                    fetch('/del-from-units', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ mainPath, selectedUnit })
                                    })
                                    .then(async response => {
                                        await response;
                                        await checkNewList();
                                    })
                                    .then(data => {})
                                }
                            });
                            propertiesModal.querySelector("#assembleyUnits").querySelector("#addUnit").addEventListener('click', event => {
                                if(isAddFormOpen === true){
                                    return;
                                }
                                isAddFormOpen = true;
                                fetch(`/get-all-units?path=${fileSitePath}`, {
                                    method: 'GET'
                                })
                                .then(response => response.json())
                                .then(data => {
                                    const selectOfAssembleyUnits = (data) => {
                                        if (data) {
                                            result = `<form id="addAssembley">
                                            <select id="selectUnit">`;
                                            data.forEach(element => {
                                                result += `<option value="${element.id}">${element.filename}</option>`;
                                            })
                                            result += ` </select>
                                            <button class="modalButton">Добавить</button>
                                                        </form>`;
                                            return result;
                                        }
                                        else {
                                            return "Нет загруженных файлов, помимо текущего!"
                                        }
                                    }
                                    const addAssemlbeyUnitForm = new mxModalView({id:'addAssembleyForm',className:'modal-content',tag:'div',parentID:'propertiesModal'});
                                    console.log(addAssemlbeyUnitForm);
                                    addAssemlbeyUnitForm.SetStyles({
                                        left: "15%",
                                        top: "15%", 
                                        width: "20vw",
                                        zIndex: 9999
                                    })
                                    addAssemlbeyUnitForm.SetContent(selectOfAssembleyUnits(data));
                                    const submutAddAssembleyUnit = () => {
                                        const selectedUnit = addAssemlbeyUnitForm.querySelector('#selectUnit').value;
                                        const mainPath = fileSitePath;
                                        fetch('/add-to-units', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ mainPath, selectedUnit })
                                        })
                                        .then(async response => {
                                            await response.json();
                                            await checkNewList();
                                        })
                                        .then(async data => {
                                        })
                                        .catch(error => {
                                            console.error('Ошибка:',error);
                                        })
                                    }
                                    addAssemlbeyUnitForm.SetListenerOnSubmit(submutAddAssembleyUnit,'addAssembley');
                                })
                                .catch(error => {
                                    console.error('Ошибка при обновлении данных:', error);
                                });
                            });
                            
                            const propdocumentCategoryBDInput = propertiesModal.querySelector('#propdocumentCategoryBD');
                            const propdecimalNumberBDInput = propertiesModal.querySelector('#propdecimalNumberBD');
                            
                            // mymask.js
                            propdocumentCategoryBDInput.onchange = () => { MaskForCategories(propdocumentCategoryBDInput, propdecimalNumberBDInput); };
                            MaskForCategories(propdocumentCategoryBDInput, propdecimalNumberBDInput);
                            
                            propertiesModal.style.display = "block";
                            const fileNameProp = document.querySelector('#propfileNameBD');
                            const fileNameValue = fileNameProp.value.split('.');
                            fileNameValue.pop()
                            fileNameProp.value = fileNameValue.join('');

                            fileNameProp.addEventListener('keydown', function(event) {
                                if (disallowedChars.includes(event.key) || disallowedChars.includes(event.code)) {
                                    event.preventDefault();
                                }
                            });
                            function toDate(datestring){
                                const parts = datestring.split('-');
                                const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                return formattedDate;
                            }

                            // Проверка ввода данных
                            const updateBtn = propertiesModal.querySelector('#update-properties');
                            const updateEvent = (event) => {
                                const isFileNameTooLong = document.querySelector('#propfileNameBD').value.length >= 230; // максимальное имя файла
                                if(!isFileNameTooLong){
                                    const delLastSpace = (str) => {
                                        return str.trimEnd();
                                    }
                                    const fileName = delLastSpace(document.querySelector('#propfileNameBD').value);
                                    if(propdocumentCategoryBDInput.value !== 'Не указано' &&  propdocumentCategoryBDInput.value !== 'Эскиз' && propdecimalNumberBDInput.value.replace(decimalNumberBDregex,'').length < 13) // чек addFileForm.html
                                    {
                                        alert('Децимальный номер введен неверно');
                                    } 
                                    else {
                                        console.log(propertiesModal.element);
                                        const decimalNumber = propertiesModal.element.querySelector('#propdecimalNumberBD').value;
                                        const nameProject = propertiesModal.element.querySelector('#propnameProjectBD').value;
                                        const organisation = propertiesModal.element.querySelector('#proporganisationBD').value;
                                        const uploadDateTime = propertiesModal.element.querySelector('#propuploadDateTimeBD').value;
                                        const entereduploadDateTime = new Date(uploadDateTime).getTime();
                                        const publishDate = propertiesModal.element.querySelector('#proppublishDateBD').value;
                                        const enteredPublishDate = new Date(uploadDateTime).getTime();
                                        if(uploadDateTime){
                                            const minDate = new Date('1900-01-01').getTime();
                                            const today = new Date().getTime();
                                            if(entereduploadDateTime >= today || entereduploadDateTime <= minDate)
                                            {
                                                alert('Дата введена не корректно')
                                                return;
                                            }
                                            if(enteredPublishDate >= today || enteredPublishDate <= minDate)
                                            {
                                                alert('Дата введена не корректно')
                                                return;
                                            }
                                        } 
                                        const editionNumber = propertiesModal.querySelector('#propeditionNumberBD').value;
                                        const author = propertiesModal.querySelector('#propauthorBD').value;
                                        const storage = propertiesModal.querySelector('#propstorageBD').value;
                                        const documentCategory = propertiesModal.querySelector('#propdocumentCategoryBD').value;
                                        const dirNumber = propertiesModal.querySelector('#propdirNumberBD').value;
                                        const notes = propertiesModal.querySelector('#propnotesBD').value;
                                        const status = propertiesModal.querySelector('#propstatusBD').value;

                                        const updatedData = {
                                            fileSitePath,
                                            fileName,
                                            decimalNumber,
                                            nameProject,
                                            organisation,
                                            uploadDateTime,
                                            editionNumber,
                                            author,
                                            storage,
                                            documentCategory,
                                            dirNumber,
                                            publishDate,
                                            notes,
                                            status,
                                            fileNameBD
                                        };

                                        // Отправка данных на сервер для обновления записи в БД
                                        fetch('/update-properties', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ updatedData })
                                        })
                                        .then(response => response.json())
                                        .then(data => {
                                            console.log(data);
                                            init.updateCenterPanel();
                                            init.updateLeftPanel();
                                            propertiesModal.DoCloseModal();
                                        })
                                        .catch(error => {
                                            console.error('Ошибка при обновлении данных:', error);
                                        });
                                    }
                                } else {
                                    alert('Имя документа выбрано слишком длинным');
                                }
                            }

                            updateBtn.addEventListener('click',updateEvent);

                            const closeForm = () => {
                                propertiesModal.remove();
                            }

                            const closeBtn = propertiesModal.querySelector('#close-properties');

                            closeBtn.addEventListener('click', () => {
                                closeForm();
                            });

                            const pairKeys = (event) => {
                                if (event.key === "Escape"){
                                    closeForm();
                                    document.removeEventListener('keydown', pairKeys, false);
                                } 
                                if (event.key === "Enter"){
                                    updateEvent();
                                    document.removeEventListener('keydown', pairKeys, false);
                                }
                            }
                            document.addEventListener('keydown', pairKeys, false);

                        }
                    } catch(err) {
                        console.error(err);
                    }
                });
            })
        }
    });
});
}