/**
 * Заменяет тег элемента на указанный тег, сохраняя содержимое и классы.
 * @param {HTMLElement} liElement - Элемент списка, который требуется изменить.
 * @param {string} tag - Новый тег, на который необходимо заменить текущий тег элемента.
 * @returns {HTMLElement} - Новый элемент с указанным тегом, содержимым и классами.
 */
function changeTag(liElement, tag) {
    const newElement = document.createElement(tag);
    const anchorElement = liElement.querySelector('a');
    newElement.appendChild(anchorElement)
    newElement.classList.add(...liElement.classList);

    liElement.parentNode.replaceChild(newElement, liElement);
    return newElement;
};

/**
 * Очищает все дочерние элементы переданного списка.
 * @param {HTMLElement} list - Список, который требуется очистить.
 */
function clearListItems(list) {
    // Проверяем, является ли переданный объект элементом DOM
    if (list instanceof Element) {
        // Получаем коллекцию дочерних элементов списка
        let children = list.children;
        if (children) {
            // Копируем коллекцию в массив для предотвращения изменений в процессе удаления
            let childrenArray = Array.from(children);
            for (let i = 0; i < childrenArray.length; i++) {
                childrenArray[i].remove();
            }
        }
    } 
}

/**
 * Обновляет текстовое содержимое элемента с ID = 'centerTopH'
 * значением последнего компонента пути текущего пути.
 */
function updateFolderName() {
    document.getElementById('centerTopH').textContent = getLastDir(currentPath);
}

/**
 * Проверяет, является ли следующий соседний элемент родителя элементом с указанным тегом.
 * @param {HTMLElement} parent - Родительский элемент.
 * @param {string} tag - Тег, с которым сравнивается тег следующего соседнего элемента.
 * @returns {boolean} - Возвращает true, если следующий соседний элемент имеет указанный тег, в противном случае - false.
 */
function checkNextElementSibling(parent, tag) {
    return (parent.nextElementSibling && parent.nextElementSibling.tagName === tag.toUpperCase());
}

/**
 * Возвращает подстроку из переданной строки, начиная с указанного индекса и заканчивая указанным элементом.
 * @param {string} string - Исходная строка.
 * @param {number} startIndex - Начальный индекс для выделения подстроки (по умолчанию 0).
 * @param {string} endElement - Заключающий элемент подстроки (по умолчанию '<').
 * @returns {string} - Выделенная подстрока.
 */
function getPath(string, startIndex = 0, endElement = '<') {
    return string.substring(startIndex, string.indexOf(endElement));
}

/**
 * Возвращает подстроку между указанными элементами в строке.
 * @param {string} string - Исходная строка.
 * @param {string} startElement - Начальный элемент подстроки (по умолчанию '>').
 * @param {string} endElement - Заключающий элемент подстроки (по умолчанию 'li').
 * @returns {string} - Выделенная подстрока.
 */
function ulString(string, startElement = '>', endElement = 'li') {
    return string.substring(string.indexOf(startElement) + 1, string.indexOf(endElement) - 1);
}

/**
 * Возвращает "зависимый" путь, добавляя к нему части пути родительских элементов с классом 'directory'.
 * @param {HTMLElement} element - Элемент DOM.
 * @param {string} addictivePath - Накопленный "зависимый" путь (по умолчанию пустая строка).
 * @returns {string} - "Зависимый" путь, содержащий части пути родительских элементов с классом 'directory'.
 */
function getAddictivePath(element, addictivePath = '') {
    if (element.parentNode && element.parentNode.tagName === 'LI' && element.parentNode.classList.contains('directory')) {
        const parentUl = findParentUl(element.parentNode);
        if (parentUl) {
            console.log(`check path of the parent Node: ${getPath(parentUl.innerHTML, '<')}`);
            addictivePath = addSlashIfInStrSlashNotAtTheEnd(getPath(parentUl.innerHTML, '<')) + addictivePath;
        }
        return getAddictivePath(element.parentNode, addictivePath);
    }
    return addictivePath;
    // if (element.parentNode && element.parentNode.classList.contains('directory')) {
    //     console.log(`parentNode: ${element.parentNode.innerHTML}`);
    //     const parentLink = element.parentNode.querySelector('a.dir');
    //     console.log(`parentLink: ${parentLink}`);
        
    //     if (parentLink) {
    //         console.log(`check path of the parent Node: ${getPath(parentLink.textContent, '<')}`);
    //         addictivePath += addSlashIfInStrSlashNotAtTheEnd(getPath(parentLink.textContent, '<'));
    //     }
    //     return getAddictivePath(element.parentNode, addictivePath);
    // } 
    // return addictivePath;
}

