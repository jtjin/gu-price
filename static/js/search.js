/* Product */
const product = {};
async function getAllProducts() {
  const name = window.location.pathname.substr(8);
  const result = await fetch(`/api/1.0/products/search?keyword=${name}&paging=0`).then((res) => res.json());
  createProducts(result);
}
function createProducts(result) {
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
    const divName = document.createElement('div');
    divName.setAttribute('class', 'name');
    divName.innerHTML = result.data[i].name;
    a.appendChild(divName);
    // Create <div clsas='number'>
    const divNumber = document.createElement('div');
    divNumber.setAttribute('class', 'number');
    divNumber.innerHTML = result.data[i].number;
    a.appendChild(divNumber);
    // Create <div clsas='price'>
    const divPrice = document.createElement('div');
    divPrice.setAttribute('class', 'price');
    divPrice.innerHTML = `$${result.data[i].highest_price} ⇢ $${result.data[i].current_price}`;
    a.appendChild(divPrice);
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
    const name = window.location.pathname.substr(8);
    product.data = null; // Clear product.data
    const result = await fetch(`/api/1.0/products/search?keyword=${name}&paging=${product.next_paging}`).then((res) => res.json());
    createProducts(result);
  }
});

window.onload = getAllProducts();
