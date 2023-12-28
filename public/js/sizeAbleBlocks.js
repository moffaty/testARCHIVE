// <!-- Здесь определено поведение блоков, что можно изменять -->
const dirTrees = document.querySelectorAll(".sizeAble");

for (let i = 0; i < dirTrees.length; i++) {
const dirTree = dirTrees[i];

// Создаем новый ResizeObserver
const resizeObserver = new ResizeObserver(entries => {
    // Обрабатываем каждую запись (entry)
    for (let entry of entries) {
    if (entry.target === dirTree) {
        const newWidth = entry.contentRect.width;
        localStorage.setItem(`dirTreeWidth_${i}`, newWidth);
    }
    }
});

// Начинаем отслеживание изменений размеров элемента
resizeObserver.observe(dirTree);

// Восстанавливаем сохраненное значение ширины элемента при загрузке страницы
const savedWidth = localStorage.getItem(`dirTreeWidth_${i}`);
if (savedWidth) {
    dirTree.style.width = savedWidth + "px";
}
}
