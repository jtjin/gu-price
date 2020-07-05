const search_header = document.getElementById('search_header');
const menu_img = document.getElementById('menu_img');
const menu_list = document.getElementById('menu_list');

menu_img.addEventListener('click', () => {
  if (menu_list.className == 'show') {
    menu_list.classList.remove('show');
  } else {
    menu_list.classList.add('show');
  }
});
function headerSearchBtn() {
  if (search_header.value) {
    window.location.href = `/search/${search_header.value}`;
  }
}
function headerSearch() {
  search_header.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') headerSearchBtn();
  });
}
window.onload = headerSearch();
