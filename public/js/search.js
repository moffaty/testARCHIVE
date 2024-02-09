document.getElementById('searchFormModalButton').addEventListener('click', e => {
    const searchModal = new mxModalView({id: 'search', className: 'modal', tag: 'div'});
    searchModal.SetContent(`
    <div style="flex-grow: 1;">
      <form id="search" action="/search" style="display: flex; justify-content: space-between; align-items: center; margin: 0;">
        <input type="text" name="query" placeholder="Поиск" style="margin-right: 0.625em;">
        <button type="submit" class="modalButton" style="position: relative;bottom: 0.1875em;">Найти</button>
      </form>
      <div id="searchResults"></div>
    </div>
    <div style="border-left: 0.125em solid rgb(147, 160, 147, 0.550); margin-left: 0.625em"></div>
      <div id="searchOptions" style="margin-left: 1.25em;width: 45vh;">
        <h4>Выберите параметры поиска <img src="/images/info.png" width=20px height=20px title="Поиск будет по выбранным категориям"></h4>
        <div>
          <form style="padding: 0; margin: 0;">
            <label><input class="searchCheckBox" type="checkbox" name="filename">Заголовок</label>  
            <label><input class="searchCheckBox" type="checkbox" name="decimalNumber">Децимальный номер</label>
            <label><input class="searchCheckBox" type="checkbox" name="status">Статус</label>
            <label><input class="searchCheckBox" type="checkbox" name="nameProject">Название проекта</label>
            <label><input class="searchCheckBox" type="checkbox" name="organisation">Организация</label>
            <label><input class="searchCheckBox" type="checkbox" name="">Дата создания</label>
          </form>
        </div>
      </div>
    `);
    searchModal.SetStyles({ overflow: 'hidden', top: '50%', padding: '0.625em', display: 'flex' });
    let category = 'Заголовок';
    let countOfDirection = 0;
    let direction = 0;
    const searchFormModalBtn = document.getElementById('searchFormModalButton');
    const searchResultsContainer = document.getElementById('searchResults');

    searchResultsContainer.style.display = 'block';

    searchResultsContainer.innerHTML = `
            <div class="search-results" style="width: 104vh;">
              <table>
                <thead style="height: 7.4vh;">
                  <tr>
                    <th class="category" style="width: 18.4vh;">Заголовок</th>
                    <th class="category">Децимальный номер</th>
                    <th class="category">Статус</th>
                    <th class="category">Название проекта</th>
                    <th class="category">Организация</th>
                    <th class="category">Дата создания</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>`;

    searchFormModalBtn.addEventListener('click', () => {
      searchModal.style.display = 'block';
      searchModal.querySelector('input[type="text"]').focus();
    });

    searchModal.element.addEventListener('click', event => {
      if (event.target === searchModal) {
        searchModal.style.display = 'none';
      }
    });

    // Функция для выполнения запроса и обновления таблицы
    function performSearch() {
        const searchQueryInput = searchModal.querySelector('input[name="query"]');
        const searchCheckBox = searchModal.querySelectorAll('input[type="checkbox"]');
        let options = '';
        searchCheckBox.forEach(checkBox => {
        if (checkBox.checked) { options += `${checkBox.name}&`; }
        })
        const searchQuery = searchQueryInput ? searchQueryInput.value : '';

        fetch(`/search?query=${encodeURIComponent(searchQuery)}&options=${encodeURIComponent(options)}&categories=${encodeURIComponent(category)}&direction=${encodeURIComponent(direction)}`)
        .then(response => response.json())
        .then(data => {
            // если данные есть - заполняем таблицу данными
            let tableRows;
            if(data[0]) { 
            searchModal.querySelector('.modal-content').style.top = '50%';
            tableRows = data.map(({ filename, decimalNumber, status, nameProject, uploadDateTime, path, organisation }) => {
                const colorStatus = (status) => {
                const listOfStatuses = {"Не проверено": "#fc6262", "В разработке": "#439437"};
                return listOfStatuses[status];
                }
                const fileLink = withoutFile(path);
                return `
                <tr>
                    <td class="table_filename" title="${filename}"><a class="searchlink" data-relocation="${fileLink}" href="${path}">${filename}</a></td>
                    <td>${decimalNumber}</td>
                    <td style="color: ${colorStatus(status)} ">${status}</td>
                    <td>${nameProject === null ? 'Не указано' : nameProject}</td>
                    <td>${organisation === null ? 'Не указано' : organisation}</td>
                    <td>${uploadDateTime}</td>
                </tr>`;
            }).join('');
            // иначе заполняем надписью
            } else {
            tableRows = `<p style="display:flex;justify-content:space-around">По вашему запросу ничего не найдено. Попробуйте изменить запрос или изменить параметры поиска</p>`;
            }

            searchResultsContainer.innerHTML = `
            <div class="search-results" style="width: 104vh;">
                <table>
                <thead style="height: 7.4vh;">
                    <tr>
                    <th class="category" style="width: 18.4vh;">Заголовок<span class="sort-arrow"></span></th>
                    <th class="category">Децимальный номер<span class="sort-arrow"></span></th>
                    <th class="category">Статус<span class="sort-arrow"></span></th>
                    <th class="category">Название проекта<span class="sort-arrow"></span></th>
                    <th class="category">Организация<span class="sort-arrow"></span></th>
                    <th class="category">Дата создания<span class="sort-arrow"></span></th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
                </table>
            </div>`;

            // Обновляем обработчики событий для новых элементов .category
            const categories = searchResultsContainer.querySelectorAll('.category');
            categories.forEach(tableCategory => {
                const sortBy = tableCategory.textContent;

                if (sortBy === category) {
                    tableCategory.querySelector('.sort-arrow').classList.toggle('sort-arrow-up', direction === 1);
                    tableCategory.querySelector('.sort-arrow').classList.toggle('sort-arrow-down', direction === 0);
                } else {
                    // Сбрасываем стрелочки для остальных столбцов
                    tableCategory.querySelector('.sort-arrow').classList.remove('sort-arrow-up');
                    tableCategory.querySelector('.sort-arrow').classList.remove('sort-arrow-down');
                }
                tableCategory.style.cursor = 'pointer';
                tableCategory.addEventListener('click', (event) => {
                category = tableCategory.textContent;
                countOfDirection++;
                if(countOfDirection % 2 == 0){
                    direction = 0;
                    countOfDirection = 0;
                } else {
                    direction = 1;
                }
                performSearch(); // Вызываем функцию повторно при изменении category
                })
            })
            })
        .catch(error => console.error('Ошибка при поиске:', error));
    }

    // Обработчик события submit для формы поиска
    searchModal.element.addEventListener('submit', event => {
      event.preventDefault();
      performSearch(); // Вызываем функцию выполнения запроса и обновления таблицы
    });

    function withoutFile(path) {
      path = path.split('/');
      path.pop(0);
      return path.join('/');
    }

    searchResultsContainer.addEventListener('click', event => {
      if (event.target.matches('.searchlink')) {
        event.preventDefault();
        const href = event.target.href;
        const filename = href.split('/').pop();
        localStorage.setItem('selected', decodeURIComponent(filename));
        window.location.href = event.target.getAttribute('data-relocation');
      }
    });
})