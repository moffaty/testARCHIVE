// Настройки маски
let maskOptions = {
    // формат 4 буквы, 6 цифр, 3 цифры (минимум)
    mask: 'aaaa.000000.000-00.00',
    lazy: false,
};
// Очищает от знаков маски, при определенных категориях
let decimalNumberBDregex = /[._-]/g;

// Недопустимые символы для файлов и директорий
const disallowedChars = ["\\", "/", "*",">","<","|"];

// Устанавливает маску ввода если не входит в определенные значения категорий
function MaskForCategories(categoryInput, decimalInput){
    mask = null;
    const categoriesWithOutMask = ['Эскиз','Не указано']
    let propDocCategoryValue = categoryInput.value;
    if(!categoriesWithOutMask.includes(propDocCategoryValue)){
        mask = new IMask(decimalInput,maskOptions);
    } else {
        decimalInput.value = decimalInput.value.replace(decimalNumberBDregex,'');
        if (mask) {
            mask.destroy();
            decimalInput.required = false;
        }
}}