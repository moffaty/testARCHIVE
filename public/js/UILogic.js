window.addEventListener('load', () => {
    var pageLoadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
    console.log('Page load time: ' + pageLoadTime + ' milliseconds');
});

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
getMainPath()
    .then(data => {
        mainPath = data.path;
        if (currentPath === '/') {
            currentPath = mainPath;
        }
        getDirIncludes(mainPath)
        .then(data => {
            updateLeftList(list, data, mainPath);
        })
        .catch(error => {
            console.error(error);
        });
        getDirIncludes(currentPath)
        .then(data => {
            updateList(center, data, currentPath);
            updateFolderName();
        })
        .catch(error => {
            console.error(error);
        });
    })

document.getElementById('backButton').addEventListener('click', (event) => {
    console.log(currentPath);
    if (currentPath === mainPath) {
        return;
    }
    currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    console.log(currentPath);
    updateFolderName();
    updateLocalStorage();
    getDirIncludes(currentPath)
    .then(data => {
        updateFolderName();
        updateList(center, data);
    })
})