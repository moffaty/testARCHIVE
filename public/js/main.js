class main {
    constructor() {
        this.main_dir;
        this.currentPath = '/';
        this.header = document.getElementById('centerTopH');
        this.leftPanel = panels._getLeftPanel();
        this.centerPanel = panels._getCenterDir();
        this.init();
    }
    /**
     * Получает информацию о содержимом указанного пути с сервера.
     * @param {string} path - Путь к директории, информация о которой должна быть получена.
     * @returns {Promise} - Промис в виде данных о директории или ошибки.
     */
    getDirIncludes(path) {
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
            .then(data => {
                resolve(data); 
            })
            .catch(error => {
                console.error('Произошла ошибка:', error);
                reject(new Error(`Request failed: ${error.message}`)); 
            });
        });
    };


    /**
     * Получает основной путь к директории с сервера.
     * @returns {Promise} - Промис в виде пути к корневой директории или ошибки.
     */
    getMainPath() {
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


    rmvProject() {
        function createButton(className, id, textContent) {
            const button = document.createElement('button');
            button.className = className;
            button.id = id;
            button.textContent = textContent;
            return button;
        }
    
        function createLabel(text) {
            const label = document.createElement('label');
            label.textContent = text;
            label.style.textAlign = 'center';
            return label;
        }
        const projectName = document.getElementById('centerTopH').textContent;
        const mvToTrashModal = new mxModalView({ id:'moveToTrashModal', className:'modal' });
        const label = createLabel(`Вы уверены, что хотите удалить проект?`);
        const buttonconfirm = createButton('modalButton', 'confirm-delete', 'Да');
        const buttoncancel = createButton('modalButton', 'cancel-delete', 'Нет');
        const buttonwrapper = Object.assign(document.createElement('div'), {
            className: 'button-wrapper'
        });
        buttonwrapper.appendChild(buttonconfirm);
        buttonwrapper.appendChild(buttoncancel);
        mvToTrashModal.appendChilds(label, buttonwrapper);

        const confirmDel = async () => {
            const bodyDel = JSON.stringify({ projectName, path: localStorage.getItem('currentPath') });
            const methodDel = 'POST';
            console.log(bodyDel);
            const addresDel = '/delete-project';
            const result = await mvToTrashModal.fetchData(addresDel, false, {
                reload: false,
                method: methodDel, 
                body: bodyDel
            });
            const notify = new mxNotify(result.status, result.response);
            init.updatePanels();
        }
        mvToTrashModal.SetListenerOnClick(confirmDel, 'confirm-delete');
        mvToTrashModal.SetListenerOnClick( () => { mvToTrashModal.remove(); } , 'cancel-delete');
    }

    fillList(list, data, linkMouseDown = false) {
        data.forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add(item.type);
            listItem.dataset.path = item.path;
            const listName = document.createElement('a');
            // Добавляем класс в зависимости от типа элемента ('file' или 'dir')
            listName.classList.add(`${item.type === 'file' ? 'file' : 'dir'}`);
            const listOfStatuses = {"Не проверено": "done", "В разработке": "working"};
            listName.classList.add(listOfStatuses[item.status]);
            // Устанавливаем текст элемента 'a' на основе имени из данных
            listName.textContent = item.name;
            listItem.appendChild(listName);
            list.appendChild(listItem);
            if (item.type === 'directory') {
                this.addDbClickEvent(listItem);
                if (linkMouseDown) {
                    this.addMouseDownEvent(listItem);
                }
            }
        });
        if (data.some(item => item.name === '.project')) {
            const projectBtn = document.getElementById('addProjectModalButton');
            projectBtn.removeEventListener('click', projectFunction);
            projectBtn.querySelector('img').src = '/images/rmvproject.png';
            projectBtn.addEventListener('click', this.rmvProject);
        } else {
            const projectBtn = document.getElementById('addProjectModalButton');
            projectBtn.removeEventListener('click', this.rmvProject);
            projectBtn.querySelector('img').src = '/images/project.png';
            projectBtn.addEventListener('click', projectFunction);
        }
    }

    /**
     * Проверяет, является ли следующий соседний элемент родителя элементом с указанным тегом.
     * @param {HTMLElement} parent - Родительский элемент.
     * @param {string} tag - Тег, с которым сравнивается тег следующего соседнего элемента.
     * @returns {boolean} - Возвращает true, если следующий соседний элемент имеет указанный тег, в противном случае - false.
     */
    checkNextElementSibling(parent, tag) {
        return (parent.nextElementSibling && parent.nextElementSibling.tagName === tag.toUpperCase());
    }
    /**
     * Добавляет новый дочерний элемент 'ul' к родительскому элементу, если его еще нет.
     * @param {HTMLElement} parent - Родительский элемент, к которому добавляется новый список.
     * @returns {HTMLElement} - Возвращает новый элемент 'ul' или null, если он уже существует.
     */
    addList(parent) {
        if (!this.checkNextElementSibling('ul')) {
            const ul = document.createElement('ul');
            parent.appendChild(ul);
            return ul;
        }
    }

    init() {
        return new Promise(async (resolve, reject) => {
            await this.fillLeftPanel()
                .then(() => {
                    console.log("Left panel filled successfully.");
                })
                .catch((error) => {
                    console.error("Error filling left panel:", error);
                });

            await this.fillCenterPanel()
                .then(() => {
                    console.log("Center panel filled successfully.");
                })
                .catch((error) => {
                    console.error("Error filling left panel:", error);
                });

            await this.getReferal();

            this.updateFolderName();
        })
    }

    /**
     * Очищает все дочерние элементы переданного списка.
     * @param {HTMLElement} list - Список, который требуется очистить.
     */
    clearListItems(list) {
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

    // function replaceBackslashes(inputString) {
    //     const resultString = inputString.replace(/\\/g, '/');
    //     return resultString;
    // }

    addMouseDownEvent(el, parent = this.leftPanel) {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const path = this.main_dir + '/' + el.dataset.path;
            this.getDirIncludes(path)
                .then(data => {
                    if (data.length === 0) {
                        return;
                    }
    
                    const nextElementSibling = el.nextElementSibling;
    
                    if (nextElementSibling && nextElementSibling.tagName === 'UL') {
                        // If the next sibling is already a <ul>, remove it
                        nextElementSibling.remove();
                        return;
                    }
    
                    const newlist = document.createElement('ul');
                    newlist.classList.add('dir');
                    this.fillList(newlist, data);
                    parent.insertBefore(newlist, nextElementSibling);
    
                    newlist.querySelectorAll('li').forEach(li => {
                        li.addEventListener('click', e => {
                            e.stopPropagation();
                            this.addMouseDownEvent(li, newlist);
                        });
                        li.addEventListener('dblclick', (e) => {
                            this.addDbClickEvent(li);
                        })
                    });
    
                    this.currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                });
        });
    }
    

    addDbClickEvent(el) {
        el.addEventListener('dblclick', (e) => {
            e.preventDefault();
            console.log(el);
            this.currentPath = el.dataset.path;
            this.setCurrentPath(this.main_dir + '/' + this.currentPath);
            this.updateFolderName();
            try {
                this.getDirIncludes(this.main_dir + '/' + this.currentPath)
                .then(data => {
                    this.clearListItems(this.centerPanel);
                    this.fillList(this.centerPanel, data);
                    prop();
                })
                .catch(error => {
                    console.error(error);
                });
            } catch (error) {
                console.error('Произошла ошибка при getDirIncludes:', error);
            }
        })
    }

    setCurrentPath(path) {
        return localStorage.setItem('currentPath', path);
    }

    getCurrentPath() {
        if (!localStorage.getItem('currentPath')) {
            localStorage.setItem('currentPath', '');
            return '/main_dir';
        }
        return localStorage.getItem('currentPath');
    }

    fillLeftPanel() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.getMainPath()
                this.main_dir = result.path; 
                this.currentPath = this.main_dir;
                const data = await this.getDirIncludes(this.main_dir);
                if (data.length === 0) {
                    return resolve();
                } 
                this.fillList(panels._getLeftPanel(), data, true);
                return resolve(data);
            } catch (error) {
                console.error("Error fetching directory information:", error);
                return reject(error);
            }
        });
    }

    fillCenterPanel() {
        return new Promise(async (resolve, reject) => {
            try {
                const path = this.getCurrentPath();
                const data = await this.getDirIncludes(path);
                if (data.length === 0) {
                    return resolve();
                } 
                this.fillList(panels._getCenterDir(), data);
                prop(); // properties.js
                preview();
                return resolve(data);
            } catch (error) {
                console.error("Error fetching directory information:", error);
                return reject(error);
            }
        })
    }

    updateCenterPanel() {
        return new Promise(async (resolve, reject) => {
            try {
                this.clearListItems(this.centerPanel);
                return resolve(this.fillCenterPanel());
            }
            catch (error) {
                return reject(error);
            }
        })
    }

    updateLeftPanel() {
        return new Promise(async (resolve, reject) => {
            try {
                this.clearListItems(this.leftPanel);
                return resolve(this.fillLeftPanel());
            }
            catch (error) {
                return reject(error);
            }
        })
    }

    updatePanels() {
        return new Promise(async (resolve, reject) => {
            try {
                this.updateLeftPanel();
                this.updateCenterPanel();
            }
            catch (error) {
                return reject(error);
            }
        })
    }

    async getReferal() {
        const response = await fetch('/get-ref');
        const data = await response.json();
        if (data.status === 'success') {
            this.setCurrentPath(data.response.path);
            const generalPath = (data.response.path + '/' + data.response.file).replace('/main_dir/', '');
            this.centerPanel.querySelectorAll('li.file').forEach(li => {
                if (generalPath === li.dataset.path) {
                    li.classList.add('fade-out'); // Добавляем класс для анимации
                }
            })
            // this.updateCenterPanel();
            await fetch('/clear-ref');
        }
        console.log(data);
    }

    updateFolderName() {
        const path = this.getCurrentPath();
        this.header.textContent = this.getLastDir(path === '' ? this.main_dir : path);
        if ('/' + this.header.textContent == this.main_dir) {
            this.header.textContent = 'Корневая директория';
        }
    }

    getLastDir(path) {
        const array = path.split('/');
        return array[array.length - 1];
    }
}

const init = new main();

document.getElementById('backButton').addEventListener('click', (event) => {
    if (localStorage.getItem('currentPath') === '') {
        localStorage.setItem('currenPath', init.main_dir);
    }
    if (localStorage.getItem('currentPath') === init.main_dir) {
        return;
    }
    currentPath = localStorage.getItem('currentPath').substring(0, localStorage.getItem('currentPath').lastIndexOf('/'));
    console.log(localStorage.getItem('currentPath'));
    init.setCurrentPath(currentPath);
    init.getDirIncludes(currentPath)
    .then(data => {
        init.updateFolderName();
        init.clearListItems(init.centerPanel);
        init.fillCenterPanel();
    })
})

document.getElementById('home1').addEventListener('click', e => {
    e.preventDefault();
    if (localStorage.getItem('currentPath') !== '') {
        console.log('shit');
        localStorage.setItem('currentPath', '');
        init.updateFolderName();
        init.updateCenterPanel();
    }
})
