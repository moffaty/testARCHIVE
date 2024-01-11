const changeTag = (liElement, tag) => {
    const newElement = document.createElement(tag);
    newElement.textContent = liElement.textContent;
    newElement.classList.add(...liElement.classList);
    liElement.insertAdjacentElement('afterend', newElement);
    return newElement;
};

const clearListItems = (list) => {
    if (list instanceof Element) {
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

const updateFolderName = () => {
    document.getElementById('centerTopH').textContent = getLastDir(currentPath);
}

const checkNextElementSibling = (parent, tag) => {
    return (parent.nextElementSibling && parent.nextElementSibling.tagName === tag.toUpperCase());
}

const getPath = (string, startIndex = 0, endElement = '<') => {
    return string.substring(startIndex, string.indexOf(endElement));
}

const ulString = (string, startElement = '>', endElement = 'li') => {
    return string.substring(string.indexOf(startElement) + 1, string.indexOf(endElement) - 1);
}

const getAddictivePath = (element, addictivePath = '') => {
    if (element.parentNode && element.parentNode.classList.contains('directory')) {
        addictivePath += addSlashIfInStrSlashNotAtTheEnd(getPath(element.parentNode.innerHTML, '<'));
        return getAddictivePath(element.parentNode, addictivePath);
    } 
    return addictivePath;
}

const getLastDir = (path) => {
    const array = path.split('/');
    return array[array.length - 1];
}

const reversePath = (path) => {
    const ar = path.split('/');
    ar.reverse();
    let newPath = ar.join('/');
    return newPath;
}

const addSlashIfInStrSlashNotAtTheEnd = (str) => {
    if (!str.endsWith('/')) {
        str += '/';
    }
    return str;
}

const listOnContextMenu = (el, e, path = currentPath) => {
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

const listOnMouseDown = (el, e) => {
    currentPath = mainPath;
    let addictivePath = addSlashIfInStrSlashNotAtTheEnd(reversePath(getAddictivePath(el)));
    getDirIncludes(currentPath + addictivePath + el.textContent)
    .then(data => {
        const newlist = addList(el);
        if (newlist) {
            const ul = changeTag(el, 'ul');
            ul.style.padding = '8px 16px 0px 16px';
            if (ul) {
                ul.addEventListener('mousedown', (e) => {
                    if (e.target.tagName === 'UL' && e.target.classList.contains('directory')) {
                        e.stopPropagation();
                        clearListItems(ul);
                        const newItem = changeTag(ul, 'li');
                        newItem.addEventListener('mousedown', e => {
                            e.preventDefault();
                            listOnMouseDown(newItem, e);
                        })
                        newItem.addEventListener('mousedown', e => {
                            e.preventDefault();
                            listOnContextMenu(newItem, e, currentPath);
                        })
                        ul.remove();
                    }
                })
                fillList(ul, data);
                linkElements(ul);
                el.remove();
            }
        }
        currentPath = currentPath.substring(0, currentPath.lastIndexOf('/')); // обрезаем добавленный слеш
    })
} 

const clearList = (list) => {
    list.innerHTML = '';
}

const fillList = (list, data) => {
    data.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item.name; // Предположим, что item - это текстовое содержимое элемента
        listItem.classList.add(item.type);
        list.appendChild(listItem);
    });
}

const addList = (parent) => {
    if (!checkNextElementSibling('UL')) {
        const ul = document.createElement('ul');
        parent.appendChild(ul);
        return ul;
    }
}

const linkElements = (list, path) => {
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

const updateList = (list, data, path = currentPath) => {
    clearList(list);
    fillList(list, data);
    linkElements(list, path);
}

const getDirIncludes = (path) => {
    return new Promise((resolve, reject) => {
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

const getMainPath = () => {
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