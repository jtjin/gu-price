const search_main = document.getElementById('search_main');
const select_main = document.getElementById('select_main');
function mainSearchBtn() {
  if (search_main.value) {
    switch (select_main.value) {
      case '關鍵字':
        window.location.href = `/search/${search_main.value}`;
        break;
      case '商品編號':
        window.location.href = `/products/${search_main.value}`;
    }
  }
}
function mainSearch() {
  search_main.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') mainSearchBtn();
  });
}
window.onload = mainSearch();
