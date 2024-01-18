/**
 * en and ru lits same length
 * @param {Array} en - array
 * @param {Array} ru - array
 * @param {String} optionName -
 */
function getData(en, ru, optionName) {
    const center = document.getElementById('center');
    let data = '';
    for (let i = 0; i < ru.length; i++) {
        const el = ru[i];
        const funcname = en[i] + optionName + '()';
        data += `<button id=${el} onclick=${funcname} class="adminButton modalButton">${el}</button>`;
    }
    center.innerHTML = data;
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


function clearElement (el) {
    el.innerHTML = '';
}

function createForm (formId, submitString, ...inputNames) {
    const form = document.createElement('form');
    form.id = formId;

    inputNames.forEach(inputName => {
        const input = document.createElement('input');
        input.name = inputName;
        input.type = 'text';
        input.placeholder = inputName;
        form.appendChild(input);
    })

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = submitString;
    form.appendChild(submit);

    return form;
}