// Вспомогательная функция для поиска родительского элемента <ul> с классом 'directory'
function findParentUl(element) {
    while (element) {
        if (element.tagName === 'UL' && element.classList.contains('directory')) {
            return element;
        }
        element = element.parentNode;
    }
    return null;
}

/**
 * Возвращает последний компонент пути из переданной строки.
 * @param {string} path - Заданный путь.
 * @returns {string} - Последний компонент пути - актуальная папка.
 */
function getLastDir(path) {
    const array = path.split('/');
    return array[array.length - 1];
}

/**
 * Разворачивает порядок компонентов пути в переданной строке.
 * @param {string} path - Заданный путь.
 * @returns {string} - Перевернутый путь.
 */
function reversePath(path) {
    const ar = path.split('/');
    ar.reverse();
    let newPath = ar.join('/');
    return newPath;
}

/**
 * Добавляет слеш к строке, если он отсутствует в её конце.
 * @param {string} str - Входная строка.
 * @returns {string} - Строка с добавленным слешем в конце.
 */
function addSlashIfInStrSlashNotAtTheEnd(str) {
    if (!str.endsWith('/')) {
        str += '/';
    }
    return str;
}
/**
 * Обрабатывает событие контекстного меню для элемента списка, обновляя отображаемое содержимое каталога
 * на основе выбранного элемента и пути к нему.
 * Также обновляет текущий путь, локальное хранилище, и отображение имени папки.
 * Вызывает функцию 'getDirIncludes' для получения содержимого каталога
 * и обновляет список элементов в указанном контейнере.
 * 
 * @param {HTMLElement} el - HTML-элемент, вызывающий событие контекстного меню.
 * @param {Event} e - Объект события контекстного меню.
 * @param {string} [path=currentPath] - Необязательный базовый путь для каталога, по умолчанию - текущий путь (CurrentPath). 
 */
function listOnContextMenu(el, e, path = currentPath) {
    let addictivePath = reversePath(getAddictivePath(el));
    addictivePath = addSlashIfInStrSlashNotAtTheEnd(addictivePath);
    console.log('addictive', addictivePath);
    console.log('path', path);
    currentPath = path + addictivePath + el.textContent;
    updateLocalStorage();
    updateFolderName();
    console.log(currentPath);
    try {
        getDirIncludes(currentPath)
        .then(data => {
            console.log("PATH", currentPath);
            updateList(center, data, path);
        })
        .catch(error => {
            console.error(error);
        });
    } catch (error) {
        console.error('Произошла ошибка при getDirIncludes:', error);
    }
}

/**
 * Обработчик события контекстного меню для элемента списка.
 * @param {HTMLElement} el - Элемент списка, на котором было вызвано контекстное меню.
 * @param {Event} event - Объект события контекстного меню.
 * @param {string} path - Путь к текущему элементу списка (по умолчанию - текущий путь страницы).
 */
function listOnMouseDown(el, event) {
    let addictivePath = addSlashIfInStrSlashNotAtTheEnd(reversePath(getAddictivePath(el)));
    
    console.log('Проверка!!!');
    console.log('currentPath:', currentPath);
    console.log('addictivePath:', addictivePath);
    console.log('element text content:', el.textContent);
    console.log('Конец проверки');

    // Обновляем текущий путь на основе предыдущего состояния
    currentPath = currentPath + addictivePath + el.textContent;

    getDirIncludes(currentPath)
        .then(data => {
            const newlist = addList(el);
            if (newlist) {
                const ul = changeTag(el, 'ul');
                ul.style.padding = '8px 16px 0px 16px';
                if (ul) {
                    ul.addEventListener('mousedown', (event) => {
                        if (event.target.tagName === 'UL' && event.target.classList.contains('directory')) {
                            event.stopPropagation();
                            clearListItems(ul);
                            const newItem = changeTag(ul, 'li');
                            newItem.addEventListener('mousedown', event => {
                                event.preventDefault();
                                listOnMouseDown(newItem, event);
                            })
                            newItem.addEventListener('mousedown', event => {
                                event.preventDefault();
                                listOnContextMenu(newItem, event, currentPath);
                            })
                            ul.remove();
                        }
                    })
                    fillList(ul, data);
                    linkElements(ul);
                    el.remove();
                }
            }
            console.log('Результат проверки:', currentPath);

            // Обновляем текущий путь с учетом слеша в конце
            if (!currentPath.endsWith('/')) {
                currentPath += '/';
            }
            // Сохраняем предыдущий путь перед обрезкой слеша
            let previousPath = currentPath;
            // Обрезаем добавленный слеш
            currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        })
        .catch(error => {
            console.error(error);
        });
} 

