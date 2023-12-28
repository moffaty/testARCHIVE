const folderToggleButtons = document.querySelectorAll('.folder-toggle');
const openFolder = document.querySelectorAll('.openFolder');
let listOfStatusedFiles = new Set();
let listOfStatusedPaths = new Set();

openFolder.forEach(some => {
    if (some.classList.contains('openFolder')){
        some.addEventListener('click', (event) => {
            event.preventDefault();
            const nextButton = some.nextElementSibling;
            const ul = nextButton.parentElement.nextElementSibling;
            const ulId = ul.id;
            const isHidden = localStorage.getItem(ulId);
            nextButton.classList.toggle('opened');
            if (isHidden !== 'active') {
                some.innerHTML = `<img src="/images/free-icon-arrow-down-sign-to-navigate-32195.png">`;
                ul.classList.remove('hidden');
                nextButton.classList.add('active'); // добавляем класс active к кнопке
                some.classList.add('active');
                localStorage.setItem(ulId,'active');
            } 
            else {
                some.innerHTML = `<img src="/images/free-icon-arrow-point-to-right-32213.png">`;
                ul.classList.add('hidden');
                nextButton.classList.remove('active'); // удаляем класс active с кнопки
                some.classList.remove('active'); // удаляем класс active с кнопки
                localStorage.setItem(ulId,'hidden');
            }
        })
    }
})

for (const button of folderToggleButtons) {
    button.addEventListener('click', () => {
        const path = button.getAttribute('data-path');
        window.location.href = `${path}`;
    });
}

// fetch('/get-status', {
//     method: 'POST',
// })
// .then(response => response.json())
// .then(data => {
//     let listOfIsFilesChecked = data;
//     let last;
//     const treeOfDirs = document.getElementById('dir_tree');
//     treeOfDirs.querySelectorAll('.file a').forEach(a => {
//         const dataFilePath = a.getAttribute('data-filepath');
//         // ищем объект в массиве listOfIsFilesChecked с соответствующим значением path
//         const fileData = listOfIsFilesChecked.find(data => data.path === dataFilePath);
//         if (fileData) {
//             // если объект найден, устанавливаем атрибут "data-status"
//             a.setAttribute('data-status', fileData.status);
//             const listOfStatuses = {"Не проверено": "#fc6262", "В разработке": "#439437"};
//             if(fileData.status === 'Не проверено' || fileData.status === 'В разработке'){
//                 a.style.color = listOfStatuses[fileData.status];
//                 a.title += ' ' + fileData.status.toLowerCase();
//                 let dirPath = fileData.path.split('/');
//                 dirPath.pop();
//                 dirPath = dirPath.join('/')
//                 localStorage.setItem(decodeURIComponent(fileData.path),(fileData.status));
//                 if (!listOfStatusedPaths.has(dirPath)) {
//                     listOfStatusedFiles.add({path:dirPath, status:fileData.status});
//                 }
//                 listOfStatusedPaths.add(dirPath);
//                 // localStorage.setItem(decodeURIComponent(dirPath.join('/')),(fileData.status));
//                 let button = a.parentNode.parentNode.parentNode.querySelector('.folder-toggle');
//                 let buttonid = button.id; // button id
//                 console.log(buttonid);
//                 while(buttonid !== 'hiddenButton'){
//                     document.getElementById(buttonid).style.color = a.style.color;
//                     last = buttonid.lastIndexOf('/');
//                     if(last === -1){
//                         buttonid = 'hiddenButton';
//                         break;
//                     }
//                     buttonid = buttonid.slice(0,last);
//                 }
//             } else {
//                 if(localStorage.getItem(fileData.path)){
//                     localStorage.removeItem(fileData.path);
//                     listOfStatusedFiles.delete(fileData.path);
//                     // localStorage.removeItem(dirPath.join('/'));
//                 }
//             } 
//         }
//     });
// })
// .catch(error => console.error(error));