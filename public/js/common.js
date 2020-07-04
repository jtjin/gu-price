function headerSearch() {
  const number = document.getElementById('search_header').value;
  if (number) {
    window.location.href = `/products/${number}`;
  }
}
