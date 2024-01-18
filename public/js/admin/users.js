function getUserData() {
    const usersOperations = ['create', 'delete', 'edit'];
    const usersOperationsRU = ['Создать', 'Удалить', 'Изменить'];
    getData(usersOperations, usersOperationsRU, 'User');
} 

async function getPositions() {
    const response = await fetch('/get-positions');
    return await response.json();
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

async function createUser() {
    let positions = await getPositions();
    const rightPanel = document.getElementById('rightPanel');
    clearElement(rightPanel);
    const form = createForm("create_user", "Создать пользователя", "login", "password");
    rightPanel.appendChild(form);

    const select = document.createElement('select');
    select.name = 'position';
    positions.forEach(el => {
        const option = document.createElement('option');
        option.value = el;
        option.textContent = el;
        select.appendChild(option);
    })

    form.insertBefore(select, form.lastElementChild);

    form.addEventListener('submit', e => {
        e.preventDefault();
        const [usernameInput, passwordInput, positionInput] = form.elements;
        const username = usernameInput.value;
        const password = passwordInput.value;
        const position = positionInput.value;
        fetch('/register-user', {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ username, password, position })
        })
        .then(response => response.json())
        .then(data => { addToPanel(createaDataResponse(data.response), rightPanel); });
    })
}

function deleteUser() {
    const rightPanel = document.getElementById('rightPanel');
    const htmlData = `
        <form id="detele_user">
        <input type="text" name="login" placeholder="login" required>
        <button type="submit">Удалить пользователя</button>
        </form>
    `;
    rightPanel.innerHTML = htmlData;
    document.getElementById('detele_user').addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementsByName("login")[0].value;
        fetch('/delete-user', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username })
        })
        .then(response => response.json())
        .then(data => {
            addToPanel(createaDataResponse(data.response), rightPanel);
        })
    })
}

async function editUser() {
    const rightPanel = document.getElementById('rightPanel');
    let positions = await getPositions();
    let elements = [];
    const htmlData = `
        <form id="get-info-user">
        <input type="text" name="login" placeholder="login" required>
        <button type="submit">Получить данные пользователя</button>
        </form>
    `;
    rightPanel.innerHTML = htmlData;
    function send(e) {
        if (elements.length > 0) { elements.forEach(el => el.remove()); }
        e.preventDefault();
        const username = document.getElementsByName("login")[0].value;
        const old_username = username;
        fetch('/get-user-info', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.response);
            if (data.response.length > 0) {
                console.log(data.response)
                data.response.forEach(el => {
                    Object.keys(el).forEach(key => {
                        if (key !== 'position') {
                            inputElement = document.createElement('input');
                            inputElement.type = 'text';

                        } else {
                            inputElement = document.createElement('select');
                            positions.forEach(pos => {
                                const option = document.createElement('option');
                                option.value = pos;
                                option.textContent = pos;
                                inputElement.appendChild(option);
                            })
                        }

                        inputElement.id = key;
                        inputElement.value = el[key];

                        labelElement = document.createElement('label');
                        labelElement.innerHTML = `${key}: `;

                        indentationElement = document.createElement('br');
                        
                        rightPanel.appendChild(labelElement);
                        rightPanel.appendChild(inputElement);
                        rightPanel.appendChild(indentationElement);
                        elements.push(inputElement, labelElement, indentationElement);
                    })
                })
                const formElement = document.createElement('form');
                formElement.id = "edit_user";

                const buttonElement = document.createElement('button');
                buttonElement.type = "submit";
                buttonElement.textContent = "Обновить данные пользователя";

                formElement.appendChild(buttonElement);
                elements.push(formElement);
                rightPanel.appendChild(formElement);
                document.getElementById('edit_user').addEventListener('submit', e => {
                    e.preventDefault();
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;
                    const position = document.getElementById('position').value;
                    fetch('/edit-user', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ username, password, position, old_username })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('shit');
                        const dataElement = addToPanel(createaDataResponse(data.response), rightPanel);
                        elements.forEach(el => el.remove());
                        elements.push(dataElement);
                    })
                })
            } 
            else {
                const dataElement = addToPanel(createaDataResponse('Такого пользователя не существует'), rightPanel);
                elements.push(dataElement);
            } 
        })
    }
    document.getElementById('get-info-user').addEventListener('submit', e => { send(e); })
}