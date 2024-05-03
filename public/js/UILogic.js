window.addEventListener('load', () => {
    var pageLoadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
    console.log('Page load time: ' + pageLoadTime + ' milliseconds');
});

function createForm (formId, submitString, dataToValues, ...inputNames) {
    const form = document.createElement('form');
    form.id = formId;

    function addOption (select, name) {
        var opt = document.createElement('option');
        opt.value = name;
        opt.innerHTML = name;
        select.appendChild(opt);
    }

    function insertObject(obj) {
        function checkIsUndefined (data, value) {
            return data === undefined ? value : data;
        }
        const tag = checkIsUndefined(obj.element, 'input');
        const input = document.createElement(tag);
        if (obj.classNames) {
            input.classList.add(obj.classNames);
        }
        input.type = checkIsUndefined(obj.type, tag === 'input' ? 'text' : '');
        input.required = checkIsUndefined(obj.required, false);
        input.name = obj.name;
        if (obj.styles) {
            input.style = obj.styles;
        }
        if (obj.element === 'select') {
            obj.options.forEach(name => {
                addOption(input, name);
            })
        }
        input.id = obj.name;
        input.placeholder = checkIsUndefined(obj.placeholder, obj.value);
        return input
    }


    inputNames.forEach(inputName => {
        let input;
        if (typeof(inputName) === 'object') {
            if (inputName.length > 0) {
                inputName.forEach(input => {
                    input = insertObject(input);
                    form.appendChild(input);
                })
            } else {
                input = insertObject(inputName);
                form.appendChild(input);
            }
        }
        else {
            input = document.createElement('input');
            input.name = inputName;
            input.type = 'text';
            if (Object.keys(dataToValues).length !== 0) {
                input.value = dataToValues[input.name];
            }
            input.placeholder = inputName;
            form.appendChild(input);
        }
    })

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.name = 'submit';
    submit.textContent = submitString;
    form.appendChild(submit);
    return form;
}

function openInstructionWindow() {
    const url = '/pdf/instructions.pdf';
    const name = 'Инструкция';
    const features = 'width=800,height=600';
    const newWindow = window.open(url, name, features);
}

const dirPath = "D:\/Archive\/ARCHIVE\/main_dir\/";

const tree = document.querySelector('.w3-ul');
const treedirs = tree.querySelectorAll('.w3-ul');
treedirs.forEach(dir => {
    if (localStorage.getItem(dir.id) !== 'active' || !localStorage.getItem(dir.id)) {
        localStorage.setItem(dir.id, "hidden");
    } else {
        const openFolderButton = dir.parentNode.querySelector('.claster .openFolder');
        openFolderButton.classList.add('active');
        openFolderButton.innerHTML = '<img src="/images/free-icon-arrow-down-sign-to-navigate-32195.png">';
        document.getElementById(dir.id).classList.remove('hidden');
        document.getElementById(dir.id).classList.add('active');
        document.getElementById(dir.id).classList.toggle('opened');
    }
});

function openNewWindow() {
    const url = iframe.src;
    const name = 'Предпросмотр';
    const features = `width=${window.outerWidth},height=${window.outerHeight}`;
    const newWindow = window.open(url, name, features);
}

let mainPath;
let currentPath = localStorage.getItem('currentPath') || '/';
const list = document.getElementById('dir_tree');
const center = document.getElementById('centerDir');
// getMainPath()
//     .then(data => {
//         mainPath = data.path;
//         if (currentPath === '/') {
//             currentPath = mainPath;
//         }
//         getDirIncludes(mainPath)
//         .then(data => {
//             updateLeftList(list, data, mainPath);
//         })
//         .catch(error => {
//             console.error(error);
//         });
//         getDirIncludes(currentPath)
//         .then(data => {
//             updateList(center, data, currentPath);
//             updateFolderName();
//         })
//         .catch(error => {
//             console.error(error);
//         });
//     })

// document.getElementById('backButton').addEventListener('click', (event) => {
//     console.log(currentPath);
//     if (currentPath === mainPath) {
//         return;
//     }
//     currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
//     console.log(currentPath);
//     updateFolderName();
//     updateLocalStorage();
//     getDirIncludes(currentPath)
//     .then(data => {
//         updateFolderName();
//         updateList(center, data);
//     })
// })