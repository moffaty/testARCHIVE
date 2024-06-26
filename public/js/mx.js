class mxModalView {
    constructor(args = { id: '', className: 'class', tag: 'div', parentID: '' }) {
        this.result = 'none'; // результат выполнения последнего запроса
        this.error = 'none'; // ошибка при выполнении последнего запроса
        this.tag = args.tag;
        this.id = args.id;
        this.className = args.className;
        this.element = document.createElement(this.tag);
        this.element.classList.add(this.className);
        this.element.id = this.id;
        this.style = this.element.style;
        this.htmlContent = this.element.innerHTML;
        this.modalOpen = true;
        this.contentClass = 'modal-content'

        if (args.parentID) {
            const parentElement = document.querySelector(`#${args.parentID}`);
            if (parentElement) {
                parentElement.appendChild(this.element);
            }
        } else {
            document.body.appendChild(this.element);
        }

        this.SetListenerOnEscape(() => { this.DoCloseModal(); });
        this.DoWindowEventClose();
    }

    mxModalView  (tag) {
        return this.element.contains(tag);
    }

    async fetchData(address, reloadWindow=false, args = { method: '', body: {}, headers: {} }) {
        try {
            console.log(args.body);
            const response = await fetch(address, {
                method: args['method'] === undefined ? 'GET' : args['method'],
                body: args['body'],
                headers: args['headers'] === undefined ? 
                    { 'Content-Type': 'application/json' } :
                    args['headers']
            });
            this.result = await response.json();
            this.remove();
            if (reloadWindow === true) {
                location.reload();
            }
            console.log(this.result);
            return this.result; // Возвращаем извлеченные данные
        } catch (err) {
            this.error = err;
            console.log(err);
            return err;
        }
    }

    remove () {
        return this.element.remove();
    }
    
    getElementById (id) {
        return this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`);
    }

    setAttribute (param='id', value=this.id) {
        return this.element.setAttribute(param, value);
    }

    querySelectorAll (tag) {
        return this.element.querySelectorAll(tag);
    }

    querySelector (tag) {
        return this.element.querySelector(tag);
    }

    GetParentContainer () {
        return this.element.parentNode;
    }

    SetParentNode(newParent) {
        let newParentElement = null;

        if (typeof newParent === 'string') {
            newParentElement = document.getElementById(newParent);
        } else if (newParent instanceof HTMLElement) {
            newParentElement = newParent;
        } else {
            throw new Error('Неправильный элемент или его идентификатор.');
        }

        if (newParentElement) {
            newParentElement.appendChild(this.element);
        } else {
            throw new Error('Элемент не найден.');
        }
    }

    GetResult () {
        return this.result;
    }

    Example () {
        console.log(`${this.constructor.name} is triggered`);
    }

    SetStyles (styles) {
        const element = this.element.querySelector(`.${this.contentClass}`)
        Object.assign(element.style, styles);
    }

    GetStyles () {
        return this.element.styles;
    }

    appendChild(obj) {
        const divmodal = document.createElement('div');
        divmodal.classList.add('modal-content');
        divmodal.appendChild(obj);
        this.element.appendChild(divmodal);
    }

    appendChilds(...objs) {
        const divmodal = document.createElement('div');
        divmodal.classList.add('modal-content');
        objs.forEach(obj => {
            divmodal.appendChild(obj);
        })
        this.element.appendChild(divmodal);
    }
    
    SetContent (html) {
        this.element.innerHTML = `<div class="modal-content">` + html + '</div>';
        const parser = new DOMParser();
        const htmlContent = parser.parseFromString(this.element.innerHTML, 'text/html');
        this.htmlContent = htmlContent.querySelector('.modal-content');
    }

    GetContent () {
        return this.htmlContent;
    }

    SetListenerOnChange (func=this.Example, id=this.id) {
        if(id === this.id){
            this.element.addEventListener('change', func);
        } else {
            this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`).addEventListener('click', func);
        }
    }

    SetListenerOnClick (func=this.Example, id=this.id) {
        if(id === this.id){
            this.element.addEventListener('click', func);
        } else {
            this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`).addEventListener('click', func);
        }
    }

    SetListenerOnSubmitSync (func=this.Example, id=this.id) {
        if(id === this.id){
            this.element.addEventListener('submit', event => {
                event.preventDefault();
                func();
            });
        } else {
            this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`).addEventListener('submit', event => {
                event.preventDefault();
                func();
            });
        }
    }

    SetListenerOnSubmit (func=this.Example, id=this.id) {
        if(id === this.id){
            this.element.addEventListener('submit',async event => {
                event.preventDefault();
                await func();
            });
        } else {
            this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`).addEventListener('submit', async event => {
                event.preventDefault();
                await func();
            });
        }
    }

    SetListenerOnEnter (func=this.Example, id=this.id, removeAfterEvent=true) {
        console.log(id);
        if (id === this.id){
            document.addEventListener('keydown', (event) => {
                if (event.key === "Enter") {
                    func();
                    this.modalOpen = false;
                    if(removeAfterEvent) {
                        document.removeEventListener('keydown', func, false);
                    }
                }
            });
        } else {
            this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`).addEventListener('keydown', (event) => {
                if (event.key === "Enter") {
                    func();
                    if(emoveAfterEvent) {
                        this.element.querySelector(id).removeEventListener('keydown', func, false);
                    }
                }
            })
        }
    }

    SetListenerOnEscape (func=this.Example, id=this.id, removeAfterEvent=true, ) {
        if (id === this.id){
            document.addEventListener('keydown', (event) => {
                if (event.key === "Escape") {
                    func();
                    if(removeAfterEvent) {
                        document.removeEventListener('keydown', func, false);
                    }
                }
            });
        } else {
            this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`).addEventListener('keydown', (event) => {
                if (event.key === "Escape") {
                    func();
                    if(emoveAfterEvent) {
                        this.element.querySelector(id).removeEventListener('keydown', func, false);
                    }
                }
            })
        }
    }

    GetClassLists () {
        return this.element.classList;
    }

    DoDeleteFromDocument () {
        document.body.removeChild(this.element);
    }

    DoDeleteClass (className) {
        this.element.classList.remove(className);
    }

    DoAddClass (className='class') {
        this.element.classList.add(className);
    }

    DoWindowEventClose () {
        window.addEventListener('mousedown', (event) => {
            if (event.target === this.element) {
                this.remove();
                this.modalOpen = false;
                return false;
            }
        });
    }
    
    DoCloseModal () {
        this.remove();
        this.modalOpen = false;
        return false;
    }
}

class mxContextMenu extends mxModalView {
    static #MAX_INSTANCES = 1;
    static #instances = 0;
    static currentInstance = null; // Добавлено для хранения текущего экземпляра

    constructor(...args) {
        super(...args);
        if (mxContextMenu.#instances < mxContextMenu.#MAX_INSTANCES) {
            mxContextMenu.#instances++;
            mxContextMenu.currentInstance = this; // Сохраняем текущий экземпляр
        } else {
            mxContextMenu.currentInstance.remove(); // Удаляем старый экземпляр
            mxContextMenu.currentInstance = this; // Заменяем на новый экземпляр
        }
        this.SetListenerOnClick(() => {
            this.remove();
        });
        document.addEventListener('click', (event) => {
            if (event.target !== this) {
                this.remove();
            }
        })
        this.contentClass = 'menu-context-item';
    }

    SetListenerOnContextMenu (func=this.Example, id=this.id) {
        if (id === this.id){
            this.element.addEventListener('contextmenu',(event) => {
                event.preventDefault();
                func();
            })
        } else {
            this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`).addEventListener('contextmenu',(event) => {
                event.preventDefault();
                func();
            })
        }
    }

    SetListenersOnContextMenuList (func=this.Example, ids={id:['']}) {
        ids.forEach(id => {
            console.log(this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`));
            this.element.querySelector(`${id.startsWith('#') ? id : '#' + id}`).addEventListener('contextmenu',(event) => {
                event.preventDefault();
                func();
            })
        })
    }

    SetContent (html) {
        this.element.innerHTML = html;
        this.htmlContent = html;
    }

    SetItems(items, textContets) {
        let elements = {}; // [name,.element]
        const div = document.createElement('div');
        div.classList.add('menu-context-item');
        div.id = 'menu-context-item';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const textContent = textContets[i];
            const button = document.createElement('button');
            button.classList.add(item);
            button.id = item;
            button.name = item;
            button.textContent = textContent;
            elements[item] = button;
            div.appendChild(button);
        }
        this.element.appendChild(div);
        return elements;
    }
}

class mxNotify extends mxModalView {
    static #MAX_INSTANCES = 1;
    static #instances = 0;

    constructor(status = 'success', text = '') {
        super({ id: 'popup', className: 'popup', tag: 'div', parentID: '', status: 'success' });
        if (mxNotify.#instances < mxNotify.#MAX_INSTANCES) {
            mxNotify.#instances++;
            mxNotify.currentInstance = this;
        } else {
            mxNotify.currentInstance.remove();
            mxNotify.currentInstance = this; 
        }
        this.popupcontent = document.createElement('div');
        this.popupcontent.classList.add('popup-content');
        this.popupcontent.classList.add(status);
        this.closeButton = document.createElement('span');
        this.closeButton.classList.add('popup-close');
        this.closeButton.id = 'closePupop';
        this.closeButton.textContent = 'x';

        this.closeButton.addEventListener('click', (e) => {
            this.SmoothExit();
        })
        this.element.appendChild(this.popupcontent);
        this.element.appendChild(this.closeButton);
        
        if (text) {
            const h2 = document.createElement('h3');
            h2.textContent = text;
            this.popupcontent.appendChild(h2);
        }
        this.AddElement();
    }

    AddPopupContent(html) {
        this.popupcontent.appendChild(html);
    }

    SmoothExit() {
        const popup = document.getElementById('popup');
        if (popup) {
            popup.style.transition = 'transform 0.3s ease-in-out';
            popup.style.transform = 'translate(100%, 100%)';
    
            // Remove the transition property after the animation is complete
            setTimeout(() => {
                popup.style.transition = '';
                this.DoCloseModal();
            }, 300);
        }
    }
    
    AddElement() {
        const popup = document.getElementById('popup');
        setTimeout(() => {
        popup.style.transform = 'translate(0, 0)';
        }, 150); 
        setTimeout(() => {
            popup.style.transform = 'translate(0, 0)';
            this.SmoothExit();
        }, 5000);
    }
}