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
      alert('請勿輸入符號');
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
imageSearchIcon.addEventListener('click', async () => {
  imageSearchFile.click();
});
imageSearchFile.addEventListener('change', async () => {
  // const fd = new FormData()
  // fd.append('imageSearch', imageSearchFile.files[0])
  // const result = await fetch('/api/1.0/products/imageSearch', {
  //   method: 'POST',
  //   body: fd
  // }).then(res => res.json())
  // console.log(result)
  imageSearchSubmit.click();
});