/**
 * Очищает все дочерние элементы переданного списка.
 * @param {HTMLElement} list - Список, который требуется очистить.
 */
function clearList(list) {
    list.innerHTML = '';
}

/**
 * Заполняет переданный список элементами на основе данных.
 * @param {HTMLElement} list - Список, который требуется заполнить.
 * @param {Array} data - Массив данных, используемых для создания элементов списка.
 */
function fillList(list, data) {
    data.forEach(item => {
        const listItem = document.createElement('li');
        listItem.classList.add(item.type);
        const listName = document.createElement('a');
        // Добавляем класс в зависимости от типа элемента ('file' или 'dir')
        listName.classList.add(`${item.type === 'file' ? 'file' : 'dir'}`);
        // Устанавливаем текст элемента 'a' на основе имени из данных
        listName.textContent = item.name;
        listItem.appendChild(listName);
        list.appendChild(listItem);
    });
}

/**
 * Добавляет новый дочерний элемент 'ul' к родительскому элементу, если его еще нет.
 * @param {HTMLElement} parent - Родительский элемент, к которому добавляется новый список.
 * @returns {HTMLElement} - Возвращает новый элемент 'ul' или null, если он уже существует.
 */
function addList(parent) {
    if (!checkNextElementSibling('ul')) {
        const ul = document.createElement('ul');
        parent.appendChild(ul);
        return ul;
    }
}

/**
 * Создает связи для элементов списка с классом 'directory' для обработки событий контекстного меню и клика.
 * @param {HTMLElement} list - Список, в котором нужно создать связи для элементов с классом 'directory'.
 * @param {string} path - Текущий путь, используемый при обработке событий.
 */
function linkElements(list, path) {
    list.querySelectorAll('.directory').forEach(el => {
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            listOnContextMenu(el, e, path);
        });

        el.addEventListener('click', (e) => {
            e.preventDefault();
            listOnMouseDown(el, e);
        });
    });
}

/**
 * Обновляет список на странице с новыми данными и создает связи для элементов 'directory'.
 * @param {HTMLElement} list - Список, который требуется обновить.
 * @param {Array} data - Массив данных для заполнения списка.
 * @param {string} path - Текущий путь, используемый при создании связей для элементов 'directory' (по умолчанию - текущий путь страницы).
 */
function updateList(list, data, path = currentPath) {
    clearList(list);
    fillList(list, data);
    linkElements(list, path);
}

/**
 * Заполняет переданный список новыми данными и создает связи для элементов 'directory'.
 * @param {HTMLElement} list - Список, который требуется заполнить и обновить.
 * @param {Array} data - Массив данных для заполнения списка.
 * @param {string} path - Текущий путь, используемый при создании связей для элементов 'directory' (по умолчанию - текущий путь страницы).
 */
function updateLeftList(list, data, path = currentPath) {
    fillList(list, data);
    linkElements(list, path);
}

/**
 * Получает информацию о содержимом указанного пути с сервера.
 * @param {string} path - Путь к директории, информация о которой должна быть получена.
 * @returns {Promise} - Промис в виде данных о директории или ошибки.
 */
function getDirIncludes(path) {
    return new Promise((resolve, reject) => {
        console.log(path);
        fetch('/get-dir-info', {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ path: path })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка запроса');
            }
            return response.json();
        })
        .then(async data => {
            resolve(data); 
        })
        .catch(error => {
            console.error('Произошла ошибка:', error);
            reject(error); 
        });
    });
};

/**
 * Получает основной путь к директории с сервера.
 * @returns {Promise} - Промис в виде пути к корневой директории или ошибки.
 */
function getMainPath() {
    return new Promise((resolve, reject) => {
        fetch('/get-main-dir', {
            method: "GET",
            headers: { "Content-type": "application/json" }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка запроса');
            }
            return response.json();
        })
        .then(async data => {
            resolve(data); 
        })
        .catch(error => {
            console.error('Произошла ошибка:', error);
            reject(error); 
        });
    });
}