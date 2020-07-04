function mainSearch() {
  const number = document.getElementById('search_main').value;
  if (number) {
    window.location.href = `/products/${number}`;
  }
}
