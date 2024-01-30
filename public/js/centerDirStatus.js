window.onload = () => {
    const timeStart = performance.now();

    const centerDir = document.querySelector('.centerDir');

    const dirsOfTree = document.querySelectorAll('[data-path]');
    const filesOfTree = centerDir.querySelectorAll('[data-filepath]');

    dirsOfTree.forEach(dir => {
        const pathsOfTreeDir = dir.getAttribute('data-path');
        filesOfTree.forEach(centerDir => {
            if (centerDir.className === 'dir' && centerDir.getAttribute('data-filepath') + '/' === pathsOfTreeDir) {
                centerDir.style.color = dir.style.color;
            }
            const filepath = centerDir.getAttribute('data-filepath').replaceAll('\\','/');
            const listOfStatuses = {"Не проверено": "#fc6262", "В разработке": "#439437"};
            const item = localStorage.getItem(filepath);
            if(item){
                centerDir.style.color = listOfStatuses[item];
            } else {
                for (const statusedFile of listOfStatusedFiles) { // path, status
                    if (statusedFile.path.includes(filepath)) {
                        centerDir.style.color = listOfStatuses[statusedFile.status];
                        return;
                    }
                }
            }
        });
    });

    const selectedFile = () => {
        const selectedName = decodeURIComponent(localStorage.getItem('selected'));
        if(selectedName){
            const index = liValues.indexOf(selectedName);
            if (index !== -1) {
                const selector = `a[data-filename="${selectedName}"]`;
                const selectedElement = centerDir.querySelector(selector);

                selectedElement.parentNode.classList.add('fade-out');

                const containerRect = centerDir.getBoundingClientRect();
                const elementRect = selectedElement.getBoundingClientRect();
                if (elementRect.top >= containerRect.bottom) {
                    centerDir.scrollTop = elementRect.x - centerDir.offsetTop;
                }
                localStorage.removeItem('selected');
            }
        }
    };
    selectedFile();
    const timeEnd = performance.now();
    console.log(`work time is: ${timeEnd - timeStart} мс`);
};