let isDragging = false;
let draggedclassesOfDirectory = null;
let initialX = null;
let initialY = null;
let classesOfDirectory;

// Функция для добавления подсветки элемента
function addHighlight(classesOfDirectory) {
    classesOfDirectory.classList.add('highlight');
};

// Функция для удаления подсветки элемента
function removeHighlight(classesOfDirectory) {
    classesOfDirectory.classList.remove('highlight');
};

// Добавляем обработчики событий dragenter и dragleave для элементов с классом .directory
/**
 * Проверяет пересечение текущих координат курсора с границами определенных элементов.
 * Для каждого элемента в указанных селекторах проверяет, находится ли курсор в его границах,
 * и в зависимости от результата добавляет или убирает выделение.
 *
 * @param {MouseEvent} event - Объект события мыши, содержащий координаты курсора.
 */
function checkIntersection(event) {
    // функция для высчета расположения элемента и установки подстветки
    /**
     * Проверяет, находятся ли текущие координаты курсора в пределах границ элемента.
     * Если курсор находится внутри границ, добавляет выделение элемента, иначе убирает выделение.
     * 
     * @param {HTMLElement} element - Элемент, границы которого проверяются.
     */
    function checkCords(element) {
        const rect = element.getBoundingClientRect();
        const { top, bottom, left, right } = rect;
        const x = event.clientX;
        const y = event.clientY;
        // Проверяем, попадает ли текущие координаты курсора в границы элемента
        if (x >= left && x <= right && y >= top && y <= bottom) {
            addHighlight(element);
            classesOfDirectory = element;
        } else {
            removeHighlight(element);
        }
    }
    const directories = document.querySelectorAll('.centerDir .directory, .folder-toggle, .centerDir .dir, .centerButtons');
    directories.forEach((directory) => {
        checkCords(directory);
        if(draggedclassesOfDirectory.querySelector('a').classList.contains('aDirs')){
            checkCords(centerDir);
        };
    });
};

/**
 * Обработчик события начала перетаскивания элемента.
 * Производит необходимую предобработку перед началом перемещения элемента.
 *
 * @param {DragEvent} event - Объект события перетаскивания.
 */
function dragStart(event) {
    event.preventDefault();
    // Сохраняем ссылку на перетаскиваемый элемент
    draggedclassesOfDirectory = event.target.closest("li");
    
    // Устанавливаем CSS-свойство position в значение absolute
    // Устанавливаем свойство pointer-events в значение none, чтобы мы могли "держать" файл за любую его часть
    // Устанавливаем свойство z-index, чтобы файл был поверх остальных элементов
    draggedclassesOfDirectory.classList.add('activeLi');

    event.dataTransfer.setData("text/plain", event.target.id);
    filePath = event.target.querySelector('a').getAttribute('data-filerenamepath');
    // Почему здесь выдаёт замечание о смене переменной?
    fileName = event.target.querySelector('a').getAttribute('data-filename');
    fileSitePath = event.target.querySelector('a').getAttribute('data-filepath');

    // Сохраняем начальные координаты мыши
    initialX = event.clientX;
    initialY = event.clientY;

    document.addEventListener('mousemove',checkIntersection);
    // Начинаем процесс перетаскивания
    isDragging = true;
};

/**
 * Обработчик события перемещения мыши во время процесса перетаскивания элемента.
 * Обновляет позицию перетаскиваемого элемента в соответствии с текущими координатами мыши.
 *
 * @param {MouseEvent} event - Объект события перемещения мыши.
 */
function drag(event) {
    if (isDragging) {
        // Устанавливаем новые значения CSS-свойств left и top
        draggedclassesOfDirectory.style.left = event.clientX + "px";
        draggedclassesOfDirectory.style.top = event.clientY + "px";
        draggedclassesOfDirectory.style.width = "37.2vh";
    }
};

/**
 * Обработчик события завершения перетаскивания элемента.
 * Выполняет необходимые действия после завершения процесса перетаскивания.
 * 
 * @param {DragEvent} event - Объект события перетаскивания.
 */
function dragEnd(event) {
    if (isDragging) {
        /**
         * Получает путь до главной директории на основе предоставленного пути.
         * Использует регулярное выражение для извлечения пути до главной директории.
         *
         * @param {string} path - Полный путь к файлу или директории.
         * @returns {string} - Путь до главной директории.
         */
        function getMainDirPath(path) {
            const regex = /^.*\/main_dir/;
            const match = path.match(regex);
            const result = match[0];
            return result;
        }

        // Завершаем процесс перетаскивания
        isDragging = false;

        // Возвращаем CSS-свойства элемента в исходное состояние
        draggedclassesOfDirectory.style.left = '';
        draggedclassesOfDirectory.style.top = '';
        draggedclassesOfDirectory.style.width = '';

        draggedclassesOfDirectory.classList.remove('activeLi');
    
        document.removeEventListener('mousemove',checkIntersection);
        if(classesOfDirectory && classesOfDirectory.classList.contains('highlight')){
            // функция отправки данных если элемент имеет "выделение"
            /**
             * Отправляет запрос на сервер для перемещения данных с использованием метода POST.
             * После успешного ответа сервера выполняет перезагрузку текущей страницы.
             * После успешного выполнения запроса удаляет соответствующие данные из локального хранилища.
             *
             * @param {Object} data - Данные, которые будут отправлены на сервер в формате JSON.
             */
            function queryToMove(data) {
                fetch('/move', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => { 
                    location.reload(); })
                .then(data => {
                    localStorage.removeItem(location.pathname.slice(0,-1));
                })
                .catch(err => { console.error(err); })
            }
            
            // обработчик наведения на панель с отображением файлов, срабатывает только для элементов с левого дерева 
            if (classesOfDirectory.classList.contains('centerDir')) {
                const dirPath = getMainDirPath(filePath) + location.pathname;
                const dirSitePath = location.pathname.slice(0,-1);
                const data = { "centerDir": true, "dirPath": dirPath, "filePath": filePath, "fileName" : fileName, "fileSitePath" : fileSitePath, "dirSitePath" : dirSitePath };
                queryToMove(data);
            }

            // обработчик наведения на боковую панель, учитывая элементы списка 
            if (classesOfDirectory.classList.contains('directory')) {
                const dirPath = classesOfDirectory.querySelector('.dir').getAttribute('data-filerenamepath');
                const dirSitePath = classesOfDirectory.querySelector('.dir').getAttribute('data-filepath');
                const data = { "dirPath": dirPath, "filePath": filePath, "fileName" : fileName, "fileSitePath" : fileSitePath, "dirSitePath" : dirSitePath };
                queryToMove(data);
            }

            // обработчик при наведении на директории боковой панели
            if (classesOfDirectory.classList.contains('folder-toggle')) {
                const dirPath = classesOfDirectory.getAttribute('data-filerenamepath');
                const dirSitePath = classesOfDirectory.getAttribute('data-path');
                
                const data = { "dirPath": dirPath, "filePath": filePath, "fileName" : fileName, "fileSitePath" : fileSitePath, "dirSitePath" : dirSitePath };
                queryToMove(data);
            }

            // обработчик дпри наведении на центральные директории
            if (classesOfDirectory.classList.contains('dir')) {
                const dirPath = classesOfDirectory.getAttribute('data-filerenamepath');
                const dirSitePath = classesOfDirectory.getAttribute('data-filepath');
                
                const data = { "dirPath": dirPath, "filePath": filePath, "fileName" : fileName, "fileSitePath" : fileSitePath, "dirSitePath" : dirSitePath };
                queryToMove(data);
            }

            // обработчик при наведении на кнопки
            if (classesOfDirectory.classList.contains('centerButtons') || classesOfDirectory.classList.contains('modalButton')) {
                console.log(filePath);
                const backTo = (path) => {
                    if (path.startsWith('C:')) {
                        resPath = path.split('\\');
                        resPath.pop(resPath.length - 1);
                        resPath.pop(resPath.length - 1);
                        return resPath.join('\\').replace('/','\\');
                    }
                    else {
                        resPath = path.split('/');
                        if (resPath.length >= 2) {
                            resPath.pop(resPath.length - 1);
                            return resPath.join('/');
                        }
                        else {
                            return path;
                        }
                    }
                }
                console.log(backTo(filePath));
                const dirPath = backTo((filePath) + location.pathname);
                const dirSitePath = backTo(location.pathname.slice(0,-1));
                console.log("dirPath:",dirPath);
                console.log("dirSitePath:",dirSitePath);
                const data = { "dirPath": dirPath, "filePath": filePath, "fileName" : fileName, "fileSitePath" : fileSitePath, "dirSitePath" : dirSitePath };
                queryToMove(data)
            }
        }
    }
};

// Добавляем обработчики событий mousemove и mouseup для всего документа
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", dragEnd);