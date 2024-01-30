/**
 * en and ru lits same length
 * @param {Array} operations - array
 * @param {Array} operationsRU - array
 * @param {String} optionName - string
 */
function getData(operations, operationsRU, optionName) {
    const centerPanel = panels._getCenterPanel();
    let data = '';
    for (let i = 0; i < operationsRU.length; i++) {
        const el = operationsRU[i];
        const funcname = operations[i] + optionName + '()';
        data += `<button id=${el} onclick=${funcname} class="adminButtons modalButton">${el}</button>`;
    }
    centerPanel.innerHTML = data;
    localStorage.setItem('option', optionName);
    changeOption(localStorage.getItem('option'));
}

function changeOption(option) {
    const leftPanel = document.getElementById('leftPanel');

    function clickHandler(e) {
        console.log(e.target.id);
        console.log(option);
        if (option.toLowerCase() != e.target.id) {
            clearElement(document.getElementById('rightPanel'));
        }

        leftPanel.childNodes.forEach(el => {
            el.removeEventListener('click', clickHandler);
        });
    }

    leftPanel.childNodes.forEach(el => {
        el.addEventListener('click', clickHandler);
    });
}

function getRightPanel() {
    return document.qu
}

function clearElement (el) {
    el.innerHTML = '';
}

function createForm (formId, submitString, dataToValues, ...inputNames) {
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


function createaDataResponse(data, tag = "p") {
    const dataElement = document.createElement(tag);
    dataElement.textContent = data;
    return dataElement;    
}

function addToPanel (child, panel) {
    panel.appendChild(child);
    return child;
}

function dataResponse (data, panel) {
    return addToPanel(createaDataResponse(data), panel);
}