const resizeCenterUl = () => {
    centerDir.querySelectorAll('li').forEach(li => {
        len = (li.querySelector('a').textContent.length)
        if (len > 40) {
            li.style.height = 40 * len/40 + 'px';
        }
    })
}
resizeCenterUl();