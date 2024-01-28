class adminFunctions {
    constructor() {
        this.datafield = document.createElement('p');
        this.datafield.id = 'response';
    }

    /**
     * en and ru lits same length
     * @param {Array} operations - array
     * @param {Array} operationsRU - array
     * @param {String} optionName - string
     */
    getData(operations, operationsRU, optionName) {
        const centerPanel = panels._getCenterPanel();
        let data = '';
        for (let i = 0; i < operationsRU.length; i++) {
            const el = operationsRU[i];
            const funcname = operations[i] + optionName + '()';
            data += `<button id=${el} onclick=${funcname} class="adminButtons modalButton">${el}</button>`;
        }
        centerPanel.innerHTML = data;
        localStorage.setItem('option', optionName);
        this.changeOption(localStorage.getItem('option'));
    }

    createButton (textContent, id = '') {
        const button = document.createElement('button');
        button.classList.add('adminButtons'); 
        button.classList.add('modalButton'); 
        button.textContent = textContent;
        if (id) {
            button.id = id;
        }
        return button;
    }

    clearElement (el) {
        el.innerHTML = '';
    }

    changeOption(option) {
        const leftPanel = document.getElementById('leftPanel');
    
        const clickHandler = (e) => {
            console.log(e.target.id);
            console.log(option);
            if (option.toLowerCase() !== e.target.id) {
                this.clearElement(document.getElementById('rightPanel'));
            }
    
            leftPanel.childNodes.forEach(el => {
                el.removeEventListener('click', clickHandler);
            });
        };
    
        leftPanel.childNodes.forEach(el => {
            el.addEventListener('click', clickHandler);
        });
    }

    getRightPanel() {
        return document.qu
    }

    createForm (formId, submitString, dataToValues, ...inputNames) {
        const form = document.createElement('form');
        form.id = formId;

        inputNames.forEach(inputName => {
            const input = document.createElement('input');
            input.name = inputName;
            input.type = 'text';
            if (Object.keys(dataToValues).length !== 0) {
                input.value = dataToValues[input.name];
            }
            input.placeholder = inputName;
            form.appendChild(input);
        })

        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.name = 'submit';
        submit.textContent = submitString;
        form.appendChild(submit);

        return form;
    }


    createaDataResponse(data) {
        this.datafield.textContent = data;
        return this.datafield;    
    }

    addToPanel (child, panel) {
        panel.appendChild(child);
        return child;
    }

    dataResponse (data, panel) {
        return this.addToPanel(this.createaDataResponse(data), panel);
    }

    async createTable (name) {
        const response = await fetch(`/create-table-${name}`);
        const data = await response.json();
        adminPanel.dataResponse(data.response, rightPanel);
    }

    isElementEmpty (element) {
        return (element.innerHTML.trim() === '');
    }
}

const adminPanel = new adminFunctions();