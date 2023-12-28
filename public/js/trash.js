document.addEventListener('DOMContentLoaded', () => {
    const trashOpenModalBtn = document.getElementById("trashFormModalButton");
    const itemsPerPage = 10; // Количество элементов на странице
    let currentPage = 1;

    trashOpenModalBtn.addEventListener("click", async function () {
        try {
            const response = await fetch('/getTrashFiles');
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const filesInTrash = await response.json();
            const trashModalForm = new mxModalView({ id: 'trashModal', className: 'modal', tag: 'div' });
            
            const renderFileList = () => {
                const startIdx = (currentPage - 1) * itemsPerPage;
                const endIdx = startIdx + itemsPerPage;
                const filesToShow = filesInTrash.slice(startIdx, endIdx);

                const fileListContent = filesToShow.map(file => `
                    <li class="file trash">
                        <a class="file deletedFiles" id="delElement" href="${file.fileName}" title="${file.fileName}">${file.fileName}</a>
                        <button class="delFile" data-file="${file.fileName}" data-uploadDateTime="${file.uploadDateTime}">Удалить</button>
                        <button class="restoreBtn" data-file="${file.fileName}" data-uploadDateTime="${file.uploadDateTime}">
                            <img class="restoreBtn" data-file="${file.fileName}" data-uploadDateTime="${file.uploadDateTime}" src="/images/recovery.png" width="20px" height="20px" alt="Восстановить" title="Восстановить">
                        </button>
                    </li>`
                ).join("");

                const totalPages = Math.ceil(filesInTrash.length / itemsPerPage) || 1;
                const paginationButtons = `
                    <div class="pagination">
                        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-action="prev">Пред.</button>
                        <span>Страница ${currentPage} из ${totalPages}</span>
                        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-action="next">След.</button>
                    </div>
                `;

                trashModalForm.SetContent(`
                    <div class="modal-content trahModal">
                        <h1>Корзина</h1>
                        <div>
                            <form style="text-align: center; margin: 0; width: 100%;">
                                <ul class="fileList-ul w3-ul" id="fileList">${fileListContent}</ul>
                                ${paginationButtons}
                                <button class="clear-trash-btn">Отчистить корзину</button>
                            </form>
                        </div>
                    </div>
                `);

                const clearTrashButton = trashModalForm.querySelector(".clear-trash-btn");

                clearTrashButton.addEventListener("click", async (event) => {
                    event.preventDefault();
                    const confirmation = confirm("Вы уверены, что хотите очистить корзину?");
                    if (confirmation) {
                        try {
                            const clearTrashResponse = await fetch('/clearTrashFiles', {
                                method: 'POST'
                            });
                
                            if (!clearTrashResponse.ok) {
                                throw new Error(`Server responded with status: ${clearTrashResponse.status}`);
                            }
                
                            const result = await clearTrashResponse.json();
                            console.log(result);
                            location.reload();
                        } catch (error) {
                            console.error('Error clearing trash:', error);
                        }
                    }
                });
                const fileList = trashModalForm.querySelector("#fileList");

                fileList.addEventListener("click", async (event) => {
                    event.preventDefault();
                
                    if (event.target.classList.contains("delFile")) {
                        const button = event.target;
                        const fileName = button.dataset.file;
                        const uploadDateTime = button.dataset.uploaddatetime;
                

                        const confirmation = confirm(`Вы уверены, что хотите удалить файл "${fileName}"?`);
                        if (confirmation) {
                        try {
                            const filePathResponse = await fetch(`/getFilePath?uploadDateTime=${uploadDateTime}`);
                            if (!filePathResponse.ok) {
                                throw new Error(`Server responded with status: ${filePathResponse.status}`);
                            }
                            const filePath = await filePathResponse.text();

                            const delFileResponse = await fetch('/delFile', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ fileSitePath: filePath, fileName: fileName, uploadDateTime: uploadDateTime })
                            });
            
                            if (!delFileResponse.ok) {
                                throw new Error(`Server responded with status: ${delFileResponse.status}`);
                            }
            
                            const result = await delFileResponse.json();
                            console.log(result);
                            location.reload();
                        } catch (error) {
                            console.error('Error deleting file:', error);
                        }
                    }    
                    }
                });

                fileList.addEventListener("click", async (event) => {
                    event.preventDefault();
                    if (event.target.classList.contains("restoreBtn")) {
                        const button = event.target;

                        const fileName = button.dataset.file;
                        const uploadDateTime = button.dataset.uploaddatetime;

                        try {
                            const filePathResponse = await fetch(`/getFilePath?uploadDateTime=${uploadDateTime}`);
                            if (!filePathResponse.ok) {
                                throw new Error(`Server responded with status: ${filePathResponse.status}`);
                            }
                            const filePath = await filePathResponse.text();

                            const restoreResponse = await fetch('/restoreFile', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ fileSitePath: filePath, fileName: fileName, uploadDateTime: uploadDateTime })
                            });

                            if (!restoreResponse.ok) {
                                throw new Error(`Server responded with status: ${restoreResponse.status}`);
                            }

                            const result = await restoreResponse;
                            const url = result.url.split('/');
                            url.pop();
                            localStorage.setItem('selected', decodeURIComponent(fileName));
                            window.location = url.join('/');                            
                        } catch (error) {
                            console.error('Error restoring file:', error);
                        }
                    }
                });
                const pagination = trashModalForm.querySelector(".pagination");
                pagination.addEventListener("click", (event) => {
                    event.preventDefault();
                    const action = event.target.dataset.action;
                    if (action === "prev" && currentPage > 1) {
                        currentPage--;
                        renderFileList();
                    } else if (action === "next" && currentPage < totalPages) {
                        currentPage++;
                        renderFileList();
                    }
                });
            };

            renderFileList(); // Вызываем без аргументов
        } catch (error) {
            console.error('Error fetching or parsing data:', error);
        }
    });
});