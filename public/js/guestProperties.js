let activeMenu = null;
let modalOpen = false;
let fetchDel;

const centerDir = document.querySelector('.centerDir');
const allFiles = centerDir.querySelectorAll('.file a,.directory a');

allFiles.forEach(button => {
    button.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        if (activeMenu !== null) {
            document.body.removeChild(activeMenu);
        }

        const menu = document.createElement("div");
        menu.classList.add("menu")
        // Нах*я, а главное зачем z-index = 9999?
        menu.style.zIndex = "9999";
        menu.style.position = "absolute";
        if (button.classList.contains('file')){
            menu.innerHTML = `
            <div style="position: absolute;" class="menu-context-item">
                <button class="properties">Свойства</button>
            </div>
            `;
        } 

        document.body.appendChild(menu);
        const { x, y } = event;
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        activeMenu = menu;

        const filePath = button.dataset.filerenamepath;
        const fileName = button.dataset.filename;
        const sizeFile = button.dataset.size;
        const fileSitePath = button.dataset.filepath;


        if(button.classList.contains('file')){
        const propertiesButton = menu.querySelector('.properties');

            propertiesButton.addEventListener('click', () => {

                modalOpen = true;
                
                    // Получаем значение переменной path
                    let path = fileSitePath;
                    
                    // Отправляем запрос на сервер
                    fetch('/get-properties', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ path })
                    })
                        .then(response => response.json()) // Преобразуем ответ в JSON
                        .then(data => {
                        // Получаем значения переменных из ответа
                        function ZeroIsEmpty(data) {
                            return data === undefined ? '' : data; 
                        }
                        try{
                            if(data['length'] !== 0){
                                data = data[0];
                                let fileNameBD = data.filename;
                                let decimalNumberBD = ZeroIsEmpty(data.decimalNumber);
                                let nameProjectBD = ZeroIsEmpty(data.nameProject);
                                let organisationBD = ZeroIsEmpty(data.organisation);
                                let createDateBD = ZeroIsEmpty(data.createDate);
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

                                function viewOfAssembleyUnits(list) {
                                    function withoutFile(path) {
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
                                const propertiesModal = document.createElement('div');
                                propertiesModal.classList.add('modal');
                                propertiesModal.setAttribute('id', 'propertiesModal');
                                propertiesModal.innerHTML = `
                                    <div class="modal-content" style="max-height:95%; width:35%">
                                        <h3>Свойства файла</h3>
                                        <table>
                                            <tr>
                                                <td style="width: 30%">Имя докумета:</td>
                                                <td><input type="text" id='propfileNameBD' value='${fileNameBD}' readonly></td>
                                                <input hidden id='proppathToDel' value='${filePath}'>
                                            </tr>
                                            <tr>
                                                <td>Статус проверки:</td>
                                                <td>
                                                    <input type="text" id="propstatusBD" value='${statusBD}' readonly>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Категория документа:</td>
                                                <td>
                                                    <input type="text" id="propdocumentCategoryBD" value='${documentCategoryBD}' readonly>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Децимальный номер:</td>
                                                <td><input type="text" id='propdecimalNumberBD' value='${decimalNumberBD}' readonly></td>
                                            </tr>
                                            <tr>
                                                <td>Название проекта:</td>
                                                <td><input type="text" id='propnameProjectBD' value="${nameProjectBD}" readonly></td>
                                            </tr>
                                            <tr>
                                                <td>Название организации:</td>
                                                <td><input type="text" id='proporganisationBD' value='${organisationBD}' readonly></td>
                                            </tr>
                                            <tr>
                                                <td>Дата создания:</td>
                                                <form><td><input class="w3-input" type="date" id='propcreateDateBD' value='${toDate(`${createDateBD}`)}' min="1900-01-01" readonly></td></form>
                                            </tr>
                                            <tr>
                                                <td>Номер издания:</td>
                                                <td><input type="text" id='propeditionNumberBD' value='${editionNumberBD}' readonly></td>
                                            </tr>
                                            <tr>
                                                <td>Автор:</td>
                                                <td><input type="text" id='propauthorBD' value='${authorBD}' readonly></td>
                                            </tr>
                                            <tr>
                                                <td>Место хранения:</td>
                                                <td><input type="text" id='propstorageBD' value='${storageBD}' readonly></td>
                                            </tr>
                                            <tr>
                                                <td>Номер папки:</td>
                                                <td><input type="text" id='propdirNumberBD' value='${dirNumberBD}' readonly></td>
                                            </tr>
                                            <tr>
                                                <td>Дата издания:</td>
                                                <td><input class="w3-input" type="date" id='proppublishDateBD' value='${toDate(`${publishDateBD}`)}' min="1900-01-01" readonly></td>
                                            </tr>
                                            <tr>
                                                <td>Примечание:</td>
                                                <td><textarea readonly id='propnotesBD' style="overflow:hidden">${notesBD}</textarea></td>
                                            </tr>
                                        </table>
                                        <button class="modalButton" id="close-properties">Закрыть</button>
                                    </div>
                                    <div id="assembleyUnits" class="modal-content" style="left: 15%; width: 20%; height: 47vh; overflow:auto">
                                        <h4>Сборочные единицы <img src="/images/info.png" width=20px height=20px title="Изделия что входят в исходное"></h4>
                                        <div style="height: 32vh; overflow:auto">
                                            <ul class="w3-ul" id="listOfAssembleys">
                                                ${viewOfAssembleyUnits(listOfAssembleyNames)}
                                            </ul>
                                        </div>
                                        <button id="addUnit" style="width: 100%" class="modalButton">Добавить в сборочные единицы</button><br>
                                    </div>
                                    <div class="overlay"></div>
                                `;
                                document.body.appendChild(propertiesModal);
                                const propdecimalNumberBDInput = document.getElementById('propdecimalNumberBD');
                                const propdocumentCategoryBDInput = document.getElementById('propdocumentCategoryBD');
                                if(propdocumentCategoryBDInput.value === 'Эскиз'){
                                    let decimalNumberBDregex = /[._-]/g;
                                    propdecimalNumberBDInput.value = propdecimalNumberBDInput.value.replace(decimalNumberBDregex,'');
                                }
                                propertiesModal.style.display = "block";

                                const fileNameProp = document.getElementById("propfileNameBD");

                                fileNameProp.addEventListener('keydown', function(event) {
                                    if (disallowedChars.includes(event.key) || disallowedChars.includes(event.code)) {
                                        event.preventDefault();
                                    }
                                });
                                function toDate(datestring) {
                                    const parts = datestring.split('-');
                                    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                    return formattedDate;
                                }
                                
                                // Добавляем обработчик события на оверлей
                                propertiesModal.addEventListener("click", function(event) {
                                // Если нажали на оверлей, скрываем модальное окно и оверлей
                                if (event.target === propertiesModal) {
                                    propertiesModal.remove();
                                    modalOpen = false;
                                }
                                });
                                
                                const closeBtn = document.getElementById('close-properties');

                                closeBtn.addEventListener('click', () => {
                                    propertiesModal.remove();
                                    modalOpen = false;
                                });
                            }
                        } catch(err) {
                            console.error(err);
                        }
                });
            })
        }
    })
    document.addEventListener('click', (event) => {
        if (activeMenu !== null && !activeMenu.contains(event.target)) {
            activeMenu.remove();
            activeMenu = null;
        }
    });
})