const searchMain = document.getElementById('search_main');
const selectMain = document.getElementById('select_main');
const imageSearchIcon = document.getElementById('image_search_icon');
const imageSearchFile = document.getElementById('image_search_file');
const imageSearchSubmit = document.getElementById('image_search_submit');
const imageSearchText = document.getElementById('image_search_text');

function isValid(str) {
  return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?\ ]/g.test(str);
}

function mainSearchBtn() {
  if (searchMain.value) {
    if (!isValid(searchMain.value)) {
      Swal.fire({
        icon: 'warning',
        title: '請勿輸入特殊符號！',
        text: '不接受空格、@、!、$、^、&...等特殊符號',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '我知道了',
      });
      return;
    }
    switch (selectMain.value) {
      case '關鍵字':
        window.location.href = `/search/${searchMain.value}`;
        break;
      case '商品編號':
        window.location.href = `/products/${searchMain.value}`;
    }
  }
}
function mainSearch() {
  searchMain.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') mainSearchBtn();
  });
}
window.onload = mainSearch();

imageSearchIcon.addEventListener('mouseover', () => {
  imageSearchText.style.display = 'inline-block';
});
imageSearchIcon.addEventListener('mouseout', () => {
  imageSearchText.style.display = 'none';
});
imageSearchIcon.addEventListener('click', () => {
  imageSearchFile.click();
});
imageSearchFile.addEventListener('change', () => {
  if (/\.(jpe?g|png)$/i.test(imageSearchFile.files[0].name) === false) {
    Swal.fire({
      icon: 'error',
      title: '請上傳正確圖片格式！',
      text: '只接受 JPG/JPEG/PNG 圖檔',
      confirmButtonColor: '#3085d6',
      confirmButtonText: '我知道了',
    });
  } else {
    imageSearchSubmit.click();
    Swal.fire({
      imageUrl: '/static/imgs/spinner.gif',
      title: '圖片上傳中...',
      showConfirmButton: false,
      allowOutsideClick: false,
    });
  }
});
