// Получаем ссылки на все файлы в списке
const fileLinks = document.querySelectorAll('.file a');

const rightPanel = document.querySelector('#rightPanel');
const headerPreview = rightPanel.querySelector('#headerPreview');
const iframe = rightPanel.querySelector('#pfdPreview');

// Перебираем все ссылки и добавляем обработчик события на клик
function updatePreview(filePath, title) {
    const listOfFilePath = filePath.split('/');
    if(listOfFilePath[listOfFilePath.length - 1] !== 'instructions.pdf'){
        if (filePath.endsWith('.pdf') || filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
            localStorage.setItem('PDFthatSHOWING', filePath);
            iframe.src = filePath;
        } else if (filePath.endsWith('.doc') || filePath.endsWith('.docx')) {
            iframe.src = filePath;
        }
    }
    headerPreview.textContent = title;
    headerPreview.style.display = "block";
    iframe.style.display = "block";
}

// Обновляем содержимое при загрузке страницы
pdfSource = localStorage.getItem('PDFthatSHOWING');
if (pdfSource === null) {
    iframe.src = '/pdf/instructions.pdf';
    updatePreview('/pdf/instructions.pdf', 'Инструкция');
} else {
    fetch(pdfSource)
    .then(response => {
        if(response.ok){
            iframe.src = pdfSource;
        } else {
            iframe.src = '/pdf/instructions.pdf';
            updatePreview('/pdf/instructions.pdf', 'Инструкция');
        }
    })
    updatePreview(pdfSource, 'Предпросмотр');
}

// Перебираем все ссылки и добавляем обработчик события на клик
fileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Предотвращаем переход по ссылке
        // Получаем путь к файлу из атрибута data-filepath ссылки
        const filePath = link.getAttribute('data-filepath');
        if (filePath.endsWith('.pdf') || filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
            const fileName = link.title;
            updatePreview(filePath, 'Предпросмотр');
        }
    });

});