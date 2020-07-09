const searchMain = document.getElementById('search_main');
const selectMain = document.getElementById('select_main');

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
