/* Product */
const product = {};
async function getAllProducts() {
  const name = window.location.pathname.split('/');
  const result = await fetch(`/api/1.0/products/${name[1]}?type=${name[2]}&paging=0`).then((res) => res.json());
  document.title = `${result.data[0].type} | GU 比價 | GU 搜尋`;
  createProducts(result);
}
function createProducts(result) {
  const view_title = document.getElementById('view_title');
  view_title.innerHTML = result.data[0].type;
  const products = document.getElementById('products');
  for (let i = 0; i < result.data.length; i += 1) {
    // Create <a class='prdocut'>
    const a = document.createElement('a');
    a.setAttribute('class', 'product');
    a.setAttribute('href', `/products/${result.data[i].number}`);
    // Create <img>, <div clsas='colors'>
    const img = document.createElement('img');
    img.setAttribute('src', result.data[i].main_image);
    a.appendChild(img);
    // Create <div clsas='name'>
    const div_name = document.createElement('div');
    div_name.setAttribute('class', 'name');
    div_name.innerHTML = result.data[i].name;
    a.appendChild(div_name);
    // Create <div clsas='number'>
    const div_number = document.createElement('div');
    div_number.setAttribute('class', 'number');
    div_number.innerHTML = result.data[i].number;
    a.appendChild(div_number);
    // Create <div clsas='price'>
    const div_price = document.createElement('div');
    div_price.setAttribute('class', 'price');
    div_price.innerHTML = `$${result.data[i].highest_price} ⇢ $${result.data[i].current_price}`;
    a.appendChild(div_price);
    products.appendChild(a);
  }
  product.data = result.data;
  product.next_paging = result.next_paging;
}
// Scroll to bottom, show more products
window.addEventListener('scroll', async () => {
  // Height of scroll bar
  const scrollBarHeight = document.documentElement.scrollTop;
  // Height of whole page
  const pageHeight = document.documentElement.scrollHeight;
  // Height of browser view
  const viewHeight = document.documentElement.clientHeight;
  if (pageHeight - (scrollBarHeight + viewHeight) < 300 && product.next_paging && product.data) {
    const name = window.location.pathname.split('/');
    product.data = null; // Clear product.data
    const result = await fetch(`/api/1.0/products/${name[1]}?type=${name[2]}&paging=${product.next_paging}`).then((res) => res.json());
    createProducts(result);
  }
});

window.onload = getAllProducts();
